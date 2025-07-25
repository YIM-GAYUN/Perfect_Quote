import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import sendingButtonImg from "../../assets/sending-button.png";

const InputContainer = styled.div`
  position: fixed;
  bottom: ${theme.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - ${theme.spacing.xxl} * 2);
  max-width: 1320px;
  z-index: 100;

  @media (max-width: ${theme.breakpoints.mobile}) {
    bottom: ${theme.spacing.md};
    width: calc(100% - ${theme.spacing.md} * 2);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 0;
  background-color: ${theme.colors.chat.input};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 76px;
  max-height: 200px;
  border: none;
  background: transparent;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.fonts.korean.chatbot};
  font-size: ${theme.fontSizes.large};
  color: ${theme.colors.text.primary};
  resize: none;
  line-height: 1.5;
  text-decoration: none;

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }

  &:focus {
    outline: none;
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-family: ${theme.fonts.korean.chatbot};
    font-size: ${theme.fontSizes.medium};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    min-height: 60px;
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  width: 76px;
  height: 76px;
  background: none;
  border: none;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  align-self: center;
  padding: 0;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 60px;
    height: 60px;
  }
`;

const SendButtonImg = styled.img<{ $disabled: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  transition: opacity 0.3s ease;
`;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "당신의 사연을 입력해주세요.",
  autoFocus = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "76px";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "76px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "76px";
    }
  }, []);

  const isMessageEmpty = message.trim().length === 0;

  return (
    <InputContainer>
      <InputWrapper>
        <TextArea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          autoFocus={autoFocus}
        />

        <SendButton
          onClick={handleSubmit}
          $disabled={disabled || isMessageEmpty}
          disabled={disabled || isMessageEmpty}
        >
          <SendButtonImg src={sendingButtonImg} alt="전송" $disabled={disabled || isMessageEmpty} />
        </SendButton>
      </InputWrapper>
    </InputContainer>
  );
};

export default ChatInput;
