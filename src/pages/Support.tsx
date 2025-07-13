import React from "react";
import styled from "styled-components";
import Layout from "../components/Layout/Layout";
import { theme } from "../styles/theme";

const SupportContainer = styled.div`
  min-height: calc(100vh - 130px);
  padding: ${theme.spacing.xxl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.xl} 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const MainTitle = styled.h1`
  font-family: ${theme.fonts.korean.bold};
  font-size: ${theme.fontSizes.xxlarge};
  color: ${theme.colors.secondary};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: ${theme.spacing.xl};
  line-height: 1.4;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.xlarge};
  }
`;

const ComingSoonText = styled.p`
  font-family: ${theme.fonts.korean.primary};
  font-size: ${theme.fontSizes.xlarge};
  color: ${theme.colors.text.primary};
  background-color: rgba(255, 255, 255, 0.9);
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.large};
  border: 3px solid ${theme.colors.primary};
  line-height: 1.6;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.large};
    padding: ${theme.spacing.lg};
  }
`;

const Support: React.FC = () => {
  return (
    <Layout currentPage="support">
      <SupportContainer>
        <ContentWrapper>
          <MainTitle>지원</MainTitle>
          <ComingSoonText>
            사용자 지원 및<br />
            고객 서비스 페이지를
            <br />
            준비 중입니다.
          </ComingSoonText>
        </ContentWrapper>
      </SupportContainer>
    </Layout>
  );
};

export default Support;
