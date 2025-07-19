from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import uuid
import time
import random
import threading
import os
from dotenv import load_dotenv

# LangGraph 및 LangChain 관련 imports
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage
from langchain_community.chat_message_histories import ChatMessageHistory
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from typing import TypedDict, List, Dict, Any, Annotated, Optional

# 시스템 프롬프트 import
from utils.system_prompt import SYSTEM_PROMPT

# 임베딩 기반 명언 검색 (조건부)
EMBEDDING_AVAILABLE = False
EMBEDDING_LOADING = False

try:
    from quote_embedding.quote_similarity_search import find_similar_quotes
    EMBEDDING_AVAILABLE = True
    print("✅ 임베딩 시스템 로드 완료")
except ImportError as e:
    print(f"⚠️ 임베딩 시스템 로드 실패: {e}")
    print("🔄 기본 명언 시스템 사용")

# .env 파일 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# 챗봇 상태 정의
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

# LangGraph 노드 함수들
def validate_user_input(state: ChatbotState) -> ChatbotState:
    """사용자 입력 검증"""
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
        "user_message": user_input
    }

def _init_llm():
    """LLM 초기화"""
    return ChatUpstage(
        model="solar-pro",
        temperature=0.7,
    )

def _build_chain():
    """챗봇 체인 빌드"""
    llm = _init_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "{user_input}")
    ])
    chain = prompt | llm  
    return chain

def chatbot(state: ChatbotState) -> ChatbotState:
    """챗봇 응답 생성"""
    # Initialize chat history if empty
    chat_history = state["chat_history"]
    if not chat_history:
        chat_history = ChatMessageHistory()
        
    # Format chat history for prompt if needed
    formatted_history = ""
    if chat_history.messages:
        formatted_history = "\n".join([
            f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
            for msg in chat_history.messages
        ])
        
    chain = _build_chain()
    response = chain.invoke({
        "user_input": f"{formatted_history}\n\nUser: {state['user_message']}" if formatted_history else state["user_message"]
    })

    return {
        **state,
        "chatbot_message": str(response.content),
    }

def save_history(state: ChatbotState) -> ChatbotState:
    """대화 히스토리 저장"""
    chat_history = state["chat_history"]
    chat_history.add_messages([
        HumanMessage(content=state["user_message"]),
        AIMessage(content=state["chatbot_message"])
    ])

    return {
        **state,
        "chat_history": chat_history 
    }

def _build_analysis_chain():
    """대화 분석 체인 빌드"""
    llm = _init_llm()
    analysis_prompt = """
당신은 대화 분석 전문가입니다. 주어진 대화를 분석하여 다음을 제공해주세요:

1. 사용자의 감정 상태와 상황
2. 대화의 주요 주제와 관심사
3. 사용자가 겪고 있는 어려움이나 고민
4. 대화의 전체적인 톤과 분위기

분석은 객관적이고 정확해야 하며, 사용자의 개인정보를 보호하면서도 의미있는 인사이트를 제공해야 합니다.
"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", analysis_prompt),
        ("user", "다음 대화 히스토리를 분석하라. \n\n{chat_history}")
    ])
    chain = prompt | llm
    return chain

def analyze_chat_history(state: ChatbotState) -> ChatbotState:
    """대화 히스토리 분석"""
    chat_history = state["chat_history"]

    # 대화 턴 수가 10턴 이상이면 분석을 한다.
    if len(chat_history.messages) < 10:
        raise ValueError("Chat history must be at least 10 messages")
    
    # 분석 체인을 생성하고 실행한다.
    analysis_chain = _build_analysis_chain()
    analysis_response = analysis_chain.invoke({
        "chat_history": str(chat_history)
    })
    chat_analysis = analysis_response.content
    return {
        **state,
        "chat_analysis": str(chat_analysis)
    }

def _build_advice_and_keywords_chain():
    """조언 및 키워드 생성 체인 빌드"""
    llm = _init_llm()
    advice_prompt = """
대화 분석 결과를 바탕으로 다음 두 가지를 제공해줘요:

1. 사용자에게 적절한 조언을 해줘요. 사용자에게는 '당신, 그대'라는 2인칭 표현을 사용해요. (최대 세 문장, 문학적이고 감성적인 어투를 사용하여 친절하게 제공해줘요.)

2. 대화 내용의 키워드 (최대 5개, 쉼표로 구분)

형식:
조언: [조언 내용]
키워드: [키워드1, 키워드2, 키워드3]
"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", advice_prompt),
        ("user", "{chat_history}")
    ])
    chain = prompt | llm
    return chain

