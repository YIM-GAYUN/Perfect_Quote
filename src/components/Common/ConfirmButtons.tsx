import React from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";

const ConfirmContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  justify-content: flex-start;
  max-width: 100%;
`;

const BotIcon = styled.div`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background-color: ${theme.colors.background.light};
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 45px;
    height: 45px;
  }
`;

const ConfirmContent = styled.div`
  background-color: ${theme.colors.secondary};
  color: ${theme.colors.text.primary};
  border: 3px solid ${theme.colors.primary};
  border-radius: 40px 40px 40px 0px;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  max-width: calc(100% - 80px);

  @media (max-width: ${theme.breakpoints.mobile}) {
    max-width: calc(100% - 60px);
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const QuestionText = styled.p`
  font-family: ${theme.fonts.korean.chatbot};
  font-size: ${theme.fontSizes.large};
  line-height: 1.5;
  margin: 0 0 ${theme.spacing.md} 0;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.medium};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

const ConfirmButton = styled.button<{ $variant: "confirm" | "cancel" }>`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.secondary};
  border: none;
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-family: ${theme.fonts.korean.primary};
  font-size: ${theme.fontSizes.large};
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s ease;
  min-width: 80px;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.medium};
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    min-width: 60px;
  }
`;

interface ConfirmButtonsProps {
  onConfirm: () => void;
  onCancel: () => void;
  question?: string;
}

const ConfirmButtons: React.FC<ConfirmButtonsProps> = ({
  onConfirm,
  onCancel,
  question = "위의 명언으로 결정할까요?",
}) => {
  return (
    <ConfirmContainer>
      <BotIcon />

      <ConfirmContent>
        <QuestionText>{question}</QuestionText>

        <ButtonGroup>
          <ConfirmButton $variant="confirm" onClick={onConfirm}>
            예
          </ConfirmButton>

          <ConfirmButton $variant="cancel" onClick={onCancel}>
            아니오
          </ConfirmButton>
        </ButtonGroup>
      </ConfirmContent>
    </ConfirmContainer>
  );
};

export default ConfirmButtons;
