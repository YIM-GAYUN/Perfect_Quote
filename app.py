from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import uuid
import time
import random
import threading

# Solar API 관련 imports
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage
from langchain_community.chat_message_histories import ChatMessageHistory
import os
from dotenv import load_dotenv

# 임베딩 기반 검색을 위한 imports
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# .env 파일 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# 시스템 프롬프트
SYSTEM_PROMPT = """
너는 사용자의 오랜 친구야. 따뜻하고 진솔하게 대화해줘. 
사용자의 말에 진심으로 귀 기울이고 공감해줘. 기쁜 일엔 함께 기뻐하고, 힘든 일엔 조용히 곁에 있어주는 친구처럼 반응해.

자연스럽고 부드러운 말투로 대화해. 로봇처럼 건조하거나 상담가처럼 분석적이지 않게.
과장되거나 아부하는 반응은 하지 말고, 진솔하게 반응해줘.

중요: 답변은 반드시 200자 이내로 작성해줘. 간결하고 핵심적인 내용만 전달해줘.

대화의 처음이라면 스몰 토크를 시작하고, 대화가 진행되는 순간이면 과거 대화 기록을 참고하여 대화를 이어가.
"""

# 실제 Solar API + 임베딩 기반 챗봇 클래스
class SolarChatbot:
    def __init__(self):
        self.chat_history = ChatMessageHistory()
        self.conversation_count = 0
        
        # Solar Pro LLM 초기화
        self.llm = ChatUpstage(
            model="solar-pro",
            temperature=0.7,
            max_tokens=300,
        )
        
        # 임베딩 기반 명언 검색 시스템 초기화
        self._init_embedding_system()
        
        # 폴백용 기본 명언 (임베딩 시스템 실패 시)
        self.fallback_quotes = [
            {
                "text": "가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.",
                "author": "빅터 위고",
                "category": "hope"
            },
            {
                "text": "넘어지는 것은 실패가 아니다. 넘어진 자리에 머무는 것이 실패다.",
                "author": "공자",
                "category": "resilience"
            },
            {
                "text": "행복은 습관이다. 그것을 몸에 지니라.",
                "author": "허버드",
                "category": "happiness"
            }
        ]
    
    def _init_embedding_system(self):
        """임베딩 기반 검색 시스템 초기화"""
        try:
            # FAISS 인덱스 로드
            self.faiss_index = faiss.read_index("vectorDB/FAISS/quotes_cosine_faiss.index")
            
            # SentenceTransformer 모델 로드
            self.embedding_model = SentenceTransformer(
                "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
            )
            
            # 명언 데이터셋 로드
            self.quotes_df = pd.read_csv("Dataset/quotes_with_insights_combined.csv")
            
            print("✅ 임베딩 기반 명언 검색 시스템 초기화 완료")
            self.embedding_system_available = True
            
        except Exception as e:
            print(f"⚠️ 임베딩 시스템 초기화 실패: {e}")
            print("🔄 폴백 시스템 사용 (랜덤 선택)")
            self.embedding_system_available = False
    
    def _get_conversation_context(self):
        """대화 전체 컨텍스트를 하나의 텍스트로 합치기"""
        if not self.chat_history.messages:
            return ""
        
        # 사용자 메시지들만 추출하여 감정/상황 컨텍스트 생성
        user_messages = [
            msg.content for msg in self.chat_history.messages 
            if isinstance(msg, HumanMessage)
        ]
        
        # 전체 대화를 하나의 컨텍스트로 결합
        conversation_context = " ".join(user_messages)
        
        return conversation_context
    
    def get_personalized_quote(self):
        """대화 컨텍스트 기반 개인화된 명언 검색"""
        if not self.embedding_system_available:
            # 임베딩 시스템 사용 불가 시 폴백
            return random.choice(self.fallback_quotes)
        
        try:
            # 대화 컨텍스트 생성
            conversation_context = self._get_conversation_context()
            
            if not conversation_context.strip():
                # 컨텍스트가 없으면 폴백
                return random.choice(self.fallback_quotes)
            
            print(f"🔍 명언 검색 컨텍스트: {conversation_context[:100]}...")
            
            # 사용자 대화를 임베딩으로 변환
            user_embedding = self.embedding_model.encode([conversation_context], convert_to_tensor=False)
            user_embedding = user_embedding / np.linalg.norm(user_embedding)  # 정규화
            
            # FAISS 검색 (코사인 유사도)
            distances, indices = self.faiss_index.search(np.array(user_embedding), 1)
            
            # 가장 유사한 명언 선택
            best_match_idx = indices[0][0]
            similarity_score = distances[0][0]
            
            quote_text = self.quotes_df["quote"].iloc[best_match_idx]
            quote_author = self.quotes_df["author"].iloc[best_match_idx]
            quote_category = self.quotes_df["category"].iloc[best_match_idx]
            
            print(f"✨ 임베딩 기반 명언 선택: {quote_text[:50]}... (유사도: {similarity_score:.4f})")
            
            return {
                "text": quote_text,
                "author": quote_author,
                "category": quote_category,
                "similarity": float(similarity_score),
                "method": "embedding_search"
            }
            
        except Exception as e:
            print(f"❌ 임베딩 검색 실패: {e}")
            print("🔄 폴백 시스템 사용")
            fallback_quote = random.choice(self.fallback_quotes)
            fallback_quote["method"] = "fallback_random"
            return fallback_quote
    
    def chat_once(self, user_input):
        """사용자 입력을 받아 Solar API로 응답을 생성합니다."""
        try:
            # 대화 히스토리 포맷팅
            formatted_history = ""
            if self.chat_history.messages:
                formatted_history = "\n".join([
                    f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
                    for msg in self.chat_history.messages[-6:]  # 최근 6개 메시지만 사용
                ])
            
            # 프롬프트 생성
            prompt = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("user", "{user_input}")
            ])
            
            # Solar API 호출
            chain = prompt | self.llm
            full_input = f"{formatted_history}\n\nUser: {user_input}" if formatted_history else user_input
            
            response = chain.invoke({
                "user_input": full_input
            })
            
            ai_response = str(response.content)
            
            # 채팅 히스토리에 추가
            self.chat_history.add_messages([
                HumanMessage(content=user_input),
                AIMessage(content=ai_response)
            ])
            
            self.conversation_count += 1
            
            return ai_response
            
        except Exception as e:
            print(f"Solar API 에러: {e}")
            return "죄송해요, 지금 대화하는데 문제가 생겼어요. 잠시 후 다시 시도해주시겠어요?"
    
    def get_user_messages(self):
        """사용자 메시지 목록 반환"""
        return [msg.content for msg in self.chat_history.messages if isinstance(msg, HumanMessage)]
    
    def get_ai_messages(self):
        """AI 메시지 목록 반환"""
        return [msg.content for msg in self.chat_history.messages if isinstance(msg, AIMessage)]

