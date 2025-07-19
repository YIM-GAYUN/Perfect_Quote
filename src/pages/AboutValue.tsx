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
  height: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
`;

const BlueLabel = styled.div`
  font-family: ${theme.fonts.korean.bold};
  font-size: 30px;
  color: ${theme.colors.primary};
  margin-top: 80px;
  margin-bottom: 28px;
  text-align: center;
`;

const Title = styled.span`
  font-family: ${theme.fonts.korean.title};
  font-size: 80px;
  color: #gray;
  margin-bottom: 34px;
  text-align: center;
  line-height: 1.3;
  letter-spacing: 4px;
`;


const WhiteBubble = styled.div`
  background: #fff;
  color: #222;
  font-family: ${theme.fonts.korean.primary};
  font-size: 30px;
  border: 3px solid ${theme.colors.primary};
  border-radius: 40px 40px 40px 0px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 64px 96px;
  width: 1200px;
  margin-top: 80px;
  text-align: left;
  letter-spacing: 2px;
`;

const Highlight = styled.span`
  background: ${theme.colors.highlight};
  border-radius: 0px;
  padding: -2px 10px;
`;

const Strong = styled.span`
  font-family: ${theme.fonts.korean.primary};
  font-weight: bold;
`;

const AboutValue: React.FC = () => {
  return (
    <>
      <Header currentPage="about-value" />
      <BgContainer>
        <MainBgImg />
        <MainSection>
          <BlueLabel>브랜드 핵심 가치</BlueLabel>
          <Title>적절한 한마디, <Strong>딱 맞는 말</Strong></Title>
          <WhiteBubble>
            딱 맞는 말은
            <Highlight><Strong>사용자의 감정에 진심으로 공감</Strong></Highlight>하고,<br/>
            <Highlight><Strong>적절한 한마디를 통해 따뜻한 위로와 영감</Strong></Highlight>을 제공하는 브랜드입니다.<br/>
            각 사용자의 감정과 상황에 맞는 맞춤형 명언 추천으로,
            <Highlight><Strong>나만을 위한 서비스</Strong></Highlight>입니다.<br/>
            추천되는 명언의 품질과 서비스 경험의 일관성을 통해 사용자와의 신뢰를 구축합니다.
          </WhiteBubble>
        </MainSection>
      </BgContainer>
    </>
  );
};

export default AboutValue;
