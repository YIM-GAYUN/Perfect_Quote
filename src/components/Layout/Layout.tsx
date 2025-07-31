import React from "react";
import styled from "styled-components";
import Header from "./Header";
import { theme } from "../../styles/theme";
import background from "../../assets/bg_grid.png";

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: transparent; /* 배경을 투명하게 변경 */
  position: relative;
  overflow-x: hidden;
`;

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  background-image: url(${background});
  background-size: cover; // 또는 contain, repeat 등 패턴에 맞게
  background-position: center;
  background-repeat: cover;
  opacity: 0.7;
`;

const ContentArea = styled.main`
  margin-top: 130px;
  min-height: calc(100vh - 130px);
  position: relative;
  z-index: 1;

  @media (max-width: ${theme.breakpoints.mobile}) {
    margin-top: 80px;
    min-height: calc(100vh - 80px);
  }
`;

const ContentWrapper = styled.div`
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 0 ${theme.spacing.md};
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  showBackground?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, showBackground = true }) => {
  return (
    <LayoutContainer>
      {showBackground && (
        <BackgroundContainer>
        </BackgroundContainer>
      )}

      <Header currentPage={currentPage} />

      <ContentArea>
        <ContentWrapper>{children}</ContentWrapper>
      </ContentArea>
    </LayoutContainer>
  );
};

export default Layout;
