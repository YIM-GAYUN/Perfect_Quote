# Quote Generator V2

사용자의 사연을 듣고 맞춤형 명언을 생성하는 대화형 웹 애플리케이션입니다.

## 🚀 새로운 기능

- **실제 API 통신**: 백엔드 서버와 RESTful API 통신
- **실시간 폴링**: 3초 간격으로 응답 상태 확인
- **스트리밍 지원**: 토큰 단위 실시간 응답 (Server-Sent Events)
- **에러 처리**: 네트워크 오류 시 자동 폴백
- **개발 모드**: API 서버 없이도 모의 응답 제공

## 📋 API 구조

### 1. 메시지 전송 (POST)

```
POST /api/chat/send
```

### 2. 상태 확인 (GET)

```
GET /api/chat/status?userId={userId}&threadNum={threadNum}
```

### 3. 스트리밍 (Server-Sent Events)

```
GET /api/chat/stream?userId={userId}&threadNum={threadNum}
```

## 📝 API 설명

### 메시지 전송 API

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

### 동작 방식

1. **메시지 전송**: 사용자가 메시지를 보내면 `POST /api/chat/send`로 전송
2. **상태 확인**: `pending` 응답 시 `GET /api/chat/status`로 폴링 시작
3. **완료 처리**: `completed` 상태에서 봇 응답과 명언을 함께 수신
4. **4단계 대화**: 4번의 메시지 교환 후 맞춤형 명언 생성

### 스트리밍 모드

Server-Sent Events를 통해 실시간 토큰 단위 응답:

```json
{
  "type": "content", // "content" | "quote" | "complete"
  "data": "우선, 괜찮으세요?",
  "timestamp": "2024-01-15T10:30:05.000Z"
}
```

## 🛠 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성:

```bash
# API 서버 설정
REACT_APP_API_BASE_URL=http://localhost:3001/api

# 스트리밍 기능 활성화
REACT_APP_ENABLE_STREAMING=true

# 개발 모드
REACT_APP_DEV_MODE=true
```

### 3. 개발 서버 실행

#### 옵션 A: 모의 API 서버와 함께 실행 (권장)

```bash
npm run dev
```

이 명령어는 모의 API 서버 (포트 3001)와 React 앱 (포트 3000)을 동시에 실행합니다.

#### 옵션 B: React 앱만 실행

```bash
npm start
```

API 서버가 없으면 개발 모드에서 모의 응답을 제공합니다.

#### 옵션 C: 모의 API 서버만 실행

```bash
npm run mock-server
```

## 🔧 API 모드 설정

### 폴링 모드 (기본)

```bash
REACT_APP_ENABLE_STREAMING=false
```

3초마다 서버에 상태를 확인하는 폴링 방식

### 스트리밍 모드

```bash
REACT_APP_ENABLE_STREAMING=true
```

실시간으로 토큰 단위 응답을 받는 스트리밍 방식

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

## 🔧 실제 API 서버 연동

모의 서버 대신 실제 API 서버를 사용하려면:

1. `.env` 파일의 `REACT_APP_API_BASE_URL` 수정
2. 실제 서버에서 동일한 API 엔드포인트 구현
3. 자세한 API 명세는 `API_GUIDE.md` 참조

## 📚 추가 문서

- [API_GUIDE.md](./API_GUIDE.md) - 상세한 API 명세서
- [mock-server.js](./mock-server.js) - 모의 서버 구현 예시

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript, Styled Components
- **API 통신**: Fetch API, Server-Sent Events
- **상태 관리**: React Hooks (useState, useCallback, useEffect)
- **개발 도구**: 모의 API 서버 (Express.js)

## �� 라이선스

MIT License
