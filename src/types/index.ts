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
}

export interface ChatState {
  messages: ChatMessage[];
  currentStep: number;
  isLoading: boolean;
  selectedQuote?: Quote;
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
  status: "pending" | "completed" | "error";
  content?: string;
  quote?: Quote;
  quote_selection?: QuoteSelection;
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
