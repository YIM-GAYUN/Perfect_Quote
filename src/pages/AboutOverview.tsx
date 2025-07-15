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
  left: 160px;
  width: 1600px;
  height: 800px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
`;

const BlueLabel = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: 28px;
  color: ${theme.colors.primary};
  margin-bottom: 32px;
  font-weight: bold;
`;


const Title = styled.h1`
  font-family: ${theme.fonts.korean.primary};
  font-size: 60px;
  color: #222;
  margin-bottom: 48px;
  line-height: 1.3;
`;

const TitleStrong = styled.span`
  font-family: ${theme.fonts.korean.bold};
`;

const BubbleCol = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 32px;
`;

const BlueBubble = styled.div`
  background: ${theme.colors.primary};
  color: #fff;
  font-family: ${theme.fonts.korean.bold};
  font-size: 28px;
  border-radius: 40px 40px 40px 0px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 32px 48px;
  margin-bottom: 0;
  display: inline-block;
`;

const WhiteBubble = styled.div`
  background: #fff;
  color: #222;
  font-family: ${theme.fonts.korean.bold};
  font-size: 28px;
  border: 3px solid ${theme.colors.primary};
  border-radius: 40px 40px 0px 40px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 48px 64px;
  width: 1200px;
  margin-left: 800px;
  margin-top: 48px;
`;

const AboutOverview: React.FC = () => {
  return (
    <>
      <Header currentPage="about-overview" />
      <BgContainer>
        <MainBgImg />
        <MainSection>
          <BlueLabel>브랜드 소개</BlueLabel>
          <Title><TitleStrong>바쁜 일상</TitleStrong>과 <TitleStrong>복잡한 감정</TitleStrong> 속에서 <br/>나를 들여다보는 챗봇, <TitleStrong>딱 맞는 말</TitleStrong></Title>
          <BubbleCol>
            <BlueBubble>내 감정 챙길 시간도 없는 일상</BlueBubble>
            <BlueBubble>어디 따뜻한 말 해줄 사람 없을까?</BlueBubble>
          </BubbleCol>
          <WhiteBubble>그 틈을 따뜻하고 정확한 한 문장으로 채워주는 딱 맞는 말! <br/> 
          딱 맞는 말은 감정을 말로 표현하기 어려운 순간,<br/>
          대신 말해주고, 공감해주고, 다정하게 응원하는 서비스를 지향합니다.</WhiteBubble>
        </MainSection>
      </BgContainer>
    </>
  );
};

export default AboutOverview;
