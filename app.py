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

# 시스템 프롬프트 import
from utils.system_prompt import SYSTEM_PROMPT

# 임베딩 기반 검색을 위한 imports (조건부)
import pandas as pd
import numpy as np

# 임베딩 시스템 상태 추적
EMBEDDING_AVAILABLE = False
EMBEDDING_LOADING = False

# 강제로 임베딩 시스템 활성화
EMBEDDING_LIBS_AVAILABLE = True
print("🔧 임베딩 시스템 강제 활성화")

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    print("✅ 임베딩 라이브러리 로드 완료")
except ImportError as e:
    print(f"⚠️ 임베딩 라이브러리 로드 실패: {e}")
    print("🔄 런타임에 다시 시도할 예정")

# .env 파일 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

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
        
        # 임베딩 시스템 백그라운드 초기화
        self.embedding_system_available = False
        if EMBEDDING_LIBS_AVAILABLE:
            print("🔄 임베딩 시스템 백그라운드 로딩 시작...")
            self._start_background_embedding_init()
        else:
            print("⚠️ 임베딩 라이브러리 없음 - 기본 기능만 사용")
        
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
    
    def _start_background_embedding_init(self):
        """별도 스레드에서 임베딩 시스템 초기화"""
        def background_init():
            global EMBEDDING_LOADING, EMBEDDING_AVAILABLE
            EMBEDDING_LOADING = True
            start_time = time.time()
            
            try:
                print("📥 임베딩 시스템 백그라운드 초기화 시작...")
                
                # 런타임에 라이브러리 재시도
                import_start = time.time()
                try:
                    import faiss
                    from sentence_transformers import SentenceTransformer
                    import_time = time.time() - import_start
                    print(f"✅ 런타임 라이브러리 import 성공 ({import_time:.2f}초)")
                except ImportError as import_err:
                    print(f"❌ 런타임 import 실패: {import_err}")
                    raise import_err
                
                # FAISS 인덱스 로드
                faiss_start = time.time()
                print("📁 FAISS 인덱스 로드 중...")
                self.faiss_index = faiss.read_index("vectorDB/FAISS/quotes_cosine_faiss.index")
                faiss_time = time.time() - faiss_start
                print(f"✅ FAISS 인덱스 로드 완료 ({faiss_time:.2f}초)")
                
                # SentenceTransformer 모델 로드
                model_start = time.time()
                print("🧠 SentenceTransformer 모델 로드 시작...")
                print("  📥 HuggingFace Hub에서 모델 확인 중...")
                
                # 메모리 사용량 확인
                try:
                    import psutil
                    memory_before = psutil.virtual_memory().used / (1024**3)
                    print(f"  💾 메모리 사용량 (로드 전): {memory_before:.2f}GB")
                    memory_tracking = True
                except ImportError:
                    print("  ⚠️ psutil 없음 - 메모리 추적 건너뛰기")
                    memory_tracking = False
                    memory_before = 0
                
                # 상세 진단을 위한 단계별 로드
                try:
                    # 로컬 모델 경로 우선 확인
                    local_models_dir = "./models/sentence-transformers"
                    
                    # 로컬 다국어 모델만 사용 (Cursor Rules 준수)
                    multilingual_model = "paraphrase-multilingual-mpnet-base-v2"
                    local_multilingual = os.path.join(local_models_dir, multilingual_model)
                    
                    # 로컬 모델 존재 여부 확인
                    if os.path.exists(local_multilingual):
                        model_path = local_multilingual
                        model_type = "다국어 모델 (로컬)"
                        print(f"  🏠 로컬 다국어 모델 사용: {model_path}")
                    else:
                        raise FileNotFoundError(f"로컬 모델이 없습니다: {local_multilingual}")
                        
                    # 로컬 캐시 폴더 사용하여 온라인 다운로드 금지
                    cache_check_start = time.time()
                    self.embedding_model = SentenceTransformer(
                        multilingual_model, 
                        cache_folder=local_models_dir
                    )
                    model_time = time.time() - model_start
                    cache_time = time.time() - cache_check_start
                    
                    # 메모리 사용량 확인
                    if memory_tracking:
                        memory_after = psutil.virtual_memory().used / (1024**3)
                        memory_used = memory_after - memory_before
                        print(f"  💾 메모리 사용량 (로드 후): {memory_after:.2f}GB (증가: {memory_used:.2f}GB)")
                    
                    print(f"✅ {model_type} 로드 완료 ({model_time:.2f}초, 실제: {cache_time:.2f}초)")
                    
                except Exception as model_err:
                    print(f"❌ 모델 로드 상세 오류: {model_err}")
                    raise model_err
                
                # 명언 데이터셋 로드
                dataset_start = time.time()
                print("📊 명언 데이터셋 로드 중...")
                self.quotes_df = pd.read_csv("Dataset/quotes_with_insights_combined.csv")
                dataset_time = time.time() - dataset_start
                print(f"✅ 명언 데이터셋 로드 완료 ({len(self.quotes_df)}개 명언, {dataset_time:.2f}초)")
                
                # 시스템 활성화
                self.embedding_system_available = True
                EMBEDDING_AVAILABLE = True
                EMBEDDING_LOADING = False
                
                total_time = time.time() - start_time
                print(f"🎉 임베딩 시스템 완전 활성화! (총 소요시간: {total_time:.2f}초)")
                print(f"📊 시간 분석: Import({import_time:.2f}s) + FAISS({faiss_time:.2f}s) + Model({model_time:.2f}s) + Dataset({dataset_time:.2f}s)")
                
            except Exception as e:
                error_time = time.time() - start_time
                print(f"❌ 임베딩 시스템 초기화 실패 ({error_time:.2f}초 후): {e}")
                print(f"❌ 에러 세부사항: {type(e).__name__}: {str(e)}")
                print("🔄 폴백 시스템 계속 사용")
                self.embedding_system_available = False
                EMBEDDING_AVAILABLE = False
                EMBEDDING_LOADING = False
        
        # 백그라운드 스레드 시작
        init_thread = threading.Thread(target=background_init, daemon=True)
        init_thread.start()
        print(f"🚀 백그라운드 임베딩 초기화 스레드 시작됨 (Thread ID: {init_thread.ident})")
    

    
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
    
    def _get_summarized_context_by_llm(self):
        """LLM을 통한 대화 요약 및 감정 분석"""
        if not self.chat_history.messages:
            return ""
        
        try:
            # 전체 대화 히스토리 포맷팅
            conversation_text = ""
            for msg in self.chat_history.messages[-8:]:  # 최근 8개 메시지만 사용
                role = "사용자" if isinstance(msg, HumanMessage) else "챗봇"
                conversation_text += f"{role}: {msg.content}\n"
            
            # LLM에게 대화 요약 요청
            summary_prompt = f"""
다음 대화를 분석하여 사용자의 현재 감정 상태와 상황을 30-40단어로 요약해주세요.
명언 추천을 위한 핵심 키워드와 감정을 포함해서 요약해주세요.

대화 내용:
{conversation_text}

요약 (30-40단어):"""

            # Solar API로 요약 생성
            summary_response = self.llm.invoke(summary_prompt)
            summarized_context = str(summary_response.content).strip()
            
            print(f"🧠 LLM 대화 요약: {summarized_context}")
            return summarized_context
            
        except Exception as e:
            print(f"⚠️ LLM 요약 실패: {e}")
            # 폴백: 기존 단순 결합 방식 사용
            return self._get_conversation_context()
    
    def get_personalized_quote(self):
        """대화 컨텍스트 기반 개인화된 명언 검색"""
        if not self.embedding_system_available:
            # 임베딩 시스템 사용 불가 시 폴백
            return random.choice(self.fallback_quotes)
        
        try:
            # LLM을 통한 대화 요약 사용
            conversation_context = self._get_summarized_context_by_llm()
            
            if not conversation_context.strip():
                # 컨텍스트가 없으면 폴백
                return random.choice(self.fallback_quotes)
            
            print(f"🔍 명언 검색 컨텍스트: {conversation_context}")
            
            # 요약된 대화를 임베딩으로 변환
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
                "method": "llm_summary_embedding_search",
                "summary_context": conversation_context
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
    global EMBEDDING_LOADING, EMBEDDING_AVAILABLE
    
    # 임베딩 시스템 상태 결정
    if EMBEDDING_AVAILABLE:
        embedding_status = "✅ ACTIVE"
        message = "🎉 Solar API + 개인화 명언 추천 시스템 완전 활성화!"
    elif EMBEDDING_LOADING:
        embedding_status = "🔄 LOADING"
        message = "📥 Solar API 동작 중 + 임베딩 시스템 백그라운드 로딩 중..."
    else:
        embedding_status = "⚠️ FALLBACK"
        message = "🔥 Solar API 동작 중 + 기본 명언 시스템 사용"
    
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'activeConversations': len(chatbot_sessions),
        'model': 'Solar Pro API',
        'embedding_system': embedding_status,
        'embedding_available': EMBEDDING_AVAILABLE,
        'embedding_loading': EMBEDDING_LOADING,
        'message': message
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
    
    app.run(host='0.0.0.0', port=3001, debug=False, use_reloader=False)
