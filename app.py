from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import uuid
import time
import random
import threading

# LangGraph imports
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage
from langchain_community.chat_message_histories import ChatMessageHistory
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List, Dict, Any, Annotated, Optional

import os
from dotenv import load_dotenv

# 시스템 프롬프트 import
from utils.system_prompt import SYSTEM_PROMPT
from utils.analysis_prompt import ANALYSIS_PROMPT

# 명언 검색 시스템
try:
    from utils.quote_retriever import find_similar_quote_cosine_silent
    print("✅ 명언 검색 시스템 로드 완료")
    QUOTE_RETRIEVER_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ 명언 검색 시스템 로드 실패: {e}")
    QUOTE_RETRIEVER_AVAILABLE = False

# 임베딩 기반 검색을 위한 imports (조건부)
import pandas as pd
import numpy as np

# .env 파일 로드
load_dotenv()

# === 상수 정의 ===
TURN_THRESHOLD = 20
EMBEDDING_AVAILABLE = False
EMBEDDING_LOADING = False
EMBEDDING_LIBS_AVAILABLE = True

# === 기본 명언 데이터 ===
FALLBACK_QUOTES = {
    'general': [
        {"quote": "인생은 우리가 만들어가는 것이다. 어제보다 나은 오늘을 만들자.", "author": "랄프 왈도 에머슨", "category": "성장", "similarity": 0.88},
        {"quote": "변화를 두려워하지 마라. 성장의 시작이다.", "author": "보 베넷", "category": "성장", "similarity": 0.85},
        {"quote": "지혜는 경험에서 나오고, 경험은 도전에서 나온다.", "author": "오스카 와일드", "category": "지혜", "similarity": 0.82}
    ],
    'success': [
        {"quote": "성공은 준비와 기회가 만나는 지점에서 일어난다.", "author": "바비 언저", "category": "성공", "similarity": 0.92},
        {"quote": "실패는 성공의 어머니다. 포기하지 말고 계속 도전하라.", "author": "토마스 에디슨", "category": "성공", "similarity": 0.89},
        {"quote": "꿈을 향해 나아가라. 목표가 있으면 길이 보인다.", "author": "랄프 왈도 에머슨", "category": "목표", "similarity": 0.87}
    ],
    'hope': [
        {"quote": "어둠 속에서도 한 줄기 빛은 찾을 수 있다.", "author": "마틴 루터 킹", "category": "희망", "similarity": 0.90},
        {"quote": "모든 어려움은 지나간다. 시간이 최고의 치료제다.", "author": "괴테", "category": "치유", "similarity": 0.87},
        {"quote": "고통은 피할 수 없지만, 고통에 대한 고뇌는 선택사항이다.", "author": "하버 딜런", "category": "극복", "similarity": 0.84}
    ]
}

print("🔧 임베딩 시스템 강제 활성화")

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    print("✅ 임베딩 라이브러리 로드 완료")
except ImportError as e:
    print(f"⚠️ 임베딩 라이브러리 로드 실패: {e}")
    print("🔄 런타임에 다시 시도할 예정")

app = Flask(__name__)
CORS(app)

# === LangGraph State 정의 ===
class ChatbotState(TypedDict):
    # 사용자 정보
    user_id: Annotated[str, "User ID"]
    thread_num: Annotated[str, "Session ID"]
    
    # 대화 정보
    user_message: Annotated[str, "User Message"]
    chatbot_message: Annotated[str, "Chatbot Message"]
    timestamp: Annotated[str, "Timestamp of the conversation"]
    chat_history: Annotated[ChatMessageHistory, "chat history of user and ai"]
    status: Annotated[str, "Status of the conversation"]
    
    # 대화 분석 정보
    chat_analysis: Annotated[str, "Analysis of the conversation"]
    retrieved_quotes_and_authors: Annotated[Dict[str, str] | List[tuple[str, str]], "Retrieved 3 quotes and 3 authors from vector db"]
    quote: Annotated[str, "Quote for the conversation"]
    author: Annotated[str, "Author of the quote"]
    keywords: Annotated[List[str], "Keywords of the conversation"]
    advice: Annotated[str, "Advice for the conversation"]
    
    # 명언 선택 기능을 위한 필드들
    candidate_quotes: Annotated[List[Dict], "List of candidate quotes with similarity scores"]
    current_quote_index: Annotated[int, "Current quote index being presented"]
    quote_selection_complete: Annotated[bool, "Whether quote selection is complete"]

