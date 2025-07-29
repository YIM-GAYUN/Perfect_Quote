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

  const addMessage = useCallback(
    (content: string, isBot: boolean = false): ChatMessage => {
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
    },
    []
  );

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

        console.log("📡 API 응답 받음:", {
          status: response.status,
          hasQuote: !!response.quote,
          hasQuoteSelection: !!response.quote_selection,
          quoteSelectionActive: response.quote_selection?.active,
          content: response.content?.substring(0, 50) + "..."
        });

        if (response.status === "completed" || response.status === "quote_selected") {
          // 명언 선택 완료 처리 (최우선)
          if (response.quote && !response.quote_selection?.active) {
            console.log("✅ 명언 선택 완료:", response.quote);
            if (response.content) {
              addMessage(response.content, true);
            }
            setChatState((prev) => ({
              ...prev,
              selectedQuote: response.quote,
              currentStep: 10, // 완료 단계 (LoadingOverlay 표시)
              isLoading: false, // 로딩 상태 해제
            }));
            
            // 결과 페이지로 이동
            setTimeout(() => {
              const quote = response.quote;
              if (quote) {
                const params = new URLSearchParams({
                  date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
                  dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
                  quote: quote.text,
                  author: quote.author,
                  keywords: quote.keywords?.join(',') || '',
                  context: quote.advice || ''
                });
                window.location.href = `/result?${params.toString()}`;
              } else {
                window.location.href = '/result';
              }
            }, 2000); // 2초 후 이동
          }
          // 명언 선택 모드 처리 (다음 명언 제시)
          else if (response.quote_selection?.active && response.quote) {
            console.log("🔄 명언 선택 모드 활성화:", response.quote_selection);
            console.log("📝 새로운 명언 내용:", response.content);
            
            // AI 응답을 봇 메시지로 추가 (content가 있으면)
            if (response.content) {
              console.log("✅ addMessage 호출:", response.content.substring(0, 50) + "...");
              addMessage(response.content, true); // 봇 응답으로 추가
            } else {
              console.log("⚠️ response.content가 없음 - 명언 선택 모드에서 응답 없음");
            }
            
            setChatState((prev) => ({
              ...prev,
              selectedQuote: response.quote,
              currentStep: 2, // 명언 선택 단계
              isLoading: false, // 로딩 상태 해제
            }));
          }
          // 일반 대화 처리
          else {
            // 일반 대화에서는 AI 응답 추가
            if (response.content) {
              addMessage(response.content, true);
            }
            
            // 대화 턴 수 계산 (사용자 메시지 수)
            const userMessageCount = chatState.messages.filter(msg => !msg.isBot).length;
            
            // 백엔드에서 분석이 시작되었는지 확인 (analysis_complete 또는 advice가 있으면)
            const analysisStarted = response.analysis_complete || response.advice;
            
            // 20턴에 도달했거나 분석이 시작되었는지 확인
            if (userMessageCount >= 20 || analysisStarted) {
              console.log("🎯 분석 단계 진입:", { userMessageCount, analysisStarted });
              setChatState((prev) => ({
                ...prev,
                currentStep: 10, // 분석 단계
                isLoading: false,
              }));
            } else {
              // 일반 대화에서는 currentStep을 증가시키지 않음 (20턴까지 입력 가능)
              setChatState((prev) => ({
                ...prev,
                isLoading: false, // 로딩 상태 해제
              }));
            }
          }
          
          // isLoading은 각 조건에서 개별적으로 처리
          // setChatState((prev) => ({ ...prev, isLoading: false }));
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
                addMessage(
                  "죄송합니다. 응답을 받아오는 중 문제가 발생했습니다.",
                  true
                );
                setChatState((prev) => ({ ...prev, isLoading: false }));
              },
              () => {
                setChatState((prev) => ({ ...prev, isLoading: false }));
              }
            );
          } else {
            // 폴링 모드
            stopPollingRef.current = pollStatus(
              userId,
              threadNum,
              (statusResponse) => {
                if (statusResponse.status === "completed" || statusResponse.status === "quote_selected") {
                  // 명언 선택 완료 처리 (최우선)
                  if (statusResponse.quote && !statusResponse.quote_selection?.active) {
                    console.log("✅ 명언 선택 완료 (폴링):", statusResponse.quote);
                    if (statusResponse.content) {
                      addMessage(statusResponse.content, true);
                    }
                    setChatState((prev) => ({
                      ...prev,
                      selectedQuote: statusResponse.quote,
                      currentStep: 10, // 완료 단계 (LoadingOverlay 표시)
                      isLoading: false, // 로딩 상태 해제
                    }));
                    
                    // 결과 페이지로 이동
                    setTimeout(() => {
                      const quote = statusResponse.quote;
                      if (quote) {
                        const params = new URLSearchParams({
                          date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
                          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
                          quote: quote.text,
                          author: quote.author,
                          keywords: quote.keywords?.join(',') || '',
                          context: quote.advice || ''
                        });
                        window.location.href = `/result?${params.toString()}`;
                      } else {
                        window.location.href = '/result';
                      }
                    }, 2000); // 2초 후 이동
                  }
                  // 명언 선택 모드 처리 (다음 명언 제시)
                  else if (statusResponse.quote_selection?.active && statusResponse.quote) {
                    console.log("🔄 명언 선택 모드 활성화 (폴링):", statusResponse.quote_selection);
                    console.log("📝 새로운 명언 내용 (폴링):", statusResponse.content);
                    
                    // AI 응답을 봇 메시지로 추가 (content가 있으면)
                    if (statusResponse.content) {
                      console.log("✅ addMessage 호출 (폴링):", statusResponse.content.substring(0, 50) + "...");
                      addMessage(statusResponse.content, true); // 봇 응답으로 추가
                    } else {
                      console.log("⚠️ statusResponse.content가 없음 - 명언 선택 모드에서 응답 없음 (폴링)");
                    }
                    
                    setChatState((prev) => ({
                      ...prev,
                      selectedQuote: statusResponse.quote,
                      currentStep: 2, // 명언 선택 단계
                      isLoading: false, // 로딩 상태 해제
                    }));
                  }
                  // 일반 대화 처리
                  else {
                    // 일반 대화에서는 AI 응답 추가
                    if (statusResponse.content) {
                      addMessage(statusResponse.content, true);
                    }
                    
                    // 대화 턴 수 계산 (사용자 메시지 수)
                    const userMessageCount = chatState.messages.filter(msg => !msg.isBot).length;
                    
                    // 백엔드에서 분석이 시작되었는지 확인 (analysis_complete 또는 advice가 있으면)
                    const analysisStarted = statusResponse.analysis_complete || statusResponse.advice;
                    
                    // 20턴에 도달했거나 분석이 시작되었는지 확인
                    if (userMessageCount >= 20 || analysisStarted) {
                      console.log("🎯 분석 단계 진입 (폴링):", { userMessageCount, analysisStarted });
                      setChatState((prev) => ({
                        ...prev,
                        currentStep: 10, // 분석 단계
                        isLoading: false,
                      }));
                    } else {
                      // 일반 대화에서는 currentStep을 증가시키지 않음 (20턴까지 입력 가능)
                      setChatState((prev) => ({
                        ...prev,
                        isLoading: false, // 로딩 상태 해제
                      }));
                    }
                  }
                  
                  // isLoading은 각 조건에서 개별적으로 처리
                  // setChatState((prev) => ({ ...prev, isLoading: false }));
                }
              },
              (error) => {
                console.error("Polling error:", error);
                addMessage(
                  "죄송합니다. 응답을 받아오는 중 문제가 발생했습니다.",
                  true
                );
                setChatState((prev) => ({ ...prev, isLoading: false }));
              }
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
                  "많은 것을 이야기해주시는군요. 계속 들어보고 싶어요.";
                break;
              case 4:
                botResponse =
                  "정말 깊이 있는 이야기네요. 더 나누고 싶은 말씀이 있으신가요?";
                break;
              case 5:
                botResponse =
                  "당신의 마음을 잘 이해할 수 있을 것 같아요. 조금 더 들려주세요.";
                break;
              case 6:
                botResponse =
                  "이런 감정들이 자연스러운 것 같아요. 어떻게 극복하고 계신가요?";
                break;
              case 7:
                botResponse =
                  "정말 용기 있는 분이시군요. 그 마음이 전해집니다.";
                break;
              case 8:
                botResponse =
                  "많은 이야기를 나누어주셔서 감사해요. 마지막으로 하고 싶은 말씀이 있나요?";
                break;
              case 9:
                botResponse =
                  "충분히 이해됩니다. 당신의 마음을 어루만져줄 수 있는 따뜻한 말을 전해드릴게요.";

                // 9단계(10번째 대화)에서 명언 분석 시작
                setTimeout(() => {
                  addMessage("🔍 당신의 이야기를 분석하고 있습니다...", true);

                  setTimeout(() => {
                    addMessage("💭 맞춤 조언을 준비하고 있습니다...", true);

                    setTimeout(() => {
                      addMessage("✨ 3개의 명언 후보를 찾았습니다!", true);

                      setTimeout(() => {
                        // 더 다양한 명언 제시
                        const selectedQuote =
                          mockQuotes[
                            Math.floor(Math.random() * mockQuotes.length)
                          ];
                        addMessage(
                          `다음 명언은 어떠신가요?\n\n💬 "${selectedQuote.text}"\n✍️ 저자: ${selectedQuote.author}\n📊 유사도: 0.892\n\n이 명언을 선택하시겠습니까? (예/아니오)`,
                          true
                        );

                        // 명언 선택 모드로 전환
                        setChatState((prev) => ({
                          ...prev,
                          selectedQuote: selectedQuote,
                        }));
                      }, 1000);
                    }, 1000);
                  }, 1000);
                }, 500);
                break;
              default:
                if (currentStep < 9) {
                  botResponse = "네, 계속 이야기해주세요. 잘 듣고 있어요.";
                } else {
                  botResponse = "답변을 생성하고 있습니다...";
                }
            }

            if (currentStep < 9) {
              addMessage(botResponse, true);
            }
            setChatState((prev) => ({ ...prev, isLoading: false }));
          }, 1500);
        } else {
          // 프로덕션 환경에서는 에러 메시지만 표시
          addMessage(
            "죄송합니다. 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
            true
          );
          setChatState((prev) => ({ ...prev, isLoading: false }));
        }
      }

      // 단계 증가는 명언 선택 모드에서 수동으로 관리됨
      // setChatState((prev) => ({
      //   ...prev,
      //   currentStep: prev.currentStep + 1,
      // }));
    },
    [
      chatState.currentStep,
      chatState.isLoading,
      addMessage,
      updateLastBotMessage,
      userId,
      threadNum,
    ]
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
      const newQuote =
        mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
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
