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
  const navigate = useNavigate();

  // 새 메시지가 추가될 때마다 스크롤을 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

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

  const shouldShowConfirmButtons = () => {
    return (
      chatState.selectedQuote &&
      chatState.currentStep >= 10 &&
      !chatState.isLoading
    );
  };

  const shouldShowInput = () => {
    return !chatState.isLoading && chatState.currentStep < 10;
  };

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
            {chatState.isLoading && chatState.currentStep < 10 && (
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
            {shouldShowConfirmButtons() && (
              <ConfirmButtons
                onConfirm={handleConfirm}
                onCancel={handleReject}
                question="위의 명언으로 결정할까요?"
              />
            )}

            <div ref={messagesEndRef} />
          </MessageList>
        </MessagesContainer>

        {/* 채팅 입력창 */}
        {shouldShowInput() && (
          <ChatInput
            onSend={handleSendMessage}
            disabled={chatState.isLoading}
            placeholder="당신의 사연을 입력해주세요."
            autoFocus
          />
        )}

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