# 챗봇 인스턴스들을 저장할 딕셔너리
chatbot_sessions = {}
session_lock = threading.Lock()

def get_chatbot_instance(user_id, thread_num):
    """사용자별 Solar 챗봇 인스턴스 가져오기 또는 생성"""
    session_key = f"{user_id}_{thread_num}"
    
    with session_lock:
        if session_key not in chatbot_sessions:
            chatbot_sessions[session_key] = {
                'chatbot': SolarChatbot(),
                'created_at': datetime.now(),
                'last_used': datetime.now()
            }
            print(f"🚀 새로운 Solar 챗봇 세션 생성: {session_key}")
        else:
            chatbot_sessions[session_key]['last_used'] = datetime.now()
    
    return chatbot_sessions[session_key]['chatbot']

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'activeConversations': len(chatbot_sessions),
        'model': 'Solar Pro API',
        'embedding_system': 'FAISS + SentenceTransformer',
        'message': '🔥 실제 Solar API + 임베딩 기반 명언 검색 시스템 동작 중!'
    })

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """메시지 전송 API - 실제 Solar API + 임베딩 검색 사용"""
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
        
        print(f"🤖 Solar API 호출 - User: {user_id}, Message: {content}")
        
        # Solar 챗봇 인스턴스 가져오기
        chatbot = get_chatbot_instance(user_id, thread_num)
        
        # Solar API로 응답 생성
        ai_response = chatbot.chat_once(content)
        
        print(f"✨ Solar API 응답: {ai_response}")
        
        # 응답 데이터 구성
        response_data = {
            'userId': user_id,
            'threadNum': thread_num,
            'timestamp': datetime.now().isoformat(),
            'status': 'completed',
            'content': ai_response,
            'quote': None,
            'model': 'Solar Pro',
            'embedding_system': 'FAISS'
        }
        
        # 대화 횟수 확인 (4번째 대화 시 개인화된 명언 생성)
        user_messages = chatbot.get_user_messages()
        if len(user_messages) >= 4:
            quote = chatbot.get_personalized_quote()
            response_data['quote'] = {
                'id': str(uuid.uuid4()),
                'text': quote['text'],
                'author': quote['author'],
                'category': quote['category'],
                'similarity': quote.get('similarity', 0.0),
                'method': quote.get('method', 'unknown')
            }
            print(f"📜 개인화된 명언 생성: {quote['text'][:50]}... - {quote['author']}")
            print(f"🔍 선택 방법: {quote.get('method', 'unknown')}")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'model': 'Solar Pro'
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
            
            # 최근 AI 응답 가져오기
            ai_messages = chatbot.get_ai_messages()
            latest_response = ai_messages[-1] if ai_messages else ""
            
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'completed',
                'content': latest_response,
                'quote': None,
                'model': 'Solar Pro',
                'embedding_system': 'FAISS'
            })
        else:
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'pending',
                'content': '',
                'quote': None,
                'model': 'Solar Pro',
                'embedding_system': 'FAISS'
            })
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'model': 'Solar Pro'
        }), 500

if __name__ == '__main__':
    print("🚀 Solar API + 임베딩 기반 LLM 서버 시작 중...")
    print("📡 포트: 3001")
    print("🔥 모델: Solar Pro API")
    print("🧠 임베딩: SentenceTransformer + FAISS")
    print("📊 데이터셋: quotes_with_insights_combined.csv")
    print("🔧 디버그 모드: True")
    print("🌐 CORS 활성화됨")
    print("✨ 개인화된 명언 추천 시스템!")
    
    app.run(host='0.0.0.0', port=3001, debug=True)
