import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled, { css } from "styled-components";
import Layout from "../components/Layout/Layout";
import { theme } from "../styles/theme";
import quoteGrid from "../assets/quote_grid.png";
import clover from "../assets/clover.png";
import logoMain from "../assets/logo-main.png";
import html2canvas from "html2canvas";

// 카드 비율: 54mm x 86mm (약 1:1.59)
// px로 환산: 540px x 860px (예시, 필요시 조정)
const CARD_WIDTH = 500;
const CARD_HEIGHT = 820;

const QuoteResultContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  min-width: 1200px;
  min-height: 900px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
`;

const BlurredBackground = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  filter: blur(10px);
  z-index: 1;
`;

const Card = styled.div`
  position: relative;
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 0 24px 0 rgba(0,0,0,0.13);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  margin-left: -400px;    // 왼쪽으로 이동
  margin-top: -140px;     // 위쪽 마진을 조금 작게
`;

const DateRow = styled.div`
  position: relative;
  width: 85%;
  margin: 0 auto;
  margin-top: 32px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BlueLine = styled.div<{ top?: boolean }>`
  position: absolute;
  left: 1%;
  right: 1%;
  height: 4px;
  opacity: 0.5;
  background: ${theme.colors.primary};
  border-radius: 2px;
  ${(props) =>
    props.top
      ? css`
          top: 0;
        `
      : css`
          bottom: 0;
        `}
`;

const DateText = styled.div`
  font-family: ${theme.fonts.korean.date};
  font-size: 2.0rem;
  color: #3a4a7c;
  margin-left: 30px;
`;

const DayText = styled.div`
  font-family: ${theme.fonts.korean.date};
  font-size: 1.95rem;
  color: #3a4a7c;
  margin-right: 30px;
`;

const QuoteGridWrapper = styled.div`
  position: relative;
  width: 430px;
  margin: 0 auto;
  margin-top: 18px;
  height: 170px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const QuoteGridImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  pointer-events: none;
`;

const QuoteText = styled.div`
  position: relative;
  z-index: 2;
  width: 92%;
  max-height: 100px;
  margin: 18px auto 0 auto;
  font-family: ${theme.fonts.korean.quote};
  font-size: 1.4rem;
  color: #3a4a7c;
  text-align: left;
  white-space: pre-line;
  line-height: 1.5;
  word-break: keep-all;
  overflow: hidden;
`;

const AuthorText = styled.div`
  position: relative;
  z-index: 2;
  margin-top: 18px;
  margin-left: 30px;
  font-family: ${theme.fonts.korean.quote};
  font-size: 1.1rem;
  color: #3a4a7c;
  text-align: left;
  width: 90%;
  max-height: 25px;
`;

const KeywordRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 18px 0 0 0;
  width: 85%;
  gap: 10px;
`;

const KeywordHighlight = styled.div`
  background: rgba(23, 95, 230, 0.3); // theme.colors.primary의 투명도 적용
  padding: 6px 12px;
  min-width: 6px;
  max-width: 200px;
  height: 24px;
  display: flex;
  align-items: center;
  position: relative;
`;

const KeywordText = styled.div`
  font-family: ${theme.fonts.korean.quote};
  font-size: 1rem;
  color: #5b5b5bff;
  text-align: center;
  margin-bottom: -2px;
`;

const GridSection = styled.div`
  position: relative;
  width: 85%;
  height: 430px;
  margin: 18px auto 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

// 가로선을 위한 개별 컴포넌트
const HorizontalLine = styled.div<{ top: number }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: ${theme.colors.primary};
  top: ${(props) => props.top}px;
  opacity: 0.3;
  pointer-events: none;
`;

// 세로선을 위한 개별 컴포넌트
const VerticalLine = styled.div`
  position: absolute;
  top: 0;
  left: 18%;
  width: 3px;
  height: 98%;
  background: ${theme.colors.primary};
  opacity: 0.7;
  border-radius: 2px;
  pointer-events: none;
`;

const GridLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const GridContentRow = styled.div<{ top: number }>`
  position: absolute;
  left: 15px;
  top: ${(props) => props.top}px;
  width: 90%;
  height: 30px; // 가로선 간격과 동일하게
  display: flex;
  align-items: flex-start;
  margin-left: 25px;
`;

const GridLogo = styled.img`
  width: 22px;
  height: 22px;
  opacity: 0.6;
  margin-left: -10px;
  margin-right: 25px;
  margin-top: 5px;
  object-fit: contain;
  display: block;
`;

const GridText = styled.div`
  font-family: ${theme.fonts.korean.quote_R};
  font-size: 1.0rem;
  max-width: 400px;
  color: #3a4a7c;
  text-align: left;
  line-height: 30px;
  word-break: keep-all;
  margin-left: 12px;
  margin-right: 20px;
  margin-top: 0;
`;

const CloverImg = styled.img`
  position: absolute;
  right: 5px;
  bottom: -60px;
  width: 220px;
  height: 220px;
  object-fit: contain;
  z-index: 2;
`;

const CopyrightText = styled.div`
  width: 100%;
  margin: 20px 0 0 0;
  font-size: 0.7rem;
  color: #c4c4c4ff;
  text-align: center;
  font-family: ${theme.fonts.korean.primary};
`;

const ActionButtons = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  bottom: -150px;
  right: -50px;
  z-index: 10;
