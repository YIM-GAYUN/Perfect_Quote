

import React from "react";
import styled from "styled-components";
import Layout from "../components/Layout/Layout";
import { theme } from "../styles/theme";
import profileBg from "../assets/figma_design_system/persona_profile_bg.png";
import profilePhoto from "../assets/figma_design_system/persona_profile_photo.png";

const BgContainer = styled.div`
  min-height: calc(100vh - 130px);
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  background: #fff;
`;


const Description = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-size: 24px;
  color: #4A4E57;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.15);
  padding: 32px 56px;
  max-width: 1137px;
  margin: 56px auto 40px auto;
  text-align: left;
  line-height: 1.5;
`;

const PersonaSection = styled.div`
  display: flex;
  flex-direction: row;
  gap: 64px;
  margin-bottom: 0;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const ProfileCard = styled.div`
  width: 498px;
  height: 900px;
  background: #4A4E57;
  border-radius: 30px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0;
  justify-content: center;
`;

const ProfileBg = styled.div`
  width: 160px;
  height: 160px;
  background: url(${profileBg}) no-repeat center/cover;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 100px;
`;

const ProfilePhoto = styled.img`
  width: 300px;
  height: 400px;
  border-radius: 15px;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Name = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-weight: 700;
  font-size: 36px;
  color: #fff;
  margin-top: 100px;
  margin-bottom: 8px;
  text-shadow: 0 1px 4px rgba(180, 153, 153, 0.1);
`;

const AgeGender = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 24px;
  color: #C4C5D2;
  margin-bottom: 16px;
`;

const InfoList = styled.div`
  width: 100%;
  margin-top: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const InfoLabel = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #C4C5D2;
  width: 84px;
`;

const InfoValue = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 24px;
  color: #C4C5D2;
  margin-left: 40px;
`;

const SpeechBubbles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  margin-top: 8px;
  align-items: center;
`;

const Bubble = styled.div<{ color: string }>`
  background: ${props => props.color};
  border-radius: 40px 40px 40px 0px;
  border: 3px solid #6490FF;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);
  padding: 36px 56px;
  min-width: 700px;
  max-width: 1088px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BubbleTitle = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 32px;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
`;

const BubbleText = styled.div`
  font-family: 'Freesentation', 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 24px;
  color: #4A4E57;
  white-space: pre-line;
  line-height: 1.6;
`;

const Persona: React.FC = () => {
  return (
    <Layout currentPage="persona">
      <BgContainer>
        <Description>
          딱 맞는 말의 페르소나는 위로를 필요로하는 지친 현대인으로 구성되었으며,  AI챗봇을 사용해 위로를 얻고자 하는 니즈가 있습니다
        </Description>
        <PersonaSection>
          <ProfileCard>
            <ProfileBg>
              <ProfilePhoto src={profilePhoto} alt="프로필" />
            </ProfileBg>
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
          </ProfileCard>
          <SpeechBubbles>
            <Bubble color="#6490FF">
              <BubbleTitle>성격</BubbleTitle>
              <BubbleText>내향적임, 기술과 트렌드에 관심이 많음</BubbleText>
            </Bubble>
            <Bubble color="#6490FF">
              <BubbleTitle>상태</BubbleTitle>
              <BubbleText>{`AI학과에 진학했으나, 전공 선택이 나에게 맞는지 확신이 없음
주변 친구들은 빠르게 코딩 실력을 쌓고 프로젝트에 참여하는데, 본인은 아직 부족하다고 느껴 조급함
AI의 미래에 대한 기대와 불안이 공존
학업 스트레스와 진로 불안이 반복적으로 찾아옴
부모님은 AI 분야의 전망을 긍정적으로 보지만, 본인은 자기 적성에 대한 의문이 많음`}</BubbleText>
            </Bubble>
            <Bubble color="#6490FF">
              <BubbleTitle>목표</BubbleTitle>
              <BubbleText>{`전공 공부에 대한 동기부여와 자신감 회복
진로 고민을 솔직하게 털어놓고, 비슷한 고민을 한 선배나 전문가의 조언이나 명언을 통해 위로받고 싶음
자신의 감정과 성장 과정을 기록하고 싶음`}</BubbleText>
            </Bubble>
            <Bubble color="#6490FF">
              <BubbleTitle>필요</BubbleTitle>
              <BubbleText>{`AI, 진로, 성장, 도전 등과 관련된 명언 추천
내 글을 바탕으로 한 공감 메시지와 실질적인 응원
부담 없이 감정을 기록할 수 있는 익명성
내가 남긴 기록을 다시 돌아보고, 성장의 흔적을 확인할 수 있는 기능
복잡하지 않고 직관적인 서비스`}</BubbleText>
            </Bubble>
          </SpeechBubbles>
        </PersonaSection>
      </BgContainer>
    </Layout>
  );
};

export default Persona;
