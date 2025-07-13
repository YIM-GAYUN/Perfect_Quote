
import bgImg from "../assets/figma_design_system/bg_img.png";
import logoImg1 from "../assets/figma_design_system/logo_img1.png";
import logoImg2 from "../assets/figma_design_system/logo_img2.png";
import logoImg3 from "../assets/figma_design_system/logo_img3.png";
import mainImg from "../assets/figma_design_system/main_img.png";
import colorShape from "../assets/figma_design_system/color_shape.png";
import typographyShape from "../assets/figma_design_system/typography_shape.png";
import logoShape from "../assets/figma_design_system/logo_shape.png";
import React from "react";
import styled from "styled-components";
import Layout from "../components/Layout/Layout";
import { theme } from "../styles/theme";


const BgContainer = styled.div`
  min-height: calc(100vh - 130px);
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 120vw;
    height: 130%;
    background: url(${bgImg}) center center no-repeat;
    background-size: 40%;
    opacity: 0.1;
    z-index: 0;
    pointer-events: none;
  }
  > * {
    position: relative;
    z-index: 1;
  }
`;


const ContentWrapper = styled.div`
  width: 1043px;
  margin-left: 60px;
  margin-top: 120px;
  position: relative;
  min-height: 800px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  @media (max-width: 1100px) {
    width: 95vw;
    margin-left: 10px;
    margin-top: 60px;
    flex-direction: column;
    min-height: unset;
  }
`;

const LeftCol = styled.div`
  flex: 1 0 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LogoRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-top: 77px;
`;

const LogoImg = styled.img`
  width: 143px;
  height: 141px;
`;

const MainImage = styled.img`
  width: 517px;
  height: 124px;
  margin-top: 57px;
`;

const RightCol = styled.div`
  flex: 1 0 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: relative;
  height: 100%;
`;

const ColorBox = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const TypographyBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const ShapeBox = styled.div<{width?:number, height?:number}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  width: ${({width}) => (width ? `${width}px` : '181px')};
  height: ${({height}) => (height ? `${height}px` : '84px')};
`;

const ShapeImg = styled.img`
  width: 100%;
  height: auto;
`;

const SectionLabel = styled.div`
  font-family: 'Freesentation', ${theme.fonts.korean.bold};
  font-size: 36px;
  font-weight: 700;
  color: #222;
  margin-top: 12px;
  margin-left: 0;
  text-align: center;
  width: 100%;
`;

const Desc = styled.div`
  font-family: 'Freesentation', ${theme.fonts.korean.primary};
  font-size: 24px;
  color: #4A4E57;
  margin-top: 56px;
  max-width: 1137px;
  line-height: 1.5;
  margin-left: 0;
  position: absolute;
  left: 0;
  bottom: -120px;
`;

const DesignSystem: React.FC = () => {
  return (
    <Layout currentPage="design-system">
      <BgContainer>
        <ContentWrapper>
          <LeftCol>
            <LogoRow>
              <LogoImg src={logoImg1} alt="로고1" />
              <LogoImg src={logoImg2} alt="로고2" />
              <LogoImg src={logoImg3} alt="로고3" />
            </LogoRow>
            <MainImage src={mainImg} alt="딱 맞는 말 메인" />
            <ShapeBox width={174} height={84}>
              <ShapeImg src={logoShape} alt="Logo 도형" />
              <SectionLabel>Logo</SectionLabel>
            </ShapeBox>
          </LeftCol>
          <RightCol>
            <ColorBox>
              <ShapeBox width={181} height={84}>
                <ShapeImg src={colorShape} alt="Color 도형" />
                <SectionLabel>Color</SectionLabel>
              </ShapeBox>
            </ColorBox>
            <TypographyBox>
              <ShapeBox width={303} height={84}>
                <ShapeImg src={typographyShape} alt="Typography 도형" />
                <SectionLabel>Typography</SectionLabel>
              </ShapeBox>
            </TypographyBox>
          </RightCol>
          <Desc>
            딱 맞는 말의 아이콘은 큰 따옴표에서 영감을 얻은 것으로, 블럭들이 딱 붙어서 딱 맞는 말이라는 브랜드명의 이미지에 맞게 디자인되었습니다.
          </Desc>
        </ContentWrapper>
      </BgContainer>
    </Layout>
  );
};

export default DesignSystem;