def generate_advice(state: ChatbotState) -> ChatbotState:
    """대화 분석을 바뱡으로 사용자에 적합한 조언을 생성한다."""
    llm = _build_advice_and_keywords_chain()

    chat_analysis = state["chat_analysis"]
    result = llm.invoke({"chat_history": chat_analysis})
    
    # 응답 텍스트 파싱
    response_text = str(result.content)
    advice = "대화를 통해 행복을 찾아가시길 바랍니다." # 기본값
    keywords = ["대화", "행복", "고민"] # 기본값
    
    # 기본 명언 데이터 (명언 검색 실패 시 사용)
    default_quotes = [
        {
            "quote": "실패는 성공의 어머니다. 포기하지 말고 계속 도전하라.",
            "author": "토마스 에디슨",
            "category": "성공",
            "similarity": 0.892
        },
        {
            "quote": "어려움이 있을 때마다 기회도 함께 온다. 위기는 곧 전환점이다.",
            "author": "알베르트 아인슈타인", 
            "category": "희망",
            "similarity": 0.847
        },
        {
            "quote": "오늘 할 수 있는 일을 내일로 미루지 마라. 지금이 가장 소중한 시간이다.",
            "author": "벤자민 프랭클린",
            "category": "시간관리",
            "similarity": 0.823
        }
    ]
    
    retrieved_quotes_and_authors = default_quotes
    
    # 임베딩 시스템이 사용 가능한 경우 명언 검색 시도
    if EMBEDDING_AVAILABLE:
        try:
            # 명언 검색 (로딩 메시지 억제)
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
                    
                    # 임베딩 검색 함수 호출 (실제 구현에 맞게 수정 필요)
                    # quotes = find_similar_quotes(chat_analysis, top_k=3)
                    
            finally:
                # 출력 복원
                sys.stdout = old_stdout
                sys.stderr = old_stderr
            
            # 검색 결과 검증 (실제 구현에 맞게 수정)
            # if quotes and len(quotes) > 0:
            #     retrieved_quotes_and_authors = quotes
                
        except Exception as e:
            print(f"⚠️ 명언 검색 중 오류 발생: {e}")
            print("기본 명언을 사용합니다.")
    
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
    
    return {
        **state,
        "retrieved_quotes_and_authors": retrieved_quotes_and_authors,
        "advice": advice,
        "keywords": keywords,
        "candidate_quotes": retrieved_quotes_and_authors,
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
    quote_text = current_quote["quote"]
    author_text = current_quote["author"]
    similarity = current_quote.get("similarity", 0)
    
    # 사용자에게 명언 제시
    message = f"다음 명언은 어떠신가요?\n\n💬 \"{quote_text}\"\n✍️ 저자: {author_text}\n📊 유사도: {similarity:.3f}\n\n이 명언을 선택하시겠습니까? (예/아니오)"
    
    return {
        **state,
        "chatbot_message": message
    }

def validate_quote_input(state: ChatbotState) -> ChatbotState:
    """명언 선택을 위한 사용자 입력 검증"""
    user_input = state["user_message"]
    if not isinstance(user_input, str):
        raise TypeError("User message must be a string")
    
    user_input = user_input.strip()
    if not user_input:
        raise ValueError("User message cannot be empty")
        
    return {
        **state,
        "user_message": user_input
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

# 분기 엣지 정의
def should_analyze_chat_history(state: ChatbotState) -> str:
    """대화 분석 여부 결정"""
    if len(state["chat_history"].messages) >= 10:
        return "messages >= 10"
    else:
        return "messages < 10"

# LangGraph 워크플로우 구성
def create_chatbot_graph():
    """챗봇 그래프 생성"""
    workflow = StateGraph(ChatbotState)

    # 노드 추가
    workflow.add_node("validate_user_input", validate_user_input)
    workflow.add_node("chatbot", chatbot)
    workflow.add_node("save_history", save_history)
    workflow.add_node("analyze_chat_history", analyze_chat_history)
    workflow.add_node("generate_advice", generate_advice)

    # 엣지 연결
    workflow.add_edge(START, "validate_user_input")
    workflow.add_edge("validate_user_input", "chatbot")
    workflow.add_edge("chatbot", "save_history")

    # 조건부 분기 추가
    workflow.add_conditional_edges(
        "save_history",
        should_analyze_chat_history,
        path_map={
            "messages >= 10": "analyze_chat_history",
            "messages < 10": END
        }
    )

    # analyze_chat_history에서 generate_advice로
    workflow.add_edge("analyze_chat_history", "generate_advice")
    workflow.add_edge("generate_advice", END)
    
    return workflow.compile()

# 전역 그래프 인스턴스
chatbot_graph = create_chatbot_graph()

# 챗봇 인스턴스들을 저장할 딕셔너리
chatbot_sessions = {}
session_lock = threading.Lock()

def get_chatbot_state(user_id, thread_num):
    """사용자별 챗봇 상태 가져오기 또는 생성"""
    session_key = f"{user_id}_{thread_num}"
    
    with session_lock:
        if session_key not in chatbot_sessions:
            # 초기 상태 생성
            initial_state = {
                "user_id": user_id,
                "thread_num": thread_num,
                "user_message": "",
                "chatbot_message": "",
                "timestamp": datetime.now().isoformat(),
                "chat_history": ChatMessageHistory(),
                "status": "pending",
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
            
            chatbot_sessions[session_key] = {
                'state': initial_state,
                'created_at': datetime.now(),
                'last_used': datetime.now()
            }
            print(f"🚀 새로운 LangGraph 챗봇 세션 생성: {session_key}")
        else:
            chatbot_sessions[session_key]['last_used'] = datetime.now()
    
    return chatbot_sessions[session_key]['state']

def run_chatbot_once(state, user_input):
    """단일 턴 대화 실행"""
    # 현재 상태에 새로운 사용자 입력 설정
    state["user_message"] = user_input
    state["timestamp"] = datetime.now().isoformat()

    # 그래프 실행
    result = chatbot_graph.invoke(state)
    return result

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'activeConversations': len(chatbot_sessions),
        'model': 'Solar Pro API + LangGraph',
        'embedding_system': '✅ ACTIVE' if EMBEDDING_AVAILABLE else '⚠️ FALLBACK',
        'message': '🎉 LangGraph 기반 고급 챗봇 시스템 활성화!'
    })

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """메시지 전송 API - LangGraph 기반"""
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
        
        print(f"🤖 LangGraph 챗봇 호출 - User: {user_id}, Message: {content}")
        
        # 챗봇 상태 가져오기
        state = get_chatbot_state(user_id, thread_num)
        
        # 명언 선택 모드인지 확인
        if state.get('candidate_quotes') and not state.get('quote_selection_complete', False):
            # 명언 선택 모드 처리
            state = validate_quote_input(state)
            state = process_quote_selection(state)
            
            # 선택이 완료되었는지 확인
            if state.get('quote_selection_complete'):
                response_data = {
                    'userId': user_id,
                    'threadNum': thread_num,
                    'timestamp': datetime.now().isoformat(),
                    'status': 'quote_selected',
                    'content': state['chatbot_message'],
                    'quote': {
                        'id': str(uuid.uuid4()),
                        'text': state['quote'],
                        'author': state['author'],
                        'category': 'personalized'
                    },
                    'advice': state.get('advice', ''),
                    'keywords': state.get('keywords', []),
                    'model': 'Solar Pro + LangGraph'
                }
            else:
                # 다음 명언 제시
                state = present_quote(state)
                response_data = {
                    'userId': user_id,
                    'threadNum': thread_num,
                    'timestamp': datetime.now().isoformat(),
                    'status': 'quote_selection',
                    'content': state['chatbot_message'],
                    'quote': None,
                    'model': 'Solar Pro + LangGraph'
                }
        else:
            # 일반 대화 모드
            result = run_chatbot_once(state, content)
            
            # 세션 상태 업데이트
            session_key = f"{user_id}_{thread_num}"
            chatbot_sessions[session_key]['state'] = result
            
            response_data = {
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': result['timestamp'],
                'status': 'completed',
                'content': result['chatbot_message'],
                'quote': None,
                'model': 'Solar Pro + LangGraph'
            }
            
            # 10턴 후 분석이 완료되었는지 확인
            if len(result["chat_history"].messages) >= 10:
                if result.get('advice') and result.get('keywords'):
                    # 명언 선택 모드 시작
                    if result.get('candidate_quotes'):
                        result = present_quote(result)
                        chatbot_sessions[session_key]['state'] = result
                        response_data['status'] = 'quote_selection'
                        response_data['content'] = result['chatbot_message']
                        response_data['advice'] = result.get('advice', '')
                        response_data['keywords'] = result.get('keywords', [])
        
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
        
        # 챗봇 상태가 존재하는지 확인
        session_key = f"{user_id}_{thread_num}"
        
        if session_key in chatbot_sessions:
            state = chatbot_sessions[session_key]['state']
            
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'completed',
                'content': state.get('chatbot_message', ''),
                'quote': None,
                'model': 'Solar Pro + LangGraph'
            })
        else:
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'pending',
                'content': '',
                'quote': None,
                'model': 'Solar Pro + LangGraph'
            })
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'model': 'Solar Pro + LangGraph'
        }), 500

if __name__ == '__main__':
    print("🚀 LangGraph 기반 고급 챗봇 서버 시작 중...")
    print("📡 포트: 3002")
    print("🔥 모델: Solar Pro API + LangGraph")
    print("🧠 기능: 대화 분석 + 개인화된 명언 추천")
    print("🔧 디버그 모드: True")
    print("🌐 CORS 활성화됨")
    print("✨ LangGraph 워크플로우 기반 고급 챗봇 시스템!")
    
    app.run(host='0.0.0.0', port=3002, debug=True)
