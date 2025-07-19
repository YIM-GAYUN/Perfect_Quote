import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Layout from "../components/Layout/Layout";

interface QuoteResult {
  date: string;
  dayOfWeek: string;
  quote: string;
  author: string;
  keywords: string[];
  context: string;
}

const QuoteResultContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const BlurredBackground = styled.div`
  position: absolute;
  top: 130px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 130px);
  background: url("/src/assets/background-1.png") center/cover;
  filter: blur(9.5px);
  z-index: 1;
`;

const OutputPaper = styled.div`
  position: absolute;
  top: 168px;
  left: 50%;
  transform: translateX(-50%);
  width: 650px;
  height: 812px;
  background: white;
  border-radius: 15px;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.5);
  z-index: 2;
`;

const PaperBackground = styled.div`
  position: absolute;
  top: 46px;
  left: 45px;
  width: 562px;
  height: 729px;
`;

// 날짜 부분 배경 (위아래 선) - 피그마: 날짜 그룹
const DateBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 562px;
  height: 82px;

  /* 상단선 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #6490ff;
  }

  /* 하단선 */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #6490ff;
  }
`;

// 명언 부분 배경 (격자) - 피그마: 명언 그룹
const QuoteBackground = styled.div`
  position: absolute;
  top: 82px;
  left: 0;
  width: 560px;
  height: 210px;

  /* 가로선들 - 35px 간격 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 2px;
    width: 558px;
    height: 100%;
    background-image: 
      /* Line 3 - y: 0 */ linear-gradient(
        to bottom,
        #eaf0ff 0px,
        #eaf0ff 2px,
        transparent 2px,
        transparent 35px
      ),
      /* Line 4 - y: 35 */
        linear-gradient(
          to bottom,
          transparent 35px,
          #eaf0ff 35px,
          #eaf0ff 37px,
          transparent 37px,
          transparent 70px
        ),
      /* Line 5 - y: 70 */
        linear-gradient(
          to bottom,
          transparent 70px,
          #eaf0ff 70px,
          #eaf0ff 72px,
          transparent 72px,
          transparent 105px
        ),
      /* Line 6 - y: 105 */
        linear-gradient(
          to bottom,
          transparent 105px,
          #eaf0ff 105px,
          #eaf0ff 107px,
          transparent 107px,
          transparent 140px
        ),
      /* Line 7 - y: 140 */
        linear-gradient(
          to bottom,
          transparent 140px,
          #eaf0ff 140px,
          #eaf0ff 142px,
          transparent 142px,
          transparent 175px
        ),
      /* Line 8 - y: 175 */
        linear-gradient(
          to bottom,
          transparent 175px,
          #eaf0ff 175px,
          #eaf0ff 177px,
          transparent 177px,
          transparent 210px
        ),
      /* Line 9 - y: 210 */
        linear-gradient(
          to bottom,
          transparent 210px,
          #eaf0ff 210px,
          #eaf0ff 212px,
          transparent 212px
        );
    background-size: 100% 210px;
    background-repeat: no-repeat;
  }

  /* 세로선들 - 35px 간격 */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 210px;
    background-image: 
      /* Line 38 - x: 0 */ linear-gradient(
        to right,
        #eaf0ff 0px,
        #eaf0ff 2px,
        transparent 2px,
        transparent 35px
      ),
      /* Line 22 - x: 35 */
        linear-gradient(
          to right,
          transparent 35px,
          #eaf0ff 35px,
          #eaf0ff 37px,
          transparent 37px,
          transparent 70px
        ),
      /* Line 23 - x: 70 */
        linear-gradient(
          to right,
          transparent 70px,
          #eaf0ff 70px,
          #eaf0ff 72px,
          transparent 72px,
          transparent 105px
        ),
      /* Line 24 - x: 105 */
        linear-gradient(
          to right,
          transparent 105px,
          #eaf0ff 105px,
          #eaf0ff 107px,
          transparent 107px,
          transparent 140px
        ),
      /* Line 25 - x: 140 */
        linear-gradient(
          to right,
          transparent 140px,
          #eaf0ff 140px,
          #eaf0ff 142px,
          transparent 142px,
          transparent 175px
        ),
      /* 나머지 세로선들 */
        linear-gradient(
          to right,
          transparent 175px,
          #eaf0ff 175px,
          #eaf0ff 177px,
          transparent 177px,
          transparent 210px
        ),
      linear-gradient(
        to right,
        transparent 210px,
        #eaf0ff 210px,
        #eaf0ff 212px,
        transparent 212px,
        transparent 245px
      ),
      linear-gradient(
        to right,
        transparent 245px,
        #eaf0ff 245px,
        #eaf0ff 247px,
        transparent 247px,
        transparent 280px
      ),
      linear-gradient(
        to right,
        transparent 280px,
        #eaf0ff 280px,
        #eaf0ff 282px,
        transparent 282px,
        transparent 315px
      ),
      linear-gradient(
        to right,
        transparent 315px,
        #eaf0ff 315px,
        #eaf0ff 317px,
        transparent 317px,
        transparent 350px
      ),
      linear-gradient(
        to right,
        transparent 350px,
        #eaf0ff 350px,
        #eaf0ff 352px,
        transparent 352px,
        transparent 385px
      ),
      linear-gradient(
        to right,
        transparent 385px,
        #eaf0ff 385px,
        #eaf0ff 387px,
        transparent 387px,
        transparent 420px
      ),
      linear-gradient(
        to right,
        transparent 420px,
        #eaf0ff 420px,
        #eaf0ff 422px,
        transparent 422px,
        transparent 455px
      ),
      linear-gradient(
        to right,
        transparent 455px,
        #eaf0ff 455px,
        #eaf0ff 457px,
        transparent 457px,
        transparent 490px
      ),
      linear-gradient(
        to right,
        transparent 490px,
        #eaf0ff 490px,
        #eaf0ff 492px,
        transparent 492px,
        transparent 525px
      ),
      linear-gradient(
        to right,
        transparent 525px,
        #eaf0ff 525px,
        #eaf0ff 527px,
        transparent 527px,
        transparent 560px
      ),
      linear-gradient(
        to right,
        transparent 560px,
        #eaf0ff 560px,
        #eaf0ff 562px,
        transparent 562px
      );
    background-size: 560px 100%;
    background-repeat: no-repeat;
  }
