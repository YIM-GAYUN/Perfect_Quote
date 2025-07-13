from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import uuid
import time
import random
import threading

app = Flask(__name__)
CORS(app)

# Mock 챗봇 클래스 (직접 포함)
class MockChatbot:
    def __init__(self):
        self.user_messages = []
        self.ai_messages = []
        
        # 미리 정의된 응답들
        self.responses = [
            "안녕하세요! 오늘 기분이 어떠신가요?",
            "그렇군요. 조금 더 자세히 말씀해주실 수 있나요?",
            "힘드셨겠어요. 그런 상황에서는 누구나 그럴 수 있어요.",
            "잘 들었습니다. 마음이 조금 가벼워지셨나요?",
            "좋은 이야기 나누어 주셔서 감사합니다. 항상 응원하고 있어요!"
        ]
        
        # 명언 데이터
        self.quotes = [
            {
                "text": "가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.",
                "author": "빅터 위고",
                "category": "hope"
            },
            {
                "text": "내일은 또 다른 날이다.",
                "author": "마가렛 미첼",
                "category": "hope"
            },
            {
                "text": "행복은 습관이다. 그것을 몸에 지니라.",
                "author": "허버드",
                "category": "happiness"
            }
        ]
    
    def chat_once(self, user_input):
        """사용자 입력을 받아 응답을 생성합니다."""
        # 사용자 메시지 저장
        self.user_messages.append(user_input)
        
        # 응답 생성 (대화 횟수에 따라)
        conversation_count = len(self.user_messages)
        
        if conversation_count <= len(self.responses):
            response = self.responses[conversation_count - 1]
        else:
            response = random.choice(self.responses)
        
        # 약간의 지연 시뮬레이션
        time.sleep(0.5)
        
        # AI 응답 저장
        self.ai_messages.append(response)
        
        return response
    
    def get_user_messages(self):
        """사용자 메시지 목록 반환"""
        return self.user_messages.copy()
    
    def get_ai_messages(self):
        """AI 메시지 목록 반환"""
        return self.ai_messages.copy()
    
    def get_random_quote(self):
        """랜덤 명언 반환"""
        return random.choice(self.quotes)

# 챗봇 인스턴스들을 저장할 딕셔너리
chatbot_sessions = {}
session_lock = threading.Lock()

def get_chatbot_instance(user_id, thread_num):
    """사용자별 챗봇 인스턴스 가져오기 또는 생성"""
    session_key = f"{user_id}_{thread_num}"
    
    with session_lock:
        if session_key not in chatbot_sessions:
            chatbot_sessions[session_key] = {
                'chatbot': MockChatbot(),
                'created_at': datetime.now(),
                'last_used': datetime.now()
            }
        else:
            chatbot_sessions[session_key]['last_used'] = datetime.now()
    
    return chatbot_sessions[session_key]['chatbot']

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'activeConversations': len(chatbot_sessions)
    })

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """메시지 전송 API"""
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
        
        # 챗봇 인스턴스 가져오기
        chatbot = get_chatbot_instance(user_id, thread_num)
        
        # 챗봇 응답 생성
        ai_response = chatbot.chat_once(content)
        
        # 응답 데이터 구성
        response_data = {
            'userId': user_id,
            'threadNum': thread_num,
            'timestamp': datetime.now().isoformat(),
            'status': 'completed',
            'content': ai_response,
            'quote': None
        }
        
        # 대화 횟수 확인 (4번째 대화 시 명언 생성)
        user_messages = chatbot.get_user_messages()
        if len(user_messages) >= 4:
            # Mock 챗봇에서 랜덤 명언 가져오기
            quote = chatbot.get_random_quote()
            response_data['quote'] = {
                'id': str(uuid.uuid4()),
                'text': quote['text'],
                'author': quote['author'],
                'category': quote['category']
            }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat()
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
                'quote': None
            })
        else:
            return jsonify({
                'userId': user_id,
                'threadNum': thread_num,
                'timestamp': datetime.now().isoformat(),
                'status': 'pending',
                'content': '',
                'quote': None
            })
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 Flask API 서버 시작 중...")
    print("📡 포트: 3001")
    print("🔧 디버그 모드: True")
    print("🌐 CORS 활성화됨")
    
    app.run(host='0.0.0.0', port=3001, debug=True)
