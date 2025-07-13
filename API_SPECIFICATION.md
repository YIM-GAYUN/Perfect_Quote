# Quote Generator V2 - API 명세서 (API Specification)

## 📋 개요

Quote Generator V2는 사용자의 감정 상태와 메시지에 맞는 맞춤형 명언을 생성하는 대화형 API 서비스입니다. 4단계 대화를 통해 사용자의 감정을 파악하고, 적절한 위로의 말과 명언을 제공합니다.

## 🔗 기본 정보

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **인증**: 없음 (현재 버전)
- **API 버전**: v1
- **프로토콜**: HTTP/HTTPS, Server-Sent Events (SSE)

---

## 📚 엔드포인트 목록

### 1. 메시지 전송 API

사용자의 메시지를 전송하고 봇의 응답을 받습니다.

**엔드포인트**

```
POST /api/chat/send
```

**요청 헤더**

```http
Content-Type: application/json
```

**요청 본문 (Request Body)**

```json
{
  "userId": "string (required)", // 사용자 고유 식별자
  "threadNum": "string (required)", // 대화 스레드 번호
  "content": "string (required)", // 사용자 메시지 내용
  "timestamp": "string (required)" // ISO 8601 형식 타임스탬프
}
```

**응답 (Response)**

✅ **성공 (200 OK) - Pending 상태**

```json
{
  "userId": "user_1735123456789_abc123",
  "threadNum": "thread_1735123456789_def456",
  "timestamp": "2024-01-15T10:30:05.000Z",
  "status": "pending"
}
```

✅ **성공 (200 OK) - Completed 상태 (4단계 완료)**

```json
{
  "userId": "user_1735123456789_abc123",
  "threadNum": "thread_1735123456789_def456",
  "timestamp": "2024-01-15T10:30:05.000Z",
  "status": "completed",
  "content": "충분히 이해됩니다. 당신의 마음을 어루만져줄 수 있는 따뜻한 말을 전해드릴게요.",
  "quote": {
    "id": "1",
    "text": "가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.",
    "author": "빅터 위고",
    "category": "hope"
  }
}
```

❌ **에러 (400 Bad Request)**

```json
{
  "error": "필수 필드가 누락되었습니다."
}
```

❌ **에러 (500 Internal Server Error)**

```json
{
  "error": "서버 내부 오류가 발생했습니다."
}
```

---

### 2. 대화 상태 확인 API

현재 대화의 상태를 폴링 방식으로 확인합니다.

**엔드포인트**

```
GET /api/chat/status
```

**쿼리 파라미터**

```
userId=string (required)     // 사용자 고유 식별자
threadNum=string (required)  // 대화 스레드 번호
```

**예시 요청**

```http
GET /api/chat/status?userId=user_1735123456789_abc123&threadNum=thread_1735123456789_def456
```

**응답 (Response)**

✅ **성공 (200 OK) - 봇 응답 완료**

```json
{
  "userId": "user_1735123456789_abc123",
  "threadNum": "thread_1735123456789_def456",
  "timestamp": "2024-01-15T10:30:07.000Z",
  "status": "completed",
  "content": "그런 상황이셨군요. 정말 힘드셨을 것 같아요. 그때 어떤 기분이 드셨나요?",
  "quote": null // 4단계 완료 시에만 quote 포함
}
```

❌ **에러 (400 Bad Request)**

```json
{
  "error": "필수 파라미터가 누락되었습니다."
}
```

❌ **에러 (404 Not Found)**

```json
{
  "error": "대화를 찾을 수 없습니다."
}
```

---

### 3. 실시간 스트리밍 API (Server-Sent Events)

실시간으로 봇의 응답을 토큰 단위로 스트리밍 받습니다.

**엔드포인트**

```
GET /api/chat/stream
```

**쿼리 파라미터**

```
userId=string (required)     // 사용자 고유 식별자
threadNum=string (required)  // 대화 스레드 번호
```

**응답 헤더**

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**스트리밍 데이터 형식**

🔄 **토큰 스트리밍 이벤트**

```
data: {"type":"content","data":"안녕하세요!","timestamp":"2024-01-15T10:30:05.000Z"}

data: {"type":"content","data":" 오늘","timestamp":"2024-01-15T10:30:05.100Z"}

data: {"type":"content","data":" 어떻게","timestamp":"2024-01-15T10:30:05.200Z"}
```

📝 **명언 전송 이벤트 (4단계 완료 시)**

```
data: {"type":"quote","data":{"id":"1","text":"가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.","author":"빅터 위고","category":"hope"},"timestamp":"2024-01-15T10:30:08.000Z"}
```

✅ **완료 이벤트**

```
data: {"type":"complete","timestamp":"2024-01-15T10:30:08.500Z"}
```

---

### 4. 헬스체크 API

서버 상태를 확인합니다.