# === 유틸리티 클래스 ===
class LLMChainBuilder:
    """LLM 체인 생성을 위한 통합 클래스"""
    
    @staticmethod
    def _init_llm():
        return ChatUpstage(
            model="solar-pro",
            temperature=0.7,
            max_tokens=300,
        )
    
    @classmethod
    def build_chat_chain(cls):
        """일반 채팅용 체인"""
        llm = cls._init_llm()
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", "{user_input}")
        ])
        return prompt | llm
    
    @classmethod
    def build_analysis_chain(cls):
        """대화 분석용 체인"""
        llm = cls._init_llm()
        prompt = ChatPromptTemplate.from_messages([
            ("system", ANALYSIS_PROMPT),
            ("user", "다음 대화 히스토리를 분석하라. \\n\\n{chat_history}")
        ])
        return prompt | llm
    
    @classmethod
    def build_advice_chain(cls):
        """조언 및 키워드 생성용 체인"""
        llm = cls._init_llm()
        prompt = ChatPromptTemplate.from_messages([
            ("system", ANALYSIS_PROMPT + "\n\n분석 결과를 바탕으로 다음 두 가지를 제공해줘요.:\n1. 사용자에게 적절한 조언을 해줘요. 사용자에게는 '당신, 그대'라는 2인칭 표현을 사용해요. (최대 세 문장, 문학적이고 감성적인 어투를 사용하여 친절하게 제공해줘요.)\n2. 대화 내용의 키워드 (최대 5개, 쉼표로 구분)\n\n형식:\n조언: [조언 내용]\n키워드: [키워드1, 키워드2, 키워드3]"),
            ("user", "{chat_history}")
        ])
        return prompt | llm

class QuoteManager:
    """명언 관련 기능을 담당하는 클래스"""
    
    @staticmethod
    def select_fallback_quotes(analysis_text: str) -> List[Dict]:
        """분석 내용에 따라 적절한 fallback 명언 선택"""
        analysis_lower = analysis_text.lower()
        
        if any(word in analysis_lower for word in ['성공', '도전', '목표', '노력']):
            return FALLBACK_QUOTES['success']
        elif any(word in analysis_lower for word in ['힘들', '어려움', '슬픔', '우울']):
            return FALLBACK_QUOTES['hope']
        else:
            return FALLBACK_QUOTES['general']
    
    @staticmethod
    def search_quotes(chat_analysis: str) -> List[Dict]:
        """명언 검색 (벡터 검색 또는 fallback)"""
        fallback_quotes = QuoteManager.select_fallback_quotes(chat_analysis)
        
        try:
            if QUOTE_RETRIEVER_AVAILABLE:
                import warnings
                import sys
                from io import StringIO
                
                # 모든 출력과 경고 억제
                old_stdout = sys.stdout
                old_stderr = sys.stderr
                
                try:
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore")
                        sys.stdout = StringIO()
                        sys.stderr = StringIO()
                        
                        quotes = find_similar_quote_cosine_silent(chat_analysis, top_k=3)
                        
                finally:
                    # 출력 복원
                    sys.stdout = old_stdout
                    sys.stderr = old_stderr
                
                # 검색 결과 검증
                if quotes and len(quotes) > 0 and all('quote' in q and 'author' in q for q in quotes):
                    print(f"✅ 명언 검색 성공: {len(quotes)}개 후보")
                    return quotes
                else:
                    print("⚠️ 명언 검색 결과가 올바르지 않아 기본 명언을 사용합니다.")
                    return fallback_quotes
            else:
                print("⚠️ quote_retriever 사용 불가 - 기본 명언 사용")
                return fallback_quotes

        except Exception as e:
            print(f"⚠️ 명언 검색 중 오류 발생: {e}")
            print("기본 명언을 사용합니다.")
            return fallback_quotes
    
    @staticmethod
    def format_quote_message(quote_data: Dict, current_index: int) -> str:
        """명언 제시 메시지 포맷팅"""
        quote_text = quote_data["quote"]
        author_text = quote_data["author"]
        similarity = quote_data.get("similarity", 0)
        
        return f"다음 명언은 어떠신가요?\n\n💬 \"{quote_text}\"\n✍️ 저자: {author_text}\n📊 유사도: {similarity:.3f}\n\n이 명언을 선택하시겠습니까? (예/아니오)"

