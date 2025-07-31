import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import ChatBubble from "../components/Chat/ChatBubble";
import ChatInput from "../components/Chat/ChatInput";
import ConfirmButtons from "../components/Common/ConfirmButtons";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import { useChat } from "../hooks/useChat";
import { theme } from "../styles/theme";
import introImg from "../assets/figma_design_system/intro_img.gif";
import gridBg from "../assets/bg_grid.png";

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
  const [showIntro, setShowIntro] = useState(true);
  const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // gif가 로드된 후 7초간 표시
  const handleIntroLoad = () => {
    if (introTimeoutRef.current) return; // 중복 방지
    introTimeoutRef.current = setTimeout(() => setShowIntro(false), 7000);
  };

  useEffect(() => {
    return () => {
      if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    };
  }, []);

  // 디버깅을 위한 상태 로그
  useEffect(() => {
    console.log("🔄 QuoteGenerator 상태 업데이트:", {
      userMessageCount: chatState.userMessageCount,
      isLoading: chatState.isLoading,
      selectedQuote: !!chatState.selectedQuote,
      messageCount: chatState.messages.length,
      isQuoteSelectionMode: chatState.isQuoteSelectionMode,
      showConfirmButtons: chatState.showConfirmButtons,
      showInput: chatState.showInput,
      showLoadingOverlay: chatState.showLoadingOverlay
    });
  }, [chatState.userMessageCount, chatState.isLoading, chatState.selectedQuote, chatState.messages.length, chatState.isQuoteSelectionMode, chatState.showConfirmButtons, chatState.showInput, chatState.showLoadingOverlay]);

  // 새 메시지가 추가될 때마다 스크롤을 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleConfirm = () => {
    // "예" 입력으로 명언 선택
    sendMessage("예");
  };

  const handleReject = () => {
    // "아니오" 입력으로 다음 명언 요청
    sendMessage("아니오");
  };

  const shouldShowConfirmButtons = () => {
    // 명언 선택 모드에서만 버튼 표시
    const shouldShow = (
      chatState.selectedQuote &&
      chatState.showConfirmButtons && // 새로운 상태 변수 사용
      !chatState.isLoading // 로딩 중이 아닐 때
    );
    
    console.log("🔍 ConfirmButtons 조건 확인:", {
      selectedQuote: !!chatState.selectedQuote,
      showConfirmButtons: chatState.showConfirmButtons,
      isLoading: chatState.isLoading,
      shouldShow
    });
    
    return shouldShow;
  };

  const shouldShowInput = () => {
    // 명언 선택이 완료되지 않았고, 로딩 중이 아니면 입력창 표시
    const shouldShow = (
      !chatState.isLoading && 
      chatState.showInput && // 새로운 상태 변수 사용
      !chatState.selectedQuote?.id // 명언이 확정되지 않았을 때
    );
    
    console.log("🔍 Input 조건 확인:", {
      isLoading: chatState.isLoading,
      showInput: chatState.showInput,
      selectedQuote: !!chatState.selectedQuote,
      shouldShow
    });
    
    return shouldShow;
  };

  return (
    <Layout currentPage="quote-generator">
      <ChatContainer>
        {/* 인트로 오버레이: Layout과 동일하게 opacity 0.7, 배경색 없이 격자만 */}
        {showIntro && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {/* 격자 배경만 opacity */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "100vw",
                height: "100vh",
                background: `url(${gridBg}) center center / cover no-repeat`,
                opacity: 0.7,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            {/* gif는 불투명하게 */}
            <img
              src={introImg}
              alt="인트로"
              style={{
                width: "70vw",
                height: "70vh",
                objectFit: "contain",
                zIndex: 2,
                pointerEvents: "auto",
              }}
              onLoad={handleIntroLoad}
            />
          </div>
        )}
        {/* 기존 메시지/입력창/버튼은 인트로가 끝난 후에만 렌더 */}
        {!showIntro && (
          <>
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
                {chatState.isLoading && !chatState.showLoadingOverlay && (
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
          </>
        )}
        {/* 로딩 오버레이는 항상 렌더 */}
        <LoadingOverlay
          isVisible={chatState.showLoadingOverlay}
          message="당신만을 위한 명언을"
          subMessage="준비하고 있습니다."
        />
      </ChatContainer>
    </Layout>
  );
};

export default QuoteGenerator;