**엔드포인트**

```
GET /api/health
```

**응답 (Response)**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "activeConversations": 5
}
```

---

## 📊 데이터 모델 (Data Models)

### Message (메시지)

```typescript
interface Message {
  userId: string; // 사용자 ID
  threadNum: string; // 스레드 번호
  content: string; // 메시지 내용
  timestamp: string; // ISO 8601 타임스탬프
  status: "pending" | "completed" | "error"; // 처리 상태
  quote?: Quote; // 명언 (옵션)
}
```

### Quote (명언)

```typescript
interface Quote {
  id: string; // 명언 고유 ID
  text: string; // 명언 텍스트
  author: string; // 저자
  category: string; // 카테고리 ('hope', 'motivation', 'productivity', 'resilience')
}
```

### StreamEvent (스트리밍 이벤트)

```typescript
interface StreamEvent {
  type: "content" | "quote" | "complete"; // 이벤트 타입
  data: string | Quote; // 이벤트 데이터
  timestamp: string; // 타임스탬프
}
```

### ErrorResponse (에러 응답)

```typescript
interface ErrorResponse {
  error: string; // 에러 메시지
  code?: string; // 에러 코드 (옵션)
}
```

---

## 🚨 HTTP 상태 코드

| 상태 코드 | 의미                  | 설명                              |
| --------- | --------------------- | --------------------------------- |
| `200`     | OK                    | 요청 성공                         |
| `400`     | Bad Request           | 잘못된 요청 (필수 필드 누락 등)   |
| `404`     | Not Found             | 리소스를 찾을 수 없음 (대화 없음) |
| `500`     | Internal Server Error | 서버 내부 오류                    |

---

## 💡 사용 시나리오

### 시나리오 1: 일반 폴링 모드 (4단계 대화)

1. **1단계: 초기 메시지 전송**

```http
POST /api/chat/send
{
  "userId": "user_123",
  "threadNum": "thread_456",
  "content": "오늘 지하철에서 넘어져서 기분이 안 좋아요",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

Response: { "status": "pending" }
```

2. **1단계: 상태 확인 (폴링)**

```http
GET /api/chat/status?userId=user_123&threadNum=thread_456

Response: {
  "status": "completed",
  "content": "안녕하세요! 오늘 지하철에서 넘어져서 기분이 안 좋아요에 대해 말씀해주셔서 감사합니다. 더 자세히 들려주실 수 있나요?"
}
```

3. **2-3단계: 추가 대화 반복**

4. **4단계: 명언 포함 완료**

```http
Response: {
  "status": "completed",
  "content": "충분히 이해됩니다. 당신의 마음을 어루만져줄 수 있는 따뜻한 말을 전해드릴게요.",
  "quote": {
    "id": "1",
    "text": "가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.",
    "author": "빅터 위고",
    "category": "hope"
  }
}
```

### 시나리오 2: 실시간 스트리밍 모드

```javascript
const eventSource = new EventSource("/api/chat/stream?userId=user_123&threadNum=thread_456");

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "content":
      // 토큰 단위로 UI 업데이트
      appendToMessage(data.data);
      break;
    case "quote":
      // 명언 표시
      displayQuote(data.data);
      break;
    case "complete":
      // 스트리밍 완료
      eventSource.close();
      break;
  }
};
```

---

## 🛠 개발 환경 설정

### 환경 변수 (.env)

```bash
# API 서버 설정
REACT_APP_API_BASE_URL=http://localhost:3001/api

# 스트리밍 활성화
REACT_APP_ENABLE_STREAMING=true

# 개발 모드
REACT_APP_DEV_MODE=true
```

### Mock 서버 실행

```bash
node mock-server.js
```

---

## 📝 클라이언트 SDK 예시

### JavaScript/TypeScript

```typescript
class QuoteGeneratorAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: Message): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return response.json();
  }

  async checkStatus(userId: string, threadNum: string): Promise<Message> {
    const response = await fetch(
      `${this.baseUrl}/chat/status?userId=${userId}&threadNum=${threadNum}`,
    );
    return response.json();
  }

  createStream(userId: string, threadNum: string): EventSource {
    return new EventSource(`${this.baseUrl}/chat/stream?userId=${userId}&threadNum=${threadNum}`);
  }
}
```

---

## 🔍 디버깅 가이드

### 로그 확인

- 브라우저 개발자 도구 → Console 탭
- 네트워크 탭에서 API 요청/응답 모니터링

### 일반적인 문제

1. **CORS 에러**: 서버에서 CORS 설정 확인
2. **연결 실패**: API 서버 실행 상태 확인
3. **응답 지연**: 네트워크 상태 및 서버 로드 확인

---

_이 문서는 Quote Generator V2 API의 전체 명세를 담고 있습니다. 문의사항이 있으시면 개발팀으로 연락주세요._
