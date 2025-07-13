import React, { useState } from "react";
import "./AboutPage.css";

const TAB_CONTENT = [
  {
    label: "브랜드 개요 및 철학",
    content: (
      <div className="about-bubble-text">
        브랜드명 <strong>딱 맞는 말</strong>은 말 그대로 지금 내 감정에 꼭 맞는, 한 마디의 위로를
        뜻합니다. 이 이름은 단순한 문장이 아니라, 누군가의 하루를 이해하고 어루만지는 말 한마디에서
        비롯되었습니다. 현대인들은 바쁜 일상과 복잡한 감정 속에서도 자신을 들여다볼 시간과 공간이
        부족합니다. 우리는 그 틈을 따뜻하고 정확한 한 문장으로 채워주고자 이 브랜드를 만들었습니다.
        딱 맞는 말은 감정을 말로 표현하기 어려운 순간, 대신 말해주고, 공감해주고, 다정하게 응원하는
        서비스를 지향합니다.
      </div>
    ),
  },
  {
    label: "브랜드 핵심 가치",
    content: (
      <div className="about-bubble-text about-core-value">
        <img src="/artboard6.png" alt="브랜드 핵심 가치 일러스트" className="about-core-img" />
        <ul className="core-value-list">
          <li>
            <b>공감</b> : 사용자의 감정과 상황을 진심으로 이해하고, 따뜻하게 공감하는 서비스
          </li>
          <li>
            <b>정확성</b> : 상황에 꼭 맞는 명언과 메시지를 제공
          </li>
          <li>
            <b>간결함</b> : 복잡하지 않고, 한 문장으로도 충분한 위로와 동기부여
          </li>
          <li>
            <b>다정함</b> : 언제나 다정하게, 사용자의 하루에 힘이 되는 말 한마디
          </li>
        </ul>
      </div>
    ),
  },
  {
    label: "비주얼 아이덴티티",
    content: (
      <div className="about-bubble-text about-visual-identity">
        <img
          src="/artboard7.png"
          alt="비주얼 아이덴티티 메인 이미지"
          className="about-visual-img"
        />
        <div className="about-visual-title">딱 맞는 말 브랜드 비주얼 아이덴티티</div>
        <div className="about-visual-desc">
          심플하고 따뜻한 느낌의 말풍선과 명확한 서체로
          <br />
          누구나 쉽게 공감할 수 있는 브랜드 이미지를 표현합니다.
        </div>
      </div>
    ),
  },
];

const AboutPage = ({ onNav }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="about-page-root">
      {/* 헤더 영역 재사용 */}
      <header className="figma-header">
        <div className="figma-header-left">
          <img src="/artboard4.png" alt="로고" className="logo-img" />
          <img src="/artboard5.png" alt="로고텍스트" className="logo-text-img" />
        </div>
        <nav className="figma-header-nav">
          <span className="nav-item" onClick={() => onNav && onNav("나를 위한 한마디")}>
            나를 위한 한마디
          </span>
          <span className="nav-item active" onClick={() => onNav && onNav("소개")}>
            소개
          </span>
          <span className="nav-item" onClick={() => onNav && onNav("아이디어")}>
            아이디어
          </span>
          <span className="nav-item" onClick={() => onNav && onNav("지원")}>
            지원
          </span>
        </nav>
      </header>
      {/* 소개 본문 영역 */}
      <main className="about-main about-main-figma">
        <div className="about-bg"></div>
        <h1 className="about-title">당신의 하루에 딱 맞는 한마디</h1>
        <div className="about-bubble">{TAB_CONTENT[activeTab].content}</div>
        <div className="about-tabs">
          {TAB_CONTENT.map((tab, idx) => (
            <button
              key={tab.label}
              className={`about-tab${activeTab === idx ? " active" : ""}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
