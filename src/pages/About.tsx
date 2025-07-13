import React, { useState } from "react";
import styled from "styled-components";
import Layout from "../components/Layout/Layout";
import { theme } from "../styles/theme";
import introductionLogoGroup from "../assets/introduction_logo-group.png";
import introductionChatSmallLogo from "../assets/introduction_chat-small-logo.png";

// 페이지 전체 컨테이너
const AboutPageRoot = styled.div`
  position: relative;
  min-height: 100vh;
  background: ${theme.colors.primary};
  overflow-x: hidden;
`;

// 배경 오버레이
const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${theme.colors.primary};
  z-index: -1;
`;

// 메인 컨텐츠 영역
const AboutMain = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: calc(100vh - 80px);
  padding: ${theme.spacing.xl} 0;
  z-index: 1;
`;

// 로고 그룹
const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.mobile}) {
    margin-bottom: ${theme.spacing.lg};
  }
`;

// 로고 이미지
const LogoImage = styled.img`
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;

  @media (max-width: ${theme.breakpoints.mobile}) {
    max-width: 90%;
  }
`;

// 타이틀
const AboutTitle = styled.h1`
  font-family: ${theme.fonts.korean.title};
  font-size: 2.5rem;
  color: ${theme.colors.secondary};
  text-align: center;
  font-weight: 400;
  margin-bottom: ${theme.spacing.xl};
  z-index: 2;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 2rem;
    margin-bottom: ${theme.spacing.lg};
  }
`;

// 버블과 로고 컨테이너
const BubbleContainer = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin: 0 auto ${theme.spacing.xl} auto;
  z-index: 2;

  @media (max-width: ${theme.breakpoints.mobile}) {
    gap: 15px;
  }
`;

// 버블 컨텐츠 영역
const AboutBubble = styled.div`
  position: relative;
  width: 60vw;
  max-width: 1109px;
  min-width: 320px;
  min-height: fit-content;
  background: ${theme.colors.secondary};
  border: 3px solid ${theme.colors.primary};
  border-radius: 40px 40px 40px 0px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 90vw;
  }
`;

// 버블 내부 텍스트
const BubbleText = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: ${theme.colors.text.primary};
  font-weight: 500;
  line-height: 1.6;
  padding: clamp(24px, 4vw, 49px) clamp(28px, 12vw, 164px);
  text-align: left;
  width: 100%;
  min-height: fit-content;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: clamp(0.9rem, 4vw, 1.2rem);
    line-height: 1.5;
  }
`;

// 작은 로고 (버블 외부)
const SmallLogo = styled.div`
  width: clamp(50px, 5vw, 65.62px);
  height: clamp(50px, 5vw, 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 10px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    margin-bottom: 8px;
  }
`;

// 작은 로고 이미지
const SmallLogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

// 탭 컨테이너
const TabsContainer = styled.div`
  position: relative;
  display: flex;
  gap: 24px;
  margin: 0 auto;
  z-index: 3;

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`;

// 개별 탭 버튼
const TabButton = styled.button<{ $active: boolean }>`
  width: 285px;
  height: 51px;
  background: ${(props) => (props.$active ? theme.colors.secondary : "transparent")};
  border: 3px solid ${theme.colors.secondary};
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.korean.primary};
  font-size: ${theme.fontSizes.large};
  font-weight: 600;
  color: ${(props) => (props.$active ? theme.colors.primary : theme.colors.secondary)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? theme.colors.secondary : "rgba(255, 255, 255, 0.1)")};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 260px;
    height: 45px;
    font-size: ${theme.fontSizes.medium};
  }
`;

// TAB_CONTENT 데이터
const TAB_CONTENT = [
  {
    label: "브랜드 개요 및 철학",
    content: `브랜드명 딱 맞는 말은 말 그대로 지금 내 감정에 꼭 맞는, 한 마디의 위로를 뜻합니다.
이 이름은 단순한 문장이 아니라, 누군가의 하루를 이해하고 어루만지는 말 한마디에서 비롯되었습니다.
현대인들은 바쁜 일상과 복잡한 감정 속에서도 자신을 들여다볼 시간과 공간이 부족합니다.
우리는 그 틈을 따뜻하고 정확한 한 문장으로 채워주고자 이 브랜드를 만들었습니다.
딱 맞는 말은 감정을 말로 표현하기 어려운 순간,
대신 말해주고, 공감해주고, 다정하게 응원하는 서비스를 지향합니다.`,
  },
  {
    label: "브랜드 핵심 가치",
    content: `딱 맞는 말은 사용자의 감정에 진심으로 공감하고, 
적절한 한마디를 통해 따뜻한 위로와 영감을 제공하는 브랜드입니다. 
각 사용자의 감정과 상황에 맞는 맞춤형 명언 추천으로, 나만을 위한 서비스입니다. 
추천되는 명언의 품질과 서비스 경험의 일관성을 통해 사용자와의 신뢰를 구축합니다.`,
  },
  {
    label: "비주얼 아이덴티티",
    content: `신뢰를 주는 편안한 블루를 사용하여 사용자와의 거리를 좁힙니다. 
완전한 블랙을 사용하지 않음으로서 눈에 주는 피로도를 줄였습니다.
스터디 플레너의 상단에 명언 한 줄을 적어넣는 것에서 영감을 얻어 명언을 출력하는 페이지는
다이어리를 연상시키는 디자인으로 구성되었습니다.
딱 맞는 말의 아이콘은 큰 따옴표에서 영감을 얻은 것으로, 블럭들이 딱 붙어서 딱 맞는 말이라는 
브랜드명의 이미지에 맞게 디자인되었습니다.`,
  },
];

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout>
      <AboutPageRoot>
        <BackgroundOverlay />
        <AboutMain>
          {/* 타이틀 */}
          <AboutTitle>당신의 하루에 딱 맞는 한마디</AboutTitle>

          {/* 로고 그룹 */}
          <LogoGroup>
            <LogoImage src={introductionLogoGroup} alt="딱 맞는 말 로고" />
          </LogoGroup>

          {/* 버블 컨텐츠와 작은 로고 */}
          <BubbleContainer>
            <SmallLogo>
              <SmallLogoImage src={introductionChatSmallLogo} alt="작은 로고" />
            </SmallLogo>
            <AboutBubble>
              <BubbleText>{TAB_CONTENT[activeTab].content}</BubbleText>
            </AboutBubble>
          </BubbleContainer>

          {/* 탭 버튼들 */}
          <TabsContainer>
            {TAB_CONTENT.map((tab, idx) => (
              <TabButton
                key={tab.label}
                $active={activeTab === idx}
                onClick={() => setActiveTab(idx)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsContainer>
        </AboutMain>
      </AboutPageRoot>
    </Layout>
  );
};

export default About;