class ConversationHelper:
    """대화 관련 유틸리티 함수들"""
    
    @staticmethod
    def is_quit_command(user_input: str) -> bool:
        """종료 명령어 확인"""
        quit_commands = ['quit', 'exit', '종료']
        return any(cmd in user_input.strip().lower() for cmd in quit_commands)
    
    @staticmethod
    def parse_advice_response(response_text: str) -> tuple[str, List[str]]:
        """조언 응답 파싱"""
        advice = "대화를 통해 행복을 찾아가시길 바랍니다."
        keywords = ["대화", "행복", "고민"]
        
        try:
            lines = response_text.split('\n')
            for line in lines:
                if line.startswith('조언:'):
                    advice = line.replace('조언:', '').strip()
                elif line.startswith('키워드:'):
                    keywords_text = line.replace('키워드:', '').strip()
                    keywords = [k.strip() for k in keywords_text.split(',')]
        except Exception:
            pass  # 기본값 사용
        
        return advice, keywords

# === LangGraph 노드 함수들 ===
def validate_user_input(state: ChatbotState) -> ChatbotState:
    user_input = state["user_message"]
    if not isinstance(user_input, str):
        raise TypeError("User message must be a string")
    
    user_input = user_input.strip()
    if not user_input:
        raise ValueError("User message cannot be empty")
        
    if len(user_input) > 150:
        raise ValueError("User message cannot be longer than 150 characters")
    
    return {
        **state,
        "user_message": user_input,
        "status": "validated"
    }

def chatbot(state: ChatbotState) -> ChatbotState:
    # Initialize chat history if empty
    chat_history = state["chat_history"]
    if not chat_history:
        chat_history = ChatMessageHistory()
        
    # Format chat history for prompt if needed
    formatted_history = ""
    if chat_history.messages:
        formatted_history = "\n".join([
            f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
            for msg in chat_history.messages[-6:]  # 최근 6개 메시지만 사용
        ])
        
    chain = LLMChainBuilder.build_chat_chain()
    response = chain.invoke({
        "user_input": f"{formatted_history}\n\nUser: {state['user_message']}" if formatted_history else state["user_message"]
    })

    return {
        **state,
        "chatbot_message": str(response.content),
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    }

def save_history(state: ChatbotState) -> ChatbotState:
    chat_history = state["chat_history"]

    chat_history.add_messages([
        HumanMessage(content=state["user_message"]),
        AIMessage(content=state["chatbot_message"])
    ])
    
    return {
        **state,
        "chat_history": chat_history 
    }

def analyze_chat_history(state: ChatbotState) -> ChatbotState:
    chat_history = state["chat_history"]

    # 사용자가 종료 명령어를 입력했는지 확인
    user_input = state.get("user_message", "").strip().lower()
    is_quit_command = ConversationHelper.is_quit_command(user_input)
    
    # 대화 턴 수가 TURN_THRESHOLD 이상이거나 종료 명령어가 입력된 경우에만 분석을 진행
    if len(chat_history.messages) < TURN_THRESHOLD and not is_quit_command:
        raise ValueError(f"Chat history must be at least {TURN_THRESHOLD} messages")
    
    # 분석 체인을 생성하고 실행한다.
    analysis_chain = LLMChainBuilder.build_analysis_chain()
    analysis_response = analysis_chain.invoke({
        "chat_history": str(chat_history)
    })
    chat_analysis = analysis_response.content
    return {
        **state,
        "chat_analysis": str(chat_analysis)
    }

def generate_advice(state: ChatbotState) -> ChatbotState:
    """대화 분석을 바탕으로 사용자에 적합한 조언을 생성한다."""
    chain = LLMChainBuilder.build_advice_chain()

    chat_analysis = state["chat_analysis"]
    result = chain.invoke({"chat_history": chat_analysis})
    
    # 응답 텍스트 파싱
    advice, keywords = ConversationHelper.parse_advice_response(str(result.content))
    
    # 명언 검색
    retrieved_quotes = QuoteManager.search_quotes(chat_analysis)

    return {**state,
        "retrieved_quotes_and_authors": retrieved_quotes,
        "advice": advice,
        "keywords": keywords,
        "candidate_quotes": retrieved_quotes,
        "current_quote_index": 0,
        "quote_selection_complete": False,
        "quote": "",
        "author": ""
    }

