import React from "react";
import styled from "styled-components";
import Header from "../components/Layout/Header";
import { theme } from "../styles/theme";
import bgImg from "../assets/figma_design_system/bg_img.png";

const BgContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #fff;
  position: relative;
  overflow-x: hidden;
`;

const MainBgImg = styled.div`
  position: absolute;
  top: 22vh;
  width: 120vw;
  height: 120vh;
  left: 15vw;
  background: url(${bgImg}) center center no-repeat;
  background-size: contain;
  opacity: 0.08;
  z-index: 0;
`;

const MainSection = styled.section`
  position: absolute;
  top: 180px;
  left: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
`;

const BlueLabel = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: 28px;
  color: ${theme.colors.primary};
  margin-left: 180px;
  margin-bottom: 28px;
  font-weight: bold;
  text-align: left;
`;

const Title = styled.h1`
  font-family: ${theme.fonts.korean.primary};
  font-size: 48px;
  color: #222;
  margin-left: 180px;
  margin-bottom: 56px;
  text-align: left;
  line-height: 1.3;
`;

const Strong = styled.span`
  font-family: ${theme.fonts.korean.bold};
  font-weight: bold;
`;

const BubbleCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin-left: 180px;
  width: 1500px;
`;

const WhiteBubble = styled.div`
  background: #fff;
  color: #222;
  font-family: ${theme.fonts.korean.bold};
  font-size: 22px;
  border: 3px solid ${theme.colors.primary};
  border-radius: 40px 40px 40px 0px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 56px 80px 56px 56px;
  width: 1500px;
  min-height: 220px;
  position: relative;
  text-align: left;
`;

const BlueBubble = styled.div`
  position: absolute;
  top: -32px;
  left: -32px;
  background: ${theme.colors.primary};
  color: #fff;
  font-family: ${theme.fonts.korean.bold};
  font-size: 22px;
  border-radius: 40px 40px 40px 0px;
  padding: 18px 38px;
  z-index: 2;
  box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.08);
`;

const AboutAnalysis: React.FC = () => {
  return (
    <>
      <Header currentPage="about-analysis" />
      <BgContainer>
        <MainBgImg />
        <MainSection>
          <BlueLabel>브랜드 분석 및 설계</BlueLabel>
          <Title>
            <Strong>어떤 사람</Strong>들이 사용하고<br/>
            <Strong>어떤 서비스</Strong>를 제공할까?
          </Title>
          <BubbleCol>
            <WhiteBubble>
              <BlueBubble>니즈 분석</BlueBubble>
              다양한 연령과 직업의 사람들이 감정 표현과 공감, 위로를 필요로 합니다.<br/>
              이들의 니즈를 분석하여, 각 상황에 맞는 적절한 한마디를 제공하는 것이 중요합니다.
            </WhiteBubble>
            <WhiteBubble>
              <BlueBubble>경험 설계</BlueBubble>
              사용자가 쉽고 편리하게 명언을 추천받고, 자신의 감정에 맞는 메시지를 찾을 수 있도록<br/>
              직관적이고 감성적인 경험을 설계합니다.
            </WhiteBubble>
          </BubbleCol>
        </MainSection>
      </BgContainer>
    </>
  );
};

export default AboutAnalysis;
