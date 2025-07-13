import React from "react";
import styled, { keyframes } from "styled-components";
import { theme } from "../../styles/theme";
import confirmationGif from "../../assets/confirmation-loading.gif";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

const AnimationContainer = styled.div`
  width: 200px;
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 150px;
    height: 150px;
  }
`;

const GifAnimation = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
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
  message = "당신만을 위한 명언을",
  subMessage = "준비하고 있습니다.",
}) => {
  if (!isVisible) return null;

  return (
    <Overlay>
      <LoadingContainer>
        <AnimationContainer>
          <GifAnimation src={confirmationGif} alt="명언 준비 중" />
        </AnimationContainer>

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
