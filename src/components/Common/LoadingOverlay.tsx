import React from "react";
import styled, { keyframes } from "styled-components";
import { theme } from "../../styles/theme";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(7.8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
`;

const SpinnerContainer = styled.div`
  width: 118px;
  height: 117px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid ${theme.colors.background.light};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  text-align: center;
`;

const MainText = styled.h2`
  font-family: ${theme.fonts.korean.title};
  font-size: ${theme.fontSizes.xlarge};
  color: ${theme.colors.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.4;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.large};
  }
`;

const SubText = styled.p`
  font-family: ${theme.fonts.korean.primary};
  font-size: ${theme.fontSizes.medium};
  color: ${theme.colors.text.primary};
  margin: 0;
  line-height: 1.4;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.small};
  }
`;

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "출력용 이미지를",
  subMessage = "생성하는 중입니다.",
}) => {
  if (!isVisible) return null;

  return (
    <Overlay>
      <LoadingContainer>
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>

        <LoadingText>
          <MainText>
            {message}
            <br />
            {subMessage}
          </MainText>
        </LoadingText>
      </LoadingContainer>
    </Overlay>
  );
};

export default LoadingOverlay;
