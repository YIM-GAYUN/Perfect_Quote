import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ChatState, Quote, ChatRequest } from "../types";
import {
  sendMessage as apiSendMessage,
  pollStatus,
  createStreamingConnection,
  generateUserId,
  generateThreadNum,
  API_CONFIG,
} from "../services/api";

// 모의 명언 데이터 (백업용)
const mockQuotes: Quote[] = [
  {
    id: "1",
    text: '"가장 어두운 밤도 결국은 끝나고, 해는 떠오른다."',
    author: "빅터 위고",
    category: "hope",
  },
  {
    id: "2",
    text: '"실패는 성공의 어머니다."',
    author: "토마스 에디슨",
    category: "motivation",
  },
  {
    id: "3",
    text: '"오늘 할 수 있는 일을 내일로 미루지 말라."',
    author: "벤자민 프랭클린",
    category: "productivity",
  },
];

// 초기 봇 메시지
const getWelcomeMessage = (): string => {
  const isDev = process.env.NODE_ENV === "development";
  const baseMessage = `안녕하세요! 
딱 맞는 말에 오신 것을 환영합니다.
당신의 사연을 들려주시면 챗봇이 알맞은 명언을 출력해드려요.`;

  if (isDev) {
    return `${baseMessage}

💡 개발 모드에서 실행 중입니다. API 서버가 없어도 대화형 모의 응답을 제공합니다.`;
  }

  return baseMessage;
};

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: "welcome",
        content: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date(),
      },
    ],
    currentStep: 0,
    isLoading: false,
    selectedQuote: undefined,
  });

  // API 관련 상태
  const [userId] = useState(() => generateUserId());
  const [threadNum] = useState(() => generateThreadNum());
  const stopPollingRef = useRef<(() => void) | null>(null);
  const stopStreamingRef = useRef<(() => void) | null>(null);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
      if (stopStreamingRef.current) {
        stopStreamingRef.current();
      }
    };
  }, []);

  const addMessage = useCallback((content: string, isBot: boolean = false): ChatMessage => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isBot,
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, []);

  const updateLastBotMessage = useCallback((content: string) => {
    setChatState((prev) => {
      const updatedMessages = [...prev.messages];
      const lastMessageIndex = updatedMessages.length - 1;

      if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].isBot) {
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          content,
        };
      }

      return {
        ...prev,
        messages: updatedMessages,
      };
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (chatState.isLoading) return;

      // 기존 폴링/스트리밍 연결 정리
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
      if (stopStreamingRef.current) {
        stopStreamingRef.current();
      }

      // 사용자 메시지 추가
      addMessage(content, false);

      // 로딩 상태 시작
      setChatState((prev) => ({ ...prev, isLoading: true }));

      try {
        // 1. API로 메시지 전송
        const request: ChatRequest = {
          userId,
          threadNum,
          content,
          timestamp: new Date().toISOString(),
        };

        const response = await apiSendMessage(request);

        if (response.status === "completed") {
          // 즉시 완료된 경우
          if (response.content) {
            addMessage(response.content, true);
          }
          if (response.quote) {
            const quoteMessage = `${response.quote.text} — ${response.quote.author}`;
            addMessage(quoteMessage, true);
            setChatState((prev) => ({
              ...prev,
              selectedQuote: response.quote,
            }));
          }
          setChatState((prev) => ({ ...prev, isLoading: false }));
        } else if (response.status === "pending") {
          // pending 상태: 스트리밍 또는 폴링 시작
          if (API_CONFIG.enableStreaming) {
            // 스트리밍 모드
            let currentBotMessage = "";
            let hasAddedBotMessage = false;

            stopStreamingRef.current = createStreamingConnection(
              userId,
              threadNum,
              (chunk) => {
                if (chunk.type === "content") {
                  if (!hasAddedBotMessage) {
                    addMessage(chunk.data, true);
                    hasAddedBotMessage = true;
                    currentBotMessage = chunk.data;
                  } else {
                    currentBotMessage += chunk.data;
                    updateLastBotMessage(currentBotMessage);
                  }
                } else if (chunk.type === "quote" && chunk.data) {
                  try {
                    const quote = JSON.parse(chunk.data);
                    const quoteMessage = `${quote.text} — ${quote.author}`;
                    addMessage(quoteMessage, true);
                    setChatState((prev) => ({
                      ...prev,
                      selectedQuote: quote,
                    }));
                  } catch (error) {
                    console.error("Quote parsing error:", error);
                  }
                }
              },
              (error) => {
                console.error("Streaming error:", error);
                addMessage("죄송합니다. 응답을 받아오는 중 문제가 발생했습니다.", true);
                setChatState((prev) => ({ ...prev, isLoading: false }));
              },
              () => {
                setChatState((prev) => ({ ...prev, isLoading: false }));
              },
            );
          } else {
            // 폴링 모드
            stopPollingRef.current = pollStatus(
              userId,
              threadNum,
              (statusResponse) => {
                if (statusResponse.status === "completed") {
                  if (statusResponse.content) {
                    addMessage(statusResponse.content, true);
                  }
                  if (statusResponse.quote) {
                    const quoteMessage = `${statusResponse.quote.text} — ${statusResponse.quote.author}`;
                    addMessage(quoteMessage, true);
                    setChatState((prev) => ({
                      ...prev,
                      selectedQuote: statusResponse.quote,
                    }));
                  }
                  setChatState((prev) => ({ ...prev, isLoading: false }));
                }
              },
              (error) => {
                console.error("Polling error:", error);
                addMessage("죄송합니다. 응답을 받아오는 중 문제가 발생했습니다.", true);
                setChatState((prev) => ({ ...prev, isLoading: false }));
              },
            );
          }
        }
      } catch (error) {
        console.error("API Error:", error);

        // 개발 환경에서는 대화형 모의 응답 제공
        if (process.env.NODE_ENV === "development") {
          // 대화 단계에 따른 적절한 응답 제공
          setTimeout(() => {
            const currentStep = chatState.currentStep;
            let botResponse = "";

            switch (currentStep) {
              case 0:
                botResponse = `${content}에 대해 말씀해주셔서 감사합니다. 더 자세히 들려주실 수 있나요?`;
                break;
              case 1:
                botResponse =
                  "그런 상황이셨군요. 정말 힘드셨을 것 같아요. 그때 어떤 기분이 드셨나요?";
                break;
              case 2:
                botResponse =
                  "마음이 많이 상하셨을 것 같아요. 이런 일들이 있을 때는 정말 지치죠. 조금 더 이야기해주세요.";
                break;
              case 3:
                botResponse =
                  "충분히 이해됩니다. 당신의 마음을 어루만져줄 수 있는 따뜻한 말을 전해드릴게요.";

                // 3단계에서는 봇 응답 후 명언 생성 중 표시
                setTimeout(() => {
                  // 명언 생성 중 로딩 버블 추가
                  const loadingMessage = addMessage("", true);

                  // 1.5초 후 명언 제공
                  setTimeout(() => {
                    // 로딩 버블 제거
                    setChatState((prev) => ({
                      ...prev,
                      messages: prev.messages.filter((msg) => msg.id !== loadingMessage.id),
                    }));

                    // 명언 추가
                    const quote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
                    const quoteMessage = `${quote.text} — ${quote.author}`;
                    addMessage(quoteMessage, true);
                    setChatState((prev) => ({
                      ...prev,
                      selectedQuote: quote,
                    }));
                  }, 1500);
                }, 500);
                break;
              default:
                botResponse = "답변을 생성하고 있습니다...";
            }

            addMessage(botResponse, true);
            setChatState((prev) => ({ ...prev, isLoading: false }));
          }, 1500);
        } else {
          // 프로덕션 환경에서는 에러 메시지만 표시
          addMessage(
            "죄송합니다. 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
            true,
          );
          setChatState((prev) => ({ ...prev, isLoading: false }));
        }
      }

      // 단계 증가 (성공/실패 여부와 관계없이)
      setChatState((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }));
    },
    [
      chatState.currentStep,
      chatState.isLoading,
      addMessage,
      updateLastBotMessage,
      userId,
      threadNum,
    ],
  );

  const confirmQuote = useCallback(() => {
    setChatState((prev) => ({ ...prev, isLoading: true }));

    // 실제로는 quote 확정 API를 호출할 수 있음
    setTimeout(() => {
      setChatState((prev) => ({ ...prev, isLoading: false }));
      // 완료 페이지로 이동하는 로직은 상위 컴포넌트에서 처리
    }, 2000);
  }, []);

  const rejectQuote = useCallback(() => {
    addMessage("다른 명언을 추천해드릴게요.", true);

    // 새로운 명언 요청 API 호출 (간단 구현)
    setTimeout(() => {
      const newQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
      const quoteMessage = `${newQuote.text} — ${newQuote.author}`;

      addMessage(quoteMessage, true);
      setChatState((prev) => ({
        ...prev,
        selectedQuote: newQuote,
      }));
    }, 1000);
  }, [addMessage]);

  const resetChat = useCallback(() => {
    // 기존 연결 정리
    if (stopPollingRef.current) {
      stopPollingRef.current();
    }
    if (stopStreamingRef.current) {
      stopStreamingRef.current();
    }

    setChatState({
      messages: [
        {
          id: "welcome",
          content: getWelcomeMessage(),
          isBot: true,
          timestamp: new Date(),
        },
      ],
      currentStep: 0,
      isLoading: false,
      selectedQuote: undefined,
    });
  }, []);

  return {
    chatState,
    sendMessage,
    confirmQuote,
    rejectQuote,
    resetChat,
    userId,
    threadNum,
  };
};
