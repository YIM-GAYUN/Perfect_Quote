import { ChatRequest, ChatResponse, StreamingChunk, ApiConfig } from "../types";

// API 설정
const API_CONFIG: ApiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api",
  pollingInterval: 3000, // 3초
  enableStreaming: process.env.REACT_APP_ENABLE_STREAMING === "true",
};

// 에러 처리 헬퍼
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// HTTP 요청 헬퍼
const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API 요청 실패: ${response.statusText}`);
  }

  return response.json();
};

// 1. 메시지 전송 API (POST)
export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  return makeRequest<ChatResponse>("/chat/send", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

// 2. 상태 확인 API (GET)
export const getStatus = async (userId: string, threadNum: string): Promise<ChatResponse> => {
  return makeRequest<ChatResponse>(`/chat/status?userId=${userId}&threadNum=${threadNum}`);
};

// 3. 상태 폴링 헬퍼
export const pollStatus = (
  userId: string,
  threadNum: string,
  onUpdate: (response: ChatResponse) => void,
  onError: (error: Error) => void,
): (() => void) => {
  let intervalId: NodeJS.Timeout;
  let isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const response = await getStatus(userId, threadNum);
      onUpdate(response);

      // completed나 error 상태면 폴링 중단
      if (response.status === "completed" || response.status === "error") {
        isPolling = false;
        clearInterval(intervalId);
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // 즉시 첫 번째 요청 실행
  poll();

  // 일정 간격으로 폴링 시작
  intervalId = setInterval(poll, API_CONFIG.pollingInterval);

  // 폴링 중단 함수 반환
  return () => {
    isPolling = false;
    clearInterval(intervalId);
  };
};

// 4. 스트리밍 API (Server-Sent Events)
export const createStreamingConnection = (
  userId: string,
  threadNum: string,
  onChunk: (chunk: StreamingChunk) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
): (() => void) => {
  const eventSource = new EventSource(
    `${API_CONFIG.baseUrl}/chat/stream?userId=${userId}&threadNum=${threadNum}`,
  );

  eventSource.onmessage = (event) => {
    try {
      const chunk: StreamingChunk = JSON.parse(event.data);
      onChunk(chunk);

      if (chunk.type === "complete") {
        eventSource.close();
        onComplete();
      }
    } catch (error) {
      onError(new Error("스트리밍 데이터 파싱 실패"));
    }
  };

  eventSource.onerror = (error) => {
    onError(new Error("스트리밍 연결 오류"));
    eventSource.close();
  };

  // 연결 종료 함수 반환
  return () => {
    eventSource.close();
  };
};

// 5. 사용자 ID 생성 헬퍼
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 6. 스레드 번호 생성 헬퍼
export const generateThreadNum = (): string => {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export { API_CONFIG };
