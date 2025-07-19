
import React from "react";
import styled from "styled-components";
import Header from "../components/Layout/Header";
import { theme } from "../styles/theme";
import bgImg from "../assets/figma_design_system/bg_img.png";
import mailIconImg from "../assets/figma_design_system/mail_emoticon.png";

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

const MainSection = styled.section`
  position: absolute;
  top: 140px;
  left: 160px;
  width: 1600px;
  height: 800px;
  display: flex;
  flex-direction: column;
  align-items: left;
  z-index: 1;
`;

const Title = styled.span`
  font-family: ${theme.fonts.korean.primary};
  font-size: 80px;
  color: #4A4E57;
  margin-top: 80px;
  margin-bottom: 12px;
  text-align: left;
  line-height: 1.3;
`;

const SubTitle = styled.h2`
  font-family: ${theme.fonts.korean.primary};
  font-size: 30px;
  color: #323232ff;
  margin-top: 80px;
  margin-bottom: 40px;
  margin-left: 10px;
  text-align: left;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 0;
  row-gap: 32px;
  margin-left: -30px;
  line-height: 1.3;
`;

const MemberRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 23px;
  font-family: ${theme.fonts.korean.primary};
  color: #222;
  margin-left: 40px;
`;


const Role = styled.span`
  font-family: ${theme.fonts.korean.primary};
  font-size: 23px;
  color: #222;
  width: 150px;
  display: flex;
  align-items: center;
  margin-right: 25px;
`;

const RoleBg = styled.span`
  background: rgba(100, 144, 255, 0.2); /* theme.colors.primary with 70% opacity */
  color: #222;
  padding: -2px 8px;
  display: inline-block;
`;

const Name = styled.span`
  font-family: ${theme.fonts.korean.title};
  font-size: 26px;
  color: #222;
  margin-right: 32px;
  width: 100px;
`;

const Gen = styled.span`
  font-family: ${theme.fonts.korean.light};
  font-size: 25px;
  color: #888;
  margin-right: 32px;
  width: 50px;
`;

const School = styled.span`
  font-family: ${theme.fonts.korean.primary};
  font-size: 24px;
  color: gray;
  margin-right: 32px;
  width: 200px;
`;

const EmailRow = styled.span`
  display: flex;
  align-items: center;
  font-family: ${theme.fonts.korean.primary};
  font-size: 20px;
  color: gray;
  width: 300px;
`;

const MailIcon = styled.img`
  width: 33px;
  height: 22px;
  margin-right: 8px;
  vertical-align: middle;
  opacity: 0.6;
  margin-top: 2px;
`;

const Support: React.FC = () => {
  return (
    <>
      <Header currentPage="support" />
      <BgContainer>
        <MainBgImg />
        <MainSection>
          <Title><strong>도움이 필요</strong>하신가요? <br /> 연락해주세요!</Title>
          <SubTitle>4팀 딱 맞는말</SubTitle>
          <TeamList>
            <MemberRow>
              <Role><RoleBg>Front-end</RoleBg></Role>
              <Name>정다훈</Name>
              <Gen>6기</Gen>
              <School>단국대학교</School>
              <EmailRow><MailIcon src={mailIconImg} alt="mail icon" />jdh251425142514@gmail.com</EmailRow>
            </MemberRow>
            <MemberRow>
              <Role><RoleBg>Front-end</RoleBg></Role>
              <Name>임가윤</Name>
              <Gen>6기</Gen>
              <School>이화여자대학교</School>
              <EmailRow><MailIcon src={mailIconImg} alt="mail icon" />gayunyim@gmail.com</EmailRow>
            </MemberRow>
            <MemberRow>
              <Role><RoleBg>Chatbot</RoleBg></Role>
              <Name>이연우</Name>
              <Gen>5기</Gen>
              <School>성신여자대학교</School>
              <EmailRow><MailIcon src={mailIconImg} alt="mail icon" />amyamy7365@gmail.com</EmailRow>
            </MemberRow>
            <MemberRow>
              <Role><RoleBg>Chatbot</RoleBg></Role>
              <Name>김천지</Name>
              <Gen>6기</Gen>
              <School>상명대학교</School>
              <EmailRow><MailIcon src={mailIconImg} alt="mail icon" />202210911@sangmyung.kr</EmailRow>
            </MemberRow>
            <MemberRow>
              <Role><RoleBg>Design</RoleBg></Role>
              <Name>최윤정</Name>
              <Gen>7기</Gen>
              <School>한국예술종합학교</School>
              <EmailRow><MailIcon src={mailIconImg} alt="mail icon" />0311yunjung@gmail.com</EmailRow>
            </MemberRow>
          </TeamList>
        </MainSection>
      </BgContainer>
    </>
  );
};

export default Support;
