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
  font-family: ${theme.fonts.korean.bold};
  font-size: 30px;
  color: ${theme.colors.primary};
  margin-left: 180px;
  margin-bottom: 28px;
  text-align: left;
`;

const Title = styled.span`
  font-family: ${theme.fonts.korean.primary};
  font-size: 88px;
  color: #gray;
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
  font-family: ${theme.fonts.korean.primary};
  font-size: 27px;
  border: 3px solid ${theme.colors.primary};
  border-radius: 40px 40px 40px 0px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 20px 40px 20px 200px;
  width: 1800px;
  min-height: 180px;
  position: relative;
  text-align: left;
  letter-spacing: 1px;
`;

const BlueBubble = styled.div`
  position: absolute;
  top: -3px;
  left: -3px;
  background: ${theme.colors.primary};
  color: #fff;
  font-family: ${theme.fonts.korean.title};
  font-size: 22px;
  border-radius: 40px 40px 40px 0px;
  padding: 8px 30px;
  z-index: 2;
  box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.08);
  weight: 200px;
  height: 50px;
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
              사람들은 디지털 공간에서 감정을 털어놓고 <strong>공감과 위로</strong>를 받고 싶어합니다. <br/>
              내 감정에 <strong>딱 맞는 문구</strong>를 받을 때 큰 감동과 만족을 느낍니다. 복잡하지 않고 <strong>직관적인 사용 방식</strong>을 선호하며, <br/>
              예쁜 문장을 저장하고 SNS로 바로 공유할 수 있는 기능을 원합니다.
            </WhiteBubble>
            <WhiteBubble>
              <BlueBubble>경험 설계</BlueBubble>
              사용자의 글을 바탕으로 <strong>실시간 감정을 분석</strong>하고, 그 감정에 <strong>꼭 맞는 명언</strong>을 추천해줍니다. <br/>
              해시태그, 짧은 코멘트, 메시지 등으로 <strong>감정적 공감</strong>을 더합니다. <br/>
              명언은 <strong>저장</strong>하거나 <strong>공유</strong>할 수 있어, 내 마음에 드는 문장을 모아볼 수 있습니다.
            </WhiteBubble>
          </BubbleCol>
        </MainSection>
      </BgContainer>
    </>
  );
};

export default AboutAnalysis;