def present_quote(state: ChatbotState) -> ChatbotState:
    """현재 인덱스의 명언을 사용자에게 제시한다."""
    candidate_quotes = state["candidate_quotes"]
    current_index = state["current_quote_index"]
    
    if not candidate_quotes:
        return {
            **state,
            "chatbot_message": "죄송합니다. 추천할 명언을 찾을 수 없어서 대화를 종료하겠습니다.",
            "quote_selection_complete": True
        }
    
    # 현재 명언 가져오기
    current_quote = candidate_quotes[current_index]
    message = QuoteManager.format_quote_message(current_quote, current_index)
    
    return {
        **state,
        "chatbot_message": message
    }

def process_quote_selection(state: ChatbotState) -> ChatbotState:
    """사용자의 명언 선택 응답을 처리한다."""
    user_input = state["user_message"].strip().lower()
    candidate_quotes = state["candidate_quotes"]
    current_index = state["current_quote_index"]
    
    if user_input in ['예', 'yes', 'y', '네', '선택']:
        # 현재 명언 선택 확정
        selected_quote = candidate_quotes[current_index]
        return {
            **state,
            "quote": selected_quote["quote"],
            "author": selected_quote["author"],
            "quote_selection_complete": True,
            "chatbot_message": "좋은 선택이에요! 명언이 확정되었습니다."
        }
    
    elif user_input in ['아니오', 'no', 'n', '아니', '다음']:
        # 다음 명언으로 이동 (순환)
        next_index = (current_index + 1) % len(candidate_quotes)
        return {
            **state,
            "current_quote_index": next_index,
            "chatbot_message": "다음 명언을 보여드릴게요!"
        }
    
    else:
        # 잘못된 입력
        return {
            **state,
            "chatbot_message": "'예' 또는 '아니오'로 답해주세요."
        }

# === 분기 엣지 정의 ===
def should_analyze_chat_history(state: ChatbotState) -> str:
    # 사용자가 종료 명령어를 입력한 경우 체크
    user_input = state.get("user_message", "").strip().lower()
    
    if ConversationHelper.is_quit_command(user_input):
        return f"messages >= {TURN_THRESHOLD}"
    
    if len(state["chat_history"].messages) >= TURN_THRESHOLD:
        return f"messages >= {TURN_THRESHOLD}"
    else:
        return f"messages < {TURN_THRESHOLD}"

# === LangGraph 워크플로우 구성 ===
workflow = StateGraph(ChatbotState)

# 노드 추가
workflow.add_node("validate_user_input", validate_user_input)
workflow.add_node("chatbot", chatbot)
workflow.add_node("save_history", save_history)
workflow.add_node("analyze_chat_history", analyze_chat_history)
workflow.add_node("generate_advice", generate_advice)
workflow.add_node("present_quote", present_quote)
workflow.add_node("process_quote_selection", process_quote_selection)

# 엣지 연결
workflow.add_edge(START, "validate_user_input")
workflow.add_edge("validate_user_input", "chatbot")
workflow.add_edge("chatbot", "save_history")

# 조건부 분기 추가
workflow.add_conditional_edges(
    "save_history",
    should_analyze_chat_history,
    path_map={
        f"messages >= {TURN_THRESHOLD}": "analyze_chat_history",
        f"messages < {TURN_THRESHOLD}": END
    }
)

# analyze_chat_history에서 generate_advice로
workflow.add_edge("analyze_chat_history", "generate_advice")
workflow.add_edge("generate_advice", "present_quote")
workflow.add_edge("present_quote", END)
workflow.add_edge("process_quote_selection", END)

# 그래프 컴파일
graph = workflow.compile()

