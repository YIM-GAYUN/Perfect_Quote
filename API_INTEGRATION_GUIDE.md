# Quote Generator V2 - API 연동 가이드 및 통합 명세서

## 🚀 **Merge 완료 상태**

✅ **feature/front-end** → main (완료)  
✅ **chatbot** → main (완료)  
✅ 리모트 push 완료

---

## 🏗️ **현재 아키텍처**

```
Frontend (React)     Backend Options
     ↓                    ↓
📱 localhost:3000 → 🔀 localhost:3001
                    ├── 🟦 Mock Server (Node.js)
                    └── 🟩 Flask Server (Python)
```

### ⚠️ **포트 충돌 해결 방안**

**옵션 1: 포트 분리**

- Mock Server: 포트 3001
- Flask Server: 포트 3002

**옵션 2: 환경별 분리**

- 개발환경: Mock Server (3001)
- 운영환경: Flask Server (3001)

---

## 📚 **API 엔드포인트 명세**

### 🔗 **기본 정보**

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **CORS**: 활성화

### 📝 **1. 메시지 전송 API**

```http
POST /api/chat/send
```

**요청**

```json
{
  "userId": "string (required)",
  "threadNum": "string (required)",
  "content": "string (required)",
  "timestamp": "string (required)"
}
```

**응답 (성공)**

```json
{
  "userId": "string",
  "threadNum": "string",
  "timestamp": "string",
  "status": "completed|pending",
  "content": "string",
  "quote": {
    "id": "string",
    "text": "string",
    "author": "string",
    "category": "string"
  } // 4단계 완료 시에만 포함
}
```

### 🔍 **2. 상태 확인 API (폴링)**

```http
GET /api/chat/status?userId={userId}&threadNum={threadNum}
```

**응답**

```json
{
  "userId": "string",
  "threadNum": "string",
  "timestamp": "string",
  "status": "completed|pending|error",
  "content": "string",
  "quote": object | null
}
```

### 🌊 **3. 스트리밍 API (SSE)**

```http
GET /api/chat/stream?userId={userId}&threadNum={threadNum}
```

**응답** (Server-Sent Events)

```
data: {"type": "message", "content": "응답 텍스트"}
data: {"type": "quote", "quote": {...}}
data: {"type": "complete"}
```

### 💚 **4. 헬스체크 API**

```http
GET /api/health
```

**응답**

```json
{
  "status": "OK",
  "timestamp": "string",
  "activeConversations": number
}
```

---

## 🔧 **프론트엔드 API 연동**

### **API 서비스 (`src/services/api.ts`)**

```typescript
// 환경 설정
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api",
  pollingInterval: 3000,
  enableStreaming: process.env.REACT_APP_ENABLE_STREAMING === "true"
};

// 메시지 전송
export const sendMessage = async (request: ChatRequest): Promise<ChatResponse>

// 상태 폴링
export const pollStatus = (userId, threadNum, onUpdate, onError): () => void

// 스트리밍 연결
export const createStreamingConnection = (userId, threadNum, onChunk, onError, onComplete): () => void
```

### **사용 예시**

```typescript
// 1. 메시지 전송
const response = await sendMessage({
  userId: "user123",
  threadNum: "thread001",
  content: "안녕하세요",
  timestamp: new Date().toISOString(),
});

// 2. 폴링 시작
const stopPolling = pollStatus(
  "user123",
  "thread001",
  (response) => console.log("업데이트:", response),
  (error) => console.error("에러:", error)
);
```

---

## 🗂️ **데이터 흐름**

### **4단계 대화 프로세스**

```
1단계: 사용자 메시지 → 봇 응답 (감정 파악)
2단계: 사용자 메시지 → 봇 응답 (상세 질문)
3단계: 사용자 메시지 → 봇 응답 (공감 표현)
4단계: 사용자 메시지 → 봇 응답 + 맞춤 명언 ✨
```

### **상태 관리**

- **pending**: 처리 중
- **completed**: 완료 (응답 포함)
- **error**: 오류 발생

---

## 🚀 **실행 방법**

### **개발 환경 (Mock Server)**

```bash
npm run dev  # React + Mock Server 동시 실행
```

### **운영 환경 (Flask Server)**

```bash
# 백엔드
python app.py

# 프론트엔드
npm start
```

---

## 🔧 **환경 설정**

### **.env 파일**

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENABLE_STREAMING=false
```

### **포트 설정**

- **React**: 3000
- **Mock Server**: 3001
- **Flask Server**: 3002 (권장)

---

## 📋 **팀 공유용 체크리스트**

### ✅ **API 연동 확인사항**

- [ ] 프론트엔드 → 백엔드 통신 정상
- [ ] CORS 설정 완료
- [ ] 에러 처리 구현
- [ ] 폴링/스트리밍 동작 확인
- [ ] 4단계 대화 플로우 테스트
- [ ] 명언 생성 로직 검증

### 🎯 **다음 단계**

1. **포트 충돌 해결** (Mock: 3001, Flask: 3002)
2. **환경별 설정 분리** (개발/운영)
3. **API 응답 시간 최적화**
4. **에러 처리 강화**
5. **로그 시스템 구축**

---

## 📞 **문의사항**

API 연동 관련 문제나 질문이 있으시면 언제든 연락주세요! 🚀
