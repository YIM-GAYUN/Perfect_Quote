# Quote Generator V2 - API 가이드

## 개요

Quote Generator V2는 실제 API 서버와 통신하여 사용자의 메시지에 맞는 맞춤형 명언을 생성하는 웹 애플리케이션입니다.

## API 구조

### 1. 메시지 전송 API (POST)

**엔드포인트:** `POST /api/chat/send`

**요청 본문:**

```json
{
  "userId": "user_1735123456789_abc123",
  "threadNum": "thread_1735123456789_def456",
  "content": "오늘 지하철에서 넘어져서 기분이 안 좋아요",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**응답:**

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

### 2. 상태 확인 API (GET)

**엔드포인트:** `GET /api/chat/status?userId={userId}&threadNum={threadNum}`

**응답:** 위의 POST API와 동일한 형식

### 3. 스트리밍 API (Server-Sent Events)

**엔드포인트:** `GET /api/chat/stream?userId={userId}&threadNum={threadNum}`

**이벤트 형식:**

```json
{
  "type": "content", // "content" | "quote" | "complete"
  "data": "우선, 괜찮으세요?",
  "timestamp": "2024-01-15T10:30:05.000Z"
}
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# API 서버 설정
REACT_APP_API_BASE_URL=http://localhost:3001/api

# 스트리밍 기능 활성화 여부
REACT_APP_ENABLE_STREAMING=true

# 개발 환경 설정
REACT_APP_DEV_MODE=true
```

## 사용 방법

### 1. 기본 설정

API 서버가 `http://localhost:3001`에서 실행 중이어야 합니다.

### 2. 폴링 모드 (기본)

스트리밍을 비활성화하면 3초마다 상태를 확인하는 폴링 모드로 동작합니다.

```bash
REACT_APP_ENABLE_STREAMING=false
```

### 3. 스트리밍 모드

실시간으로 토큰 단위 응답을 받는 스트리밍 모드입니다.

```bash
REACT_APP_ENABLE_STREAMING=true
```

## 개발 모드

API 서버가 없는 경우 개발 모드에서 모의 응답을 제공합니다.

```typescript
// 개발 환경에서 API 에러 시 자동으로 모의 응답 제공
if (process.env.NODE_ENV === "development") {
  // 모의 명언 데이터 사용
}
```

## API 서버 예시 구현

Express.js를 사용한 간단한 API 서버 예시:

```javascript
const express = require("express");
const app = express();

app.use(express.json());
app.use(cors());

// 메시지 전송
app.post("/api/chat/send", async (req, res) => {
  const { userId, threadNum, content, timestamp } = req.body;

  // 여기에 AI 모델 호출 로직 구현

  res.json({
    userId,
    threadNum,
    timestamp: new Date().toISOString(),
    status: "pending", // 또는 'completed'
    content: "응답 메시지",
    quote: {
      id: "1",
      text: "명언 텍스트",
      author: "저자",
      category: "motivation",
    },
  });
});

// 상태 확인
app.get("/api/chat/status", async (req, res) => {
  const { userId, threadNum } = req.query;
  // 상태 확인 로직
});

// 스트리밍
app.get("/api/chat/stream", (req, res) => {
  const { userId, threadNum } = req.query;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 스트리밍 데이터 전송
});

app.listen(3001, () => {
  console.log("API 서버가 3001 포트에서 실행 중입니다.");
});
```

## 주요 특징

1. **자동 폴백**: API 에러 시 개발 모드에서 모의 응답 제공
2. **연결 정리**: 컴포넌트 언마운트 시 폴링/스트리밍 연결 자동 해제
3. **에러 처리**: 네트워크 오류, 파싱 오류 등 다양한 에러 상황 처리
4. **실시간 업데이트**: 스트리밍 모드에서 토큰 단위 실시간 응답
5. **고유 식별자**: 사용자 ID와 스레드 번호 자동 생성

## 디버깅

브라우저 개발자 도구의 콘솔에서 API 요청/응답과 에러 로그를 확인할 수 있습니다.

```typescript
// 로그 예시
console.log("API Request:", request);
console.log("API Response:", response);
console.error("API Error:", error);
```