# === 통합된 챗봇 클래스 ===
class EnhancedSolarChatbot:
    def __init__(self):
        self._init_state()
        self.quote_selection_mode = False
        print("🚀 Enhanced Solar Chatbot with LangGraph 초기화 완료")
    
    def _init_state(self):
        """상태 초기화"""
        self.state = {
            "user_id": "",
            "thread_num": "",
            "user_message": "",
            "chatbot_message": "",
            "timestamp": "",
            "chat_history": ChatMessageHistory(),
            "status": "",
            "quote": "",
            "author": "",
            "retrieved_quotes_and_authors": [],
            "candidate_quotes": [],
            "current_quote_index": 0,
            "quote_selection_complete": False,
            "chat_analysis": "",
            "keywords": [],
            "advice": ""
        }
    
    def run_chatbot_once(self, user_input, user_id, thread_num):
        """단일 턴 대화 실행"""
        # 상태 업데이트
        self.state["user_message"] = user_input
        self.state["user_id"] = user_id
        self.state["thread_num"] = thread_num

        try:
            # 명언 선택 모드인지 확인
            if self.state.get('candidate_quotes') and not self.state.get('quote_selection_complete', False):
                self.quote_selection_mode = True
                
            if self.quote_selection_mode:
                # 명언 선택 모드 처리
                self.state = validate_user_input(self.state)
                self.state = process_quote_selection(self.state)
                
                # 선택이 완료되었는지 확인
                if self.state.get('quote_selection_complete'):
                    print(f"✅ 명언 선택 완료: {self.state['quote'][:50]}...")
                    self.quote_selection_mode = False
                    return self.state
                else:
                    # 다음 명언 제시
                    self.state = present_quote(self.state)
                    return self.state
            else:
                # 일반 대화 모드 - LangGraph 실행
                result = graph.invoke(self.state)
                self.state.update(result)
                
                # exit 명령어나 TURN_THRESHOLD턴 후 분석이 완료되었는지 확인
                if (len(self.state["chat_history"].messages) >= TURN_THRESHOLD or 
                    ConversationHelper.is_quit_command(user_input)):
                    
                    if self.state.get('advice') and self.state.get('keywords'):
                        print(f"🎉 대화 완료 - 분석 결과 준비됨")
                        
                        # 명언 선택 모드 시작
                        if self.state.get('candidate_quotes'):
                            print("🔄 명언 선택 모드 시작")
                            self.quote_selection_mode = True
                
                return self.state
                
        except Exception as e:
            print(f"❌ 챗봇 실행 오류: {e}")
            return {
                **self.state,
                "chatbot_message": "죄송해요, 지금 대화하는데 문제가 생겼어요. 잠시 후 다시 시도해주시겠어요?",
                "status": "error"
            }
    
    def get_conversation_summary(self):
        """대화 요약 정보 반환"""
        return {
            "message_count": len(self.state["chat_history"].messages),
            "analysis_ready": len(self.state["chat_history"].messages) >= TURN_THRESHOLD,
            "quote_selection_mode": self.quote_selection_mode,
            "quote_selected": bool(self.state.get("quote")),
            "advice": self.state.get("advice", ""),
            "keywords": self.state.get("keywords", [])
        }

# === 세션 관리 ===
chatbot_sessions = {}
session_lock = threading.Lock()

def get_chatbot_instance(user_id, thread_num):
    """사용자별 Enhanced Solar 챗봇 인스턴스 가져오기 또는 생성"""
    session_key = f"{user_id}_{thread_num}"
    
    with session_lock:
        if session_key not in chatbot_sessions:
            chatbot_sessions[session_key] = {
                'chatbot': EnhancedSolarChatbot(),
                'created_at': datetime.now(),
                'last_used': datetime.now()
            }
            print(f"🚀 새로운 Enhanced Solar 챗봇 세션 생성: {session_key}")
        else:
            chatbot_sessions[session_key]['last_used'] = datetime.now()
    
    return chatbot_sessions[session_key]['chatbot']

