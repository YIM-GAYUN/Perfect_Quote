import React from "react";
import styled from "styled-components";
import Header from "./Header";
import { theme } from "../../styles/theme";
import background1 from "../../assets/background-1.png";
import background2 from "../../assets/background-2.png";

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
  width: 100%;
  height: 100%;
  z-index: -1;
  display: flex;
`;

const BackgroundImageTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-image: url(${background1});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.25;
  z-index: -2;

  @media (max-width: ${theme.breakpoints.mobile}) {
    opacity: 0.2;
  }
`;

const BackgroundImageBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-image: url(${background2});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.25;
  z-index: -2;

  @media (max-width: ${theme.breakpoints.mobile}) {
    opacity: 0.2;
  }
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
          <BackgroundImageTop />
          <BackgroundImageBottom />
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
