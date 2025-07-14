
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
  width: 1600px;
  height: 800px;
  position: absolute;
  top: 200px;
  left: 160px;
  margin: 0;
`;

const DescSection = styled.div`
  width: 1600px;
  position: absolute;
  left: 160px;
  bottom: 100px;
  display: flex;
  text-align: justify;
  align-items: flex-end;
  margin: 0;
`;

const LeftCol = styled.div`
  width: 400px;
  min-width: 500px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 10px;
  margin-top: 0;
  margin-left: 0;
`;

const BlueBorder_logo = styled.div`
  position: relative;
  padding: 60px 20px 40px 20px;
  width: 800px;
  height: 430px;
  border: 3px solid ${theme.colors.primary};
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 0;
  margin-top: 20px;
`;

const BlueBorder_color = styled.div`
  position: relative;
  padding: 20px 10px 20px 10px;
  width: 320px;
  height: 120px;
  border: 3px solid ${theme.colors.primary};
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 0;
  margin-bottom: 40px;
  background-color: #fff;
`;

const BlueBorder_ty = styled.div`
  position: relative;
  padding: 20px 10px 20px 10px;
  width: 1000px;
  height: 150px;
  border: 3px solid ${theme.colors.primary};
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 0;
  background-color: #fff;
`;

const Box = styled.div<{ bgColor: string }>`
  width: 80px;
  height: 80px;
  background-color: ${(props) => props.bgColor};
`;

const LogoTextOverlay = styled.div`
  position: absolute;
  top: 65%;
  left: 40%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-family: ${theme.fonts.korean.bold};
  font-size: 28px;
  font-weight: 550;
  text-shadow: 0 2px 16px rgba(0,0,0,0.18);
  text-align: left;
  line-height: 1.1;
  width: 180px;
  max-width: 180px;
`;

const Desc = styled.div`
  font-family: ${theme.fonts.korean.title};
  font-size: 24px;
  color: #4A4E57;
  line-height: 1.5;
  text-align: justify;
  max-width: 1400px;
  margin-left: 0;
`;

const RightCol = styled.div`
  width: 400px;
  min-width: 500px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  row-gap: 20px;
  margin-top: 0;
  margin-left: 450px;
`;

const Logo_ShapeBox = styled.div`
  width: 320px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
`;

const Color_ShapeBox = styled.div`
  width: 320px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
`;

const Ty_ShapeBox = styled.div`
  width: 320px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-top: -30px;
`;

const ShapeImg = styled.img`
  position: relative;
  top: 20px;
  height: 80px;
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
            <Logo_ShapeBox>
              <ShapeImg src={logoShape} alt="Logo 도형" />
              <LogoTextOverlay>
                Logo
              </LogoTextOverlay>
            </Logo_ShapeBox>
            <BlueBorder_logo style={{ flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "row", columnGap: "10px" }}>
                <img src={img1} alt="로고1" style={{ width: "140px", height: "140px", objectFit: "contain", margin: "10px" }} />
                <img src={img2} alt="로고2" style={{ width: "140px", height: "140px", objectFit: "contain", margin: "10px"}} />
                <img src={img3} alt="로고3" style={{ width: "140px", height: "140px", objectFit: "contain", margin: "10px" }} />
              </div>
              <img src={mainImg} alt="로고" style={{ width: "450px", height: "160px", objectFit: "contain", marginTop: "12px" }} />
            </BlueBorder_logo>
          </LeftCol>
          <RightCol>
            {/* Color 그룹 */}
            <Color_ShapeBox>
              <ShapeImg src={colorShape} alt="Color 도형" />
              <LogoTextOverlay>
                Color
              </LogoTextOverlay>
            </Color_ShapeBox>
            <BlueBorder_color>
              <Box bgColor={theme.colors.primary} />
              <Box bgColor="#00000098"  />
              <Box bgColor="#90909098" />
            </BlueBorder_color>
            {/* Typography 그룹 */}
            <Ty_ShapeBox>
              <ShapeImg src={typographyShape} alt="Typography 도형" />
              <LogoTextOverlay>
                Typography
              </LogoTextOverlay>
            </Ty_ShapeBox>
            <BlueBorder_ty>
              <img src={fonts} alt="fonts" style={{ width: "700px", height: "200px", objectFit: "contain" }} />
            </BlueBorder_ty>
          </RightCol>
        </MainSection>
        <DescSection>
          <Desc>
            딱 맞는 말의 아이콘은 큰 따옴표에서 영감을 얻은 것으로, 블럭들이 딱 붙어서 딱 맞는 말이라는 <br />
            브랜드명의 이미지에 맞게 디자인되었습니다.
          </Desc>
        </DescSection>
      </BgContainer>
    </>
  );
};

export default DesignSystem;