# === API 엔드포인트들 ===
@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    global EMBEDDING_LOADING, EMBEDDING_AVAILABLE
    
    # 임베딩 시스템 상태 결정
    if EMBEDDING_AVAILABLE:
        embedding_status = "✅ ACTIVE"
        message = "🎉 Solar API + LangGraph + 개인화 명언 추천 시스템 완전 활성화!"
    elif EMBEDDING_LOADING:
        embedding_status = "🔄 LOADING"
        message = "📥 Solar API + LangGraph 동작 중 + 임베딩 시스템 백그라운드 로딩 중..."
    else:
        embedding_status = "⚠️ FALLBACK"
        message = "🔥 Solar API + LangGraph 동작 중 + 기본 명언 시스템 사용"
    
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'activeConversations': len(chatbot_sessions),
        'model': 'Solar Pro API + LangGraph',
        'embedding_system': embedding_status,
        'embedding_available': EMBEDDING_AVAILABLE,
        'embedding_loading': EMBEDDING_LOADING,
        'quote_retriever_available': QUOTE_RETRIEVER_AVAILABLE,
        'message': message
    })

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """메시지 전송 API - LangGraph 기반 Enhanced Solar 챗봇 사용"""
    try:
        data = request.get_json()
        
        # 필수 필드 확인
        required_fields = ['userId', 'threadNum', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_id = data['userId']
        thread_num = data['threadNum']
        content = data['content']
        
        print(f"🤖 Enhanced Solar API 호출 - User: {user_id}, Message: {content}")
        
        # Enhanced Solar 챗봇 인스턴스 가져오기
        chatbot = get_chatbot_instance(user_id, thread_num)
        
        # LangGraph로 응답 생성
        result_state = chatbot.run_chatbot_once(content, user_id, thread_num)
        
        ai_response = result_state.get('chatbot_message', '응답을 생성할 수 없습니다.')
        print(f"✨ Enhanced Solar API 응답: {ai_response}")
        
        # 응답 데이터 구성
        response_data = {
            'userId': user_id,
            'threadNum': thread_num,
            'timestamp': result_state.get('timestamp', datetime.now().isoformat()),
            'status': result_state.get('status', 'completed'),
            'content': ai_response,
            'quote': None,
            'model': 'Solar Pro + LangGraph',
            'embedding_system': 'Enhanced FAISS',
            'conversation_summary': chatbot.get_conversation_summary()
        }
        
        # 명언 선택이 완료된 경우
        if result_state.get('quote_selection_complete') and result_state.get('quote'):
            response_data['quote'] = {
                'id': str(uuid.uuid4()),
                'text': result_state['quote'],
                'author': result_state['author'],
                'advice': result_state.get('advice', ''),
                'keywords': result_state.get('keywords', []),
                'method': 'langgraph_enhanced_selection'
            }
            print(f"📜 최종 명언 선택 완료: {result_state['quote'][:50]}... - {result_state['author']}")
            print(f"🎯 조언: {result_state.get('advice', '')}")
            print(f"🔑 키워드: {result_state.get('keywords', [])}")
        
        # TURN_THRESHOLD 턴 분석 완료 시 추가 정보
        if len(result_state.get('chat_history', ChatMessageHistory()).messages) >= TURN_THRESHOLD:
            if result_state.get('advice'):
                response_data['analysis_complete'] = True
                response_data['advice'] = result_state.get('advice', '')
                response_data['keywords'] = result_state.get('keywords', [])
                print(f"🎉 대화 분석 완료 - 조언: {result_state.get('advice', '')}")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'model': 'Solar Pro + LangGraph'
        }), 500

@app.route('/api/chat/status', methods=['GET'])
def get_status():
    """상태 확인 API (폴링용)"""
    try:
        user_id = request.args.get('userId')
        thread_num = request.args.get('threadNum')
        
        if not user_id or not thread_num:
            return jsonify({'error': 'Missing userId or threadNum'}), 400
        
        # 챗봇 인스턴스가 존재하는지 확인
        session_key = f"{user_id}_{thread_num}"
        
        if session_key in chatbot_sessions:
            chatbot = chatbot_sessions[session_key]['chatbot']
            
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'active',
                'model': 'Solar Pro + LangGraph',
                'embedding_system': 'Enhanced FAISS',
                'conversation_summary': chatbot.get_conversation_summary()
            })
        else:
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'inactive',
                'model': 'Solar Pro + LangGraph',
                'embedding_system': 'Enhanced FAISS'
            })
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'model': 'Solar Pro + LangGraph'
        }), 500

if __name__ == '__main__':
    print("🚀 Enhanced Solar API + LangGraph 서버 시작 중...")
    print("📡 포트: 3001")
    print("🔥 모델: Solar Pro API + LangGraph StateGraph")
    print("🧠 임베딩: Enhanced SentenceTransformer + FAISS")
    print("📊 명언 검색: utils.quote_retriever")
    print("🎯 분석: 대화 내용 분석 + 명언 선택")
    print("🔧 디버그 모드: False")
    print("🌐 CORS 활성화됨")
    print("✨ LangGraph 기반 개인화된 명언 추천 시스템!")
    
    app.run(host='0.0.0.0', port=3001, debug=False, use_reloader=False)
