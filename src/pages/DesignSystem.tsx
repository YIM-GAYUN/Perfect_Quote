
import React from "react";
import styled from "styled-components";
import Header from "../components/Layout/Header";
import { theme } from "../styles/theme";
// (logo_img1.png, logo_img2.png, logo_img3.png import는 현재 사용하지 않으므로 주석처리 또는 삭제)
import img1 from "../assets/figma_design_system/logo_img1.png";
import img2 from "../assets/figma_design_system/logo_img2.png";
import img3 from "../assets/figma_design_system/logo_img3.png";
import logoShape from "../assets/figma_design_system/logo_shape.png";
import mainImg from "../assets/figma_design_system/main_img.png";
import colorShape from "../assets/figma_design_system/color_shape.png";
import typographyShape from "../assets/figma_design_system/typography_shape.png";
import bgImg from "../assets/figma_design_system/bg_img.png";
import fonts from "../assets/figma_design_system/fonts_three.png";



// Main background container
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

// img1, img2, img3 styled-components 삭제 (불필요)
  

const MainSection = styled.section`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 1200px;
  max-width: 1200px;
  height: 75vh;
  min-height: 500px;
  margin: 0 auto;
  margin-top: 120px;
  @media (max-width: 1300px) {
    width: 100vw;
    max-width: 100vw;
    flex-direction: column;
    height: auto;
    min-height: unset;
    margin-top: 60px;
  }
`;

const DescSection = styled.div`
  width: 1200px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 32px;
  display: flex;
  text-align: justify;
  align-items: flex-end;
  @media (max-width: 1300px) {
    width: 100vw;
    max-width: 100vw;
  }
`;

const LeftCol = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 40px;
  margin-left: -180px;
`;

const BlueBorder_logo = styled.div`
  position: relative;
  margin: 5px;
  padding: 120px;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 3px solid ${theme.colors.primary};
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: transparent;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 0;
  margin-top: 30px;
`;

const BlueBorder_color = styled.div`
  position: relative;
  padding: 20px;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 3px solid ${theme.colors.primary};
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: transparent;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 0;
  margin-bottom: 200px;
`;

const BlueBorder = styled.div`
  position: relative;
  padding: -10px;
  padding-top: -30px;
  padding-bottom: -30px;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 3px solid ${theme.colors.primary};
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: transparent;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 0;
`;

const Box = styled.div<{ bgColor: string }>`
  width: 80px;
  height: 80px;
  background-color: ${(props) => props.bgColor};
`;

const LogoTextOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 66%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-family: ${theme.fonts.korean.bold};
  font-size: 35px;
  font-weight: 550;
  text-shadow: 0 2px 16px rgba(0,0,0,0.18);
  text-align: left;
  line-height: 1.1;
  width: 100%;
  max-width: 300px;
`;

const Desc = styled.div`
  margin-top: 20px;
  font-family: ${theme.fonts.korean.title};
  font-size: 22px;
  color: #4A4E57;
  line-height: 1.5;
  text-align: justify;
  max-width: 1000px;
  margin-left: -180px;
`;

const RightCol = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 500px;
  max-width: 500px;
  gap: 5px;
  margin-top: 40px;
`;

const LogoShapeBox = styled.div`

  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
`;

const ShapeBox = styled.div`

  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
`;

const ShapeBox_Ty = styled.div`
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-top: -120px;
`;

const ShapeImg = styled.img`
  top: 20vh;
  height: 7vh;
  object-fit: contain;
`;


const DesignSystem: React.FC = () => {
  return (
    <>
      <Header currentPage="design-system" />
      <BgContainer>
        <MainBgImg />
        <MainSection>
          <LeftCol>
            <LogoShapeBox>
              <ShapeImg src={logoShape} alt="Logo 도형" />
              <LogoTextOverlay>
                Logo
              </LogoTextOverlay>
            </LogoShapeBox>
            <BlueBorder_logo style={{ flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "row", gap: 0 }}>
                <img src={img1} alt="로고1" style={{ width: "130px", height: "130px", objectFit: "contain", margin: "20px" }} />
                <img src={img2} alt="로고2" style={{ width: "130px", height: "130px", objectFit: "contain", margin: "20px"}} />
                <img src={img3} alt="로고3" style={{ width: "130px", height: "130px", objectFit: "contain", margin: "20px" }} />
              </div>
              <img src={mainImg} alt="로고" style={{ width: "500px", height: "200px", objectFit: "contain", marginTop: "8px" }} />
            </BlueBorder_logo>
          </LeftCol>
          <RightCol>
            {/* Color 그룹 */}
            <ShapeBox>
              <ShapeImg src={colorShape} alt="Color 도형" />
              <LogoTextOverlay>
                Color
              </LogoTextOverlay>
            </ShapeBox>
            <BlueBorder_color>
              <Box bgColor={theme.colors.primary} />
              <Box bgColor="#00000098"  />
              <Box bgColor="#90909098" />
            </BlueBorder_color>
            {/* Typography 그룹 */}
            <ShapeBox_Ty>
              <ShapeImg src={typographyShape} alt="Typography 도형" />
              <LogoTextOverlay>
                Typography
              </LogoTextOverlay>
            </ShapeBox_Ty>
            <BlueBorder>
              <img src={fonts} alt="fonts" style={{ width: "700px", height: "230px", objectFit: "contain" }} />
            </BlueBorder>
          </RightCol>
        </MainSection>
        <DescSection>
          <Desc>
            딱 맞는 말의 아이콘은 큰 따옴표에서 영감을 얻은 것으로,<br />
            블럭들이 딱 붙어서 딱 맞는 말이라는 브랜드명의 이미지에 맞게 디자인되었습니다.
          </Desc>
        </DescSection>
      </BgContainer>
    </>
  );
};

export default DesignSystem;
