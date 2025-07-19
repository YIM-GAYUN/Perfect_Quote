# 딱 맞는 말 - 당신의 하루에 딱 맞는 한 마디
<img width=70% alt="000" src="https://github.com/user-attachments/assets/defd33de-f05a-49fe-94a0-6f487a2f99da" />



## 프로젝트 소개
<img width=70% alt="001" src="https://github.com/user-attachments/assets/71762062-ed50-48df-8bfb-19ee40609c1c" />

<img width=70% alt="002" src="https://github.com/user-attachments/assets/560a2751-51ce-4551-a436-77d7fc125621" />


## 🚀 새로운 기능

- **실제 API 통신**: 백엔드 서버와 RESTful API 통신
- **실시간 폴링**: 3초 간격으로 응답 상태 확인
- **스트리밍 지원**: 토큰 단위 실시간 응답 (Server-Sent Events)
- **에러 처리**: 네트워크 오류 시 자동 폴백
- **개발 모드**: API 서버 없이도 모의 응답 제공
- **Upstage API 연동**: 실제 AI 모델을 통한 대화 생성
- **멀티턴 그래프**: LangGraph를 통한 멀티턴 대화 관리

## 📋 프로젝트 구조

### 웹 애플리케이션 (Frontend)

- React 19 + TypeScript 기반
- 대화형 채팅 인터페이스
- 실시간 API 통신

### 챗봇 시스템 (Backend)

- Python 기반 챗봇 클래스
- Upstage API 연동
- LangGraph를 통한 상태 관리

## 🛠 설치 및 실행

### 1. 환경 설정

```bash
# Python 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 또는
.venv\Scripts\activate  # Windows

# Python 패키지 설치
pip install -r requirements.txt

# Node.js 의존성 설치
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성:

```bash
# Upstage API 설정
UPSTAGE_API_KEY=your_upstage_api_key_here

# 웹 애플리케이션 설정
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENABLE_STREAMING=true
REACT_APP_DEV_MODE=true
```

### 3. 개발 서버 실행

#### 옵션 A: 전체 시스템 실행

```bash
# 1. Flask 서버 실행 (터미널 1)
python app.py

# 2. React 앱 실행 (터미널 2)
npm start
```

#### 옵션 B: 모의 API 서버와 함께 실행

```bash
npm run dev
```

## 📝 API 구조

### 1. 메시지 전송 (POST)

```
POST /api/chat/send
```

**요청 형식:**

```json
{
  "userId": "user_1735123456789_abc123",
  "threadNum": "thread_1735123456789_def456",
  "content": "오늘 지하철에서 넘어져서 기분이 안 좋아요",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**응답 형식:**

```json
{
  "userId": "user_1735123456789_abc123",
  "threadNum": "thread_1735123456789_def456",
  "timestamp": "2024-01-15T10:30:05.000Z",
  "status": "pending", // "completed" | "pending" | "error"
  "content": "우선, 괜찮으세요? 많이 다치진 않으셨죠?",
  "quote": {
    "id": "1",
    "text": "가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.",
    "author": "빅터 위고",
    "category": "hope"
  }
}
```

### 2. 상태 확인 (GET)

```
GET /api/chat/status?userId={userId}&threadNum={threadNum}
```

### 3. 스트리밍 (Server-Sent Events)

```
GET /api/chat/stream?userId={userId}&threadNum={threadNum}
```

## 🤖 챗봇 시스템

### 클래스 기반 사용법

```python
from utils.chatbot_utils import Chatbot

# 챗봇 인스턴스 생성
chatbot = Chatbot(
    model="solar-pro",
    temperature=0.7,
    max_tokens=512
)

# 대화 시작
response = chatbot.chat_once("안녕하세요!")
print(response)

# 대화 히스토리 확인
chatbot.show_history()

# CSV로 저장
chatbot.save_chat_history_to_csv("chat_log.csv")
```

### 멀티턴 그래프 시스템

LangGraph를 사용한 상태 관리:

```python
# graph.ipynb 참조
class ChatbotState(TypedDict):
    user_id: str
    thread_num: str
    user_message: str
    chatbot_message: str
    timestamp: str
    chat_history: ChatMessageHistory
    status: str
    quote: str
    author: str
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatBubble.tsx       # 채팅 말풍선
│   │   └── ChatInput.tsx        # 메시지 입력
│   ├── Common/
│   └── Layout/
├── hooks/
│   └── useChat.ts               # 채팅 로직 & API 통신
├── services/
│   └── api.ts                   # API 서비스 함수들
├── types/
│   └── index.ts                 # TypeScript 타입 정의
└── pages/
    └── QuoteGenerator.tsx       # 메인 채팅 페이지

utils/
├── chatbot_utils.py             # 챗봇 클래스
├── system_prompt.py             # 시스템 프롬프트
├── summarize_prompt.py          # 요약 프롬프트
└── __init__.py

notebooks/
├── graph.ipynb                  # LangGraph 구현
├── chatbot_conversation.ipynb   # 대화 테스트
└── chatbot_example.ipynb        # 예제 코드
```

## 🔍 API 테스트

### 1. 서버 상태 확인

```bash
curl http://localhost:3001/api/health
```

### 2. 메시지 전송 테스트

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "threadNum": "test_thread",
    "content": "오늘 기분이 안 좋아요",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }'
```

### 3. 상태 확인 테스트

```bash
curl "http://localhost:3001/api/chat/status?userId=test_user&threadNum=test_thread"
```

## 🎯 주요 특징

- **자동 ID 생성**: 사용자 ID와 스레드 번호 자동 생성
- **연결 관리**: 컴포넌트 언마운트 시 폴링/스트리밍 연결 자동 해제
- **에러 복구**: API 오류 시 개발 모드에서 모의 응답 제공
- **반응형 UI**: 모바일 친화적인 디자인
- **타입 안전**: TypeScript로 완전한 타입 정의
- **대화 히스토리 관리**: ChatMessageHistory를 통한 대화 기록
- **CSV 로깅**: 대화 내용 자동 저장 및 통계 기능

## 🔧 실제 API 서버 연동

모의 서버 대신 실제 API 서버를 사용하려면:

1. `.env` 파일의 `UPSTAGE_API_KEY` 설정
2. Flask 서버에서 실제 Upstage API 사용
3. 자세한 API 명세는 `API_GUIDE.md` 참조

## 📚 추가 문서

- [API_GUIDE.md](./API_GUIDE.md) - 상세한 API 명세서
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - API 규격 문서
- [mock-server.js](./mock-server.js) - 모의 서버 구현 예시

## 🛠 기술 스택

### Frontend

- React 19, TypeScript
- Styled Components
- Fetch API, Server-Sent Events
- React Hooks (useState, useCallback, useEffect)

### Backend & AI

- Python 3.8+
- LangChain & LangGraph
- Upstage API (Solar-Pro)
- Flask (API 서버)
- ChatMessageHistory (대화 관리)

### Development Tools

- 모의 API 서버 (Express.js)
- Jupyter Notebook (개발 및 테스트)
- CSV 로깅 시스템

## 📄 라이선스

MIT License