`;

// 키워드 부분 배경 (세로선 + 가로선들) - 피그마: 키워드 그룹
const KeywordBackground = styled.div`
  position: absolute;
  top: 339px;
  left: 2px;
  width: 558px;
  height: 390px;

  /* 가로선들 - 39px 간격 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
        to bottom,
        #eaf0ff 0px,
        #eaf0ff 2px,
        transparent 2px,
        transparent 39px
      ),
      linear-gradient(
        to bottom,
        transparent 39px,
        #eaf0ff 39px,
        #eaf0ff 41px,
        transparent 41px,
        transparent 78px
      ),
      linear-gradient(
        to bottom,
        transparent 78px,
        #eaf0ff 78px,
        #eaf0ff 80px,
        transparent 80px,
        transparent 117px
      ),
      linear-gradient(
        to bottom,
        transparent 117px,
        #eaf0ff 117px,
        #eaf0ff 119px,
        transparent 119px,
        transparent 156px
      ),
      linear-gradient(
        to bottom,
        transparent 156px,
        #eaf0ff 156px,
        #eaf0ff 158px,
        transparent 158px,
        transparent 195px
      ),
      linear-gradient(
        to bottom,
        transparent 195px,
        #eaf0ff 195px,
        #eaf0ff 197px,
        transparent 197px,
        transparent 234px
      ),
      linear-gradient(
        to bottom,
        transparent 234px,
        #eaf0ff 234px,
        #eaf0ff 236px,
        transparent 236px,
        transparent 273px
      ),
      linear-gradient(
        to bottom,
        transparent 273px,
        #eaf0ff 273px,
        #eaf0ff 275px,
        transparent 275px,
        transparent 312px
      ),
      linear-gradient(
        to bottom,
        transparent 312px,
        #eaf0ff 312px,
        #eaf0ff 314px,
        transparent 314px,
        transparent 351px
      ),
      linear-gradient(
        to bottom,
        transparent 351px,
        #eaf0ff 351px,
        #eaf0ff 353px,
        transparent 353px,
        transparent 390px
      ),
      linear-gradient(
        to bottom,
        transparent 390px,
        #eaf0ff 390px,
        #eaf0ff 392px,
        transparent 392px
      );
    background-size: 100% 390px;
    background-repeat: no-repeat;
  }

  /* 세로선 - x: 103 */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 103px;
    width: 2px;
    height: 383px;
    background: #eaf0ff;
  }
`;

const TextContainer = styled.div`
  position: absolute;
  top: 7px;
  left: 21px;
  width: 518px;
  height: 683px;
  color: #4a4e57;
  z-index: 3;
`;

// 날짜 텍스트 - 위아래 선 사이 중앙에 위치
const DateText = styled.div`
  position: absolute;
  top: 7px; /* (82 - 67) / 2 = 7.5px, 대략 8px으로 조정하여 선 사이 중앙에 위치 */
  left: 0;
  width: 518px;
  height: 67px;
  font-family: "KoreanSWGIG3R", "Malgun Gothic", serif;
  font-size: 48px;
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 명언 텍스트 - 첫번째와 두번째 세로선 중점(52.5px)에서 시작, 두번째 가로선(35px)에서 시작
const QuoteText = styled.div`
  position: absolute;
  top: 113px; /* 82 + 35 - 4 = 113px (배경 시작 + 두번째 가로선 - 약간의 오프셋) */
  left: 52px; /* (35 + 70) / 2 = 52.5px, 대략 52px */
  width: 479px;
  height: 90px;
  font-family: "KoreanSWGIG2R", "Malgun Gothic", serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
  white-space: pre-line;
`;