`;

const ActionButton = styled.button`
  width: 57px;
  height: 57px;
  background: ${theme.colors.primary};
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
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 데이터 가져오기
  const date = searchParams.get("date");
  const dayOfWeek = searchParams.get("dayOfWeek");
  const quote = searchParams.get("quote");
  const author = searchParams.get("author");
  const keywords = searchParams.get("keywords")?.split(",");
  const context = searchParams.get("context");

  // 오늘 날짜와 요일 구하기
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
  const daysKor = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeekStr = daysKor[today.getDay()];

  // URL 파라미터에서 받은 실제 데이터 사용
  const quoteData = {
    date: date || dateStr,
    dayOfWeek: dayOfWeek || dayOfWeekStr,
    quote: quote || '"힘내세요"',
    author: author || "-빅터 위고",
    keywords: keywords || ["지침", "고난", "아픔", "위로"],
    contextTop: context || "당신의 이야기를 들려주셔서 감사합니다. 당신의 경험과 감정이 소중하다는 것을 잊지 마세요.",
    contextBottom: "당신에게 따뜻한 위로가 될 수 있는 말을 전할게요.",
  };

  // 명언 길이에 따라 font-size 자동 조정
  const [fontSize, setFontSize] = useState(1.4); // rem 단위
  const quoteTextRef = useRef<HTMLDivElement>(null);

  // 작가명 길이에 따라 font-size 자동 조정
  const [authorFontSize, setAuthorFontSize] = useState(1.1); // rem 단위
  const authorTextRef = useRef<HTMLDivElement>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quoteTextRef.current) return;
    const container = quoteTextRef.current;
    let currentFontSize = 1.4;
    container.style.fontSize = `${currentFontSize}rem`;
    // 반복적으로 줄이면서 height를 체크
    while (container.scrollHeight > container.offsetHeight && currentFontSize > 0.3) {
      currentFontSize -= 0.05;
      container.style.fontSize = `${currentFontSize}rem`;
    }
    setFontSize(currentFontSize);
  }, [quoteData.quote]);

  useEffect(() => {
    if (!authorTextRef.current) return;
    const container = authorTextRef.current;
    let currentFontSize = 1.1;
    container.style.fontSize = `${currentFontSize}rem`;
    while (container.scrollHeight > container.offsetHeight && currentFontSize > 0.3) {
      currentFontSize -= 0.05;
      container.style.fontSize = `${currentFontSize}rem`;
    }
    setAuthorFontSize(currentFontSize);
  }, [quoteData.author]);

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
      navigator.clipboard.writeText(`${quoteData.quote}\n${quoteData.author}`);
      alert("명언이 클립보드에 복사되었습니다!");
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    // html2canvas 옵션을 개선하여 CSS 배경 이미지가 제대로 캡처되도록 설정
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      scale: 2, // 고해상도로 캡처
      logging: false,
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
      onclone: (clonedDoc) => {
        // 클론된 문서에서 스타일이 제대로 적용되도록 보장
        const clonedCard = clonedDoc.querySelector('[data-testid="card"]') as HTMLElement;
        if (clonedCard) {
          clonedCard.style.transform = 'none';
        }
      }
    });
    
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "quote_card.png";
    link.click();
  };

  return (
    <Layout currentPage="quote-result">
      <QuoteResultContainer>
        <BlurredBackground />
        <Card ref={cardRef} data-testid="card">
          {/* 날짜/요일 + 파란선 */}
          <DateRow>
            <BlueLine top />
            <DateText>{quoteData.date}</DateText>
            <DayText>{quoteData.dayOfWeek}</DayText>
            <BlueLine />
          </DateRow>

           {/* 명언 그리드 + 명언 + 작가 */}
          <QuoteGridWrapper>
            <QuoteGridImg src={quoteGrid} alt="quote grid" />
            <QuoteText ref={quoteTextRef} style={{ fontSize: `${fontSize}rem` }}>{quoteData.quote}</QuoteText>
            <AuthorText ref={authorTextRef} style={{ fontSize: `${authorFontSize}rem` }}>{quoteData.author}</AuthorText>
          </QuoteGridWrapper>

          {/* 키워드 */}
          <KeywordRow>
            {quoteData.keywords.map((kw, idx) => (
              <KeywordHighlight key={idx}>
                <KeywordText>{kw}</KeywordText>
              </KeywordHighlight>
            ))}
          </KeywordRow>

          {/* 챗봇 내용 그리드 */}
          <GridSection>
            <GridLines>
              {/* 가로선들을 실제 DOM 요소로 렌더링 */}
              {Array.from({ length: 14 }).map((_, i) => (
                <HorizontalLine key={`horizontal-${i}`} top={i * 30} />
              ))}
              {/* 세로선 */}
              <VerticalLine />
            </GridLines>
            {/* 윗부분 */}
            <GridContentRow top={0}>
              <GridLogo src={logoMain} alt="logo" />
              <GridText>
                {quoteData.contextTop
                  .split(/(?<=[.?!])/)
                  .filter(sentence => sentence.trim() !== "")
                  .map((sentence, idx, arr) => (
                    <React.Fragment key={idx}>
                      {sentence.trim()}
                      <br />
                    </React.Fragment>
                  ))}
              </GridText>
            </GridContentRow>
            {/* 아랫부분 (고정 위치) */}
            <GridContentRow top={300}>
              <GridLogo src={logoMain} alt="logo" />
              <GridText>{quoteData.contextBottom}</GridText>
            </GridContentRow>
            <CloverImg src={clover} alt="clover" />
          </GridSection>

          {/* Copyright */}
          <CopyrightText>
            Copyright all rights reserved by 딱 맞는 말
          </CopyrightText>
        </Card>

        {/* 액션 버튼들 */}
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