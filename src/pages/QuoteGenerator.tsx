import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import ChatBubble from "../components/Chat/ChatBubble";
import ChatInput from "../components/Chat/ChatInput";
import ConfirmButtons from "../components/Common/ConfirmButtons";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import { useChat } from "../hooks/useChat";
import { theme } from "../styles/theme";

const ChatContainer = styled.div`
  min-height: calc(100vh - 130px);
  padding: ${theme.spacing.xl} 0;
  position: relative;

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.md} 0;
  }
`;

const MessagesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 200px; // Input 영역을 위한 여백

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding-bottom: 150px;
  }
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

interface QuoteGeneratorProps {
  onComplete?: () => void;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ onComplete }) => {
  const { chatState, sendMessage, confirmQuote, rejectQuote } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // 새 메시지가 추가될 때마다 스크롤을 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // AI 응답 도착 시 입력창에 자동 포커스
  useEffect(() => {
    if (!chatState.isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatState.isLoading, chatState.messages.length]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleConfirm = () => {
    confirmQuote();
    // 로딩이 끝나면 결과 페이지로 이동
    setTimeout(() => {
      navigate("/result");
    }, 3000);
  };

  const handleReject = () => {
    rejectQuote();
  };

  // 입력창은 항상 렌더링, placeholder만 동적으로 변경
  const inputPlaceholder = chatState.quote_selection_mode
    ? "이 명언이 마음에 드시나요? 예 / 아니오로 답해주세요"
    : "지금 어떤 생각이 드시나요?";

  return (
    <Layout currentPage="quote-generator">
      <ChatContainer>
        <MessagesContainer>
          <MessageList>
            {chatState.messages.map((message) => {
              const isQuoteMessage =
                message.isBot &&
                (message.content.includes('"') ||
                  message.content.includes("—"));

              // 빈 content이고 봇 메시지면 로딩 애니메이션 표시
              const isLoadingMessage =
                message.isBot && message.content.trim() === "";

              return (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isQuote={isQuoteMessage}
                  isLoading={isLoadingMessage}
                  showTimestamp={false}
                />
              );
            })}

            {/* 로딩 중일 때 로딩 버블 표시 */}
            {chatState.isLoading && (
              <ChatBubble
                message={{
                  id: "loading",
                  content: "",
                  isBot: true,
                  timestamp: new Date(),
                }}
                isLoading={true}
              />
            )}

            {/* 명언 선택 확인 버튼 */}
            {chatState.quote_selection_mode && !chatState.quote_selected && (
              <ConfirmButtons
                onConfirm={handleConfirm}
                onCancel={handleReject}
                question="위의 명언으로 결정할까요?"
              />
            )}

            {/* 명언 선택 후 감사 메시지 UI */}
            {chatState.quote_selected && (
              <div
                className="quote-thanks"
                style={{
                  margin: "32px 0",
                  textAlign: "center",
                  color: theme.colors.primary,
                }}
              >
                이야기를 나눠줘서 고마워요. 이 명언이 당신에게 위로가 되었길
                바랄게요.
              </div>
            )}

            <div ref={messagesEndRef} />
          </MessageList>
        </MessagesContainer>

        {/* 채팅 입력창: 항상 렌더링, placeholder/disabled 동적 제어 */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={chatState.isLoading}
          placeholder={inputPlaceholder}
          ref={inputRef}
        />

        {/* 로딩 오버레이 */}
        <LoadingOverlay
          isVisible={chatState.isLoading && chatState.currentStep >= 10}
          message="당신만을 위한 명언을"
          subMessage="준비하고 있습니다."
        />
      </ChatContainer>
    </Layout>
  );
};

export default QuoteGenerator;
