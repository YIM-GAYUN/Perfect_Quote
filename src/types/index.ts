export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
  advice?: string;
  keywords?: string[];
  method?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedQuote?: Quote;
  
  // UI 상태 관리 (currentStep 대신 명확한 boolean 값들 사용)
  isQuoteSelectionMode: boolean;    // 명언 선택 모드 (예/아니오 버튼 표시)
  isQuoteCompleted: boolean;        // 명언 선택 완료 (결과 페이지로 이동 준비)
  showLoadingOverlay: boolean;      // 로딩 오버레이 표시
  showInput: boolean;               // 입력창 표시 여부
  showConfirmButtons: boolean;      // 예/아니오 버튼 표시 여부
  
  // 대화 진행 상태
  userMessageCount: number;         // 사용자 메시지 수 (20턴 제한용)
  isAnalysisStarted: boolean;       // 대화 분석 시작 여부
}

export interface NavigationItem {
  label: string;
  path: string;
  isActive?: boolean;
}

export type PageType =
  | "landing"
  | "chat"
  | "quote-select"
  | "complete"
  | "about"
  | "ideas"
  | "support";

// API 관련 타입 추가
export interface ChatRequest {
  userId: string;
  threadNum: string;
  content: string;
  timestamp: string;
}

export interface QuoteSelection {
  active: boolean;
  current_index: number;
  total_count: number;
  quote_id: string | null;
  changed: boolean;
}

export interface ChatResponse {
  userId: string;
  threadNum: string;
  timestamp: string;
  status: "pending" | "completed" | "error" | "quote_selected";
  content?: string;
  quote?: Quote;
  quote_selection?: QuoteSelection;
  analysis_complete?: boolean;
  advice?: string;
  keywords?: string[];
  error?: string;
}

export interface StreamingChunk {
  type: "content" | "quote" | "complete";
  data: string;
  timestamp: string;
}

export interface ApiConfig {
  baseUrl: string;
  pollingInterval: number;
  enableStreaming: boolean;
}