// 명언 출처 - 명언 끝나는 부분에서 격자 한 칸(35px) 띄운 위치
const AuthorText = styled.div`
  position: absolute;
  top: 229px; /* 113 + 90 + 26 = 229px (명언 시작 + 명언 높이 + 격자 한 칸 정도) */
  left: 52px; /* 명언과 같은 x 좌표 */
  width: 114px;
  height: 34px;
  font-family: "KoreanSWGIG2R", "Malgun Gothic", serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
`;

const KeywordContainer = styled.div`
  position: absolute;
  top: 332px;
  left: 0;
  width: 518px;
  height: 351px;
`;

const KeywordItem = styled.div<{ top: number }>`
  position: absolute;
  top: ${(props) => props.top}px;
  left: 8px;
  width: 40px;
  height: 28px;
  font-family: "KoreanSWGIG2R", "Malgun Gothic", serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
  z-index: 2;
`;

const KeywordHighlight = styled.div<{ top: number }>`
  position: absolute;
  top: ${(props) => props.top}px;
  left: 8px;
  width: 93px;
  height: 23px;
  background: rgba(100, 144, 255, 0.5);
  border-radius: 4px;
  z-index: 1;
`;

const ContextText = styled.div`
  position: absolute;
  top: 332px;
  left: 100px;
  width: 374px;
  height: 351px;
  font-family: "KoreanSWGIG2R", "Malgun Gothic", serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.95;
  text-align: left;
  white-space: pre-line;
`;

const ActionButtons = styled.div`
  position: fixed;
  right: 280px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 10;
`;

const ActionButton = styled.button`
  width: 57px;
  height: 57px;
  background: #6490ff;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.7);
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: white;
    fill: none;
  }
`;

// SVG 아이콘들
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const PrintIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2.5">
    <polyline points="6,9 6,2 18,2 18,9" />
    <path d="M6,18H4a2,2 0 0,1-2-2V11a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2.5">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="3">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const QuoteResult: React.FC = () => {
  const navigate = useNavigate();

  // 더미 데이터 (실제로는 props나 state에서 가져올 것)
  const quoteData: QuoteResult = {
    date: "20250505",
    dayOfWeek: "MONDAY",
    quote: '"가장 어두운 밤도 결국은 끝나고,\n해는 떠오른다."',
    author: "-빅터 위고",
    keywords: ["지침", "고난", "아픔", "위로"],
    context:
      "몸이 다친 것도 힘든데,\n마음까지 지쳐 있는 상태라면 작은 일도\n더 크게 느껴질 수 있거든요.\n넘어졌다는 사실보다,\n요즘 여러 가지로 마음이 무겁고 버티는 게\n벅찼던 거 아닐까요?\n\n당신에게 따뜻한 위로가\n될 수 있는 말을 전할게요.",
  };

  const handleHome = () => {
    navigate("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "나를 위한 한마디",
        text: quoteData.quote,
        url: window.location.href,
      });
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(`${quoteData.quote}\n${quoteData.author}`);
      alert("명언이 클립보드에 복사되었습니다!");
    }
  };

  const handleDownload = () => {
    // 이미지 다운로드 로직 구현 (추후 구현)
    alert("다운로드 기능은 추후 구현될 예정입니다.");
  };

  return (
    <Layout>
      <QuoteResultContainer>
        <BlurredBackground />
        <OutputPaper>
          <PaperBackground>
            <DateBackground />
            <QuoteBackground />
            <KeywordBackground />
          </PaperBackground>

          <TextContainer>
            <DateText>
              {quoteData.date} {quoteData.dayOfWeek}
            </DateText>

            <QuoteText>{quoteData.quote}</QuoteText>

            <AuthorText>{quoteData.author}</AuthorText>

            <KeywordContainer>
              {quoteData.keywords.map((keyword, index) => (
                <React.Fragment key={index}>
                  <KeywordHighlight top={index * 39} />
                  <KeywordItem top={index * 39 + 4}>{keyword}</KeywordItem>
                </React.Fragment>
              ))}

              <ContextText>{quoteData.context}</ContextText>
            </KeywordContainer>
          </TextContainer>
        </OutputPaper>

        <ActionButtons>
          <ActionButton onClick={handleHome}>
            <HomeIcon />
          </ActionButton>
          <ActionButton onClick={handlePrint}>
            <PrintIcon />
          </ActionButton>
          <ActionButton onClick={handleShare}>
            <ShareIcon />
          </ActionButton>
          <ActionButton onClick={handleDownload}>
            <DownloadIcon />
          </ActionButton>
        </ActionButtons>
      </QuoteResultContainer>
    </Layout>
  );
};

export default QuoteResult;
