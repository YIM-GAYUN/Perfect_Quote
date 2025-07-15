import React from "react";
import styled from "styled-components";
import Header from "../components/Layout/Header";
import { theme } from "../styles/theme";
import bgImg from "../assets/figma_design_system/bg_img.png";
import profileBg from "../assets/figma_design_system/persona_profile_bg.png";
import profilePhoto from "../assets/figma_design_system/persona_profile_photo.png";

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
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 1200px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 80px;
  position: relative;
  z-index: 1;
  margin-top: 8%;
`;

const LeftCol = styled.div`
  flex: 0 0 500px;
  max-width: 500px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: url(${profileBg}) no-repeat center/cover;
  border-radius: 30px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 40px 24px 32px 24px;
  margin-right: 60px;
  margin-left: -300px;
  margin-top: 13px;
  height: 800px;
`;

const ProfilePhoto = styled.img`
  width: 320px;
  height: 400px;
  border-radius: 15px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Name = styled.div`
  font-family: ${theme.fonts.korean.bold};
  font-size: 35px;
  color: #fff;
  margin-top: 24px;
  text-align: center;
`;

const AgeGender = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: 24px;
  color: #b1b1b1ff;
  margin-bottom: 16px;
  text-align: center;
`;

const InfoList = styled.div`
  width: 100%;
  margin-top: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  margin-left: 40px;
`;

const InfoLabel = styled.div`
  font-family: ${theme.fonts.korean.bold};
  font-size: 21px;
  color: #aeaeaeff;
  width: 80px;
`;

const InfoValue = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: 21px;
  color: #c1c1c1ff;
  margin-left: 16px;
`;

const RightCol = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  width: 100%;
  max-width: 2500px;
  margin-left: 60px;
  margin-right: -300px;
`;

const Desc = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: 24px;
  color: #676767ff;
  margin-bottom: 17px;
  margin-top: 12px;
  text-align: left;
  line-height: 1.5;
  max-width: 2000px;
  margin-left: 10px;
`;

const BigBubble = styled.div`
  background: #fff;
  border: 3px solid #6490FF;
  border-radius: 40px 40px 40px 0px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  min-width: 600px;
  max-width: 1200px;
  margin: 8px 3px 15px 5px;
  padding: 5px 32px 5px 10px;
`;

const RowBubble = styled.div`
  display: flex;
  align-items: flex-start;
  min-height: 5px;
  margin-left: -2px;
  padding: 5px 10px 5px 10px;
`;

const BlueBubble = styled.div`
  background: #6490FF;
  color: #fff;
  border-radius: 80px 80px 80px 0px;
  min-width: 115px;
  max-width: 145px;
  padding: 8px 20px;
  font-family: ${theme.fonts.korean.title};
  font-size: 25px;
  text-align: center;
  margin-right: 24px;
  margin-left: -21px;
  margin-top: -12px;
  box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.08);
  width: 200px;
  height: 50px;
`;

const BubbleText = styled.div`
  font-family: ${theme.fonts.korean.primary};
  font-size: 21px;
  color: #4A4E57;
  background: transparent;
  margin: 0;
  padding: 13px;
  line-height: 1.6;
  white-space: pre-line;
`;

const Persona: React.FC = () => {
  return (
    <>
      <Header currentPage="persona" />
      <BgContainer>
        <MainBgImg />
        <MainSection>
          <LeftCol>
              <ProfilePhoto src={profilePhoto} alt="프로필" />
            <Name>이가영</Name>
            <AgeGender>22세, 여성</AgeGender>
            <InfoList>
              <InfoRow>
                <InfoLabel>거주지</InfoLabel>
                <InfoValue>경기도 고양시</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>학년/전공</InfoLabel>
                <InfoValue>4년제 대학교 3학년, AI학과</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>가족관계</InfoLabel>
                <InfoValue>부모님, 여동생과 함께 거주</InfoValue>
              </InfoRow>
            </InfoList>
          </LeftCol>
          <RightCol>
            <Desc>
              딱 맞는 말의 페르소나는 위로를 필요로하는 지친 현대인으로 구성되었으며, AI챗봇을 사용해 위로를 얻고자 하는 니즈가 있습니다
            </Desc>
            <BigBubble>
              <RowBubble>
                <BlueBubble>성격</BlueBubble>
                <BubbleText>내향적임, 기술과 트렌드에 관심이 많음</BubbleText>
              </RowBubble>
            </BigBubble>
            <BigBubble>
              <RowBubble>
                <BlueBubble>상태</BlueBubble>
                <BubbleText>{`AI학과에 진학했으나, 전공 선택이 나에게 맞는지 확신이 없음
주변 친구들은 빠르게 코딩 실력을 쌓고 프로젝트에 참여하는데, 본인은 아직 부족하다고 느껴 조급함
AI의 미래에 대한 기대와 불안이 공존
학업 스트레스와 진로 불안이 반복적으로 찾아옴
부모님은 AI 분야의 전망을 긍정적으로 보지만, 본인은 자기 적성에 대한 의문이 많음`}</BubbleText>
              </RowBubble>
            </BigBubble>
            <BigBubble>
              <RowBubble>
                <BlueBubble>목표</BlueBubble>
                <BubbleText>{`전공 공부에 대한 동기부여와 자신감 회복
진로 고민을 솔직하게 털어놓고, 비슷한 고민을 한 선배나 전문가의 조언이나 명언을 통해 위로받고 싶음
자신의 감정과 성장 과정을 기록하고 싶음`}</BubbleText>
              </RowBubble>
            </BigBubble>
            <BigBubble>
              <RowBubble>
                <BlueBubble>필요</BlueBubble>
                <BubbleText>{`AI, 진로, 성장, 도전 등과 관련된 명언 추천
내 글을 바탕으로 한 공감 메시지와 실질적인 응원
부담 없이 감정을 기록할 수 있는 익명성
내가 남긴 기록을 다시 돌아보고, 성장의 흔적을 확인할 수 있는 기능
복잡하지 않고 직관적인 서비스`}</BubbleText>
              </RowBubble>
            </BigBubble>
          </RightCol>
        </MainSection>
      </BgContainer>
    </>
  );
};

export default Persona;