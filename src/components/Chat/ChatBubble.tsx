import React from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { ChatMessage } from "../../types";
import logoMain from "../../assets/logo-main.png";

const BubbleContainer = styled.div<{ $isBot: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  justify-content: ${(props) => (props.$isBot ? "flex-start" : "flex-end")};
  max-width: 100%;
`;

const BubbleIcon = styled.div<{ $isBot: boolean }>`
  width: 65px;
  height: 65px;
  border-radius: 12px;
  background-color: #ffffff;
  background-image: url(${logoMain});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  display: ${(props) => (props.$isBot ? "block" : "none")};

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 45px;
    height: 45px;
    border-radius: 8px;
  }
`;

const BubbleContent = styled.div<{ $isBot: boolean }>`
  max-width: ${(props) => (props.$isBot ? "calc(100% - 80px)" : "70%")};
  min-width: 100px;
  background-color: ${(props) => (props.$isBot ? theme.colors.secondary : theme.colors.primary)};
  color: ${(props) => (props.$isBot ? theme.colors.text.primary : theme.colors.secondary)};
  border: ${(props) => (props.$isBot ? `3px solid ${theme.colors.primary}` : "none")};
  border-radius: ${(props) => (props.$isBot ? "40px 40px 40px 0px" : "40px 40px 0px 40px")};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  position: relative;

  @media (max-width: ${theme.breakpoints.mobile}) {
    max-width: ${(props) => (props.$isBot ? "calc(100% - 60px)" : "85%")};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const BubbleText = styled.p<{ $isBot: boolean }>`
  font-family: ${(props) => (props.$isBot ? theme.fonts.korean.chatbot : theme.fonts.english.mono)};
  font-size: ${theme.fontSizes.large};
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.medium};
  }
`;

const QuoteText = styled.p`
  font-family: ${theme.fonts.korean.chatbot};
  font-size: ${theme.fontSizes.large};
  font-weight: 800;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.medium};
  }
`;

const TimestampContainer = styled.div<{ $isBot: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.$isBot ? "flex-start" : "flex-end")};
  margin-top: ${theme.spacing.xs};
  padding-left: ${(props) => (props.$isBot ? "80px" : "0")};

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding-left: ${(props) => (props.$isBot ? "60px" : "0")};
  }
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  font-family: ${theme.fonts.korean.chatbot};
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: ${theme.colors.text.secondary};
  animation: loading 1.4s infinite ease-in-out both;
  animation-delay: ${(props) => props.$delay * 0.16}s;

  @keyframes loading {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

interface ChatBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
  isQuote?: boolean;
  showTimestamp?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isLoading = false,
  isQuote = false,
  showTimestamp = false,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <BubbleContainer $isBot={message.isBot}>
        {message.isBot && <BubbleIcon $isBot={message.isBot} />}

        <BubbleContent $isBot={message.isBot}>
          {isLoading ? (
            <LoadingDots>
              <Dot $delay={0} />
              <Dot $delay={1} />
              <Dot $delay={2} />
            </LoadingDots>
          ) : isQuote ? (
            <QuoteText>{message.content}</QuoteText>
          ) : (
            <BubbleText $isBot={message.isBot}>{message.content}</BubbleText>
          )}
        </BubbleContent>
      </BubbleContainer>

      {showTimestamp && !isLoading && (
        <TimestampContainer $isBot={message.isBot}>
          <Timestamp>{formatTime(message.timestamp)}</Timestamp>
        </TimestampContainer>
      )}
    </>
  );
};

export default ChatBubble;
