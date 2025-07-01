from langchain_upstage import ChatUpstage
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ChatMessageHistory
from dotenv import load_dotenv
from utils.system_prompt import SYSTEM_PROMPT
import os
import csv
from datetime import datetime

load_dotenv()

class Chatbot:
    """
    Perfect Quote Chatbot 클래스
    
    챗봇과의 대화를 관리하고, 대화 히스토리를 저장하며, CSV 로깅 기능을 제공합니다.
    """
    
    def __init__(self, model="solar-pro", temperature=0.7, max_tokens=512, log_filename=None):
        """
        챗봇을 초기화합니다.
        
        Args:
            model: 사용할 LLM 모델명 (기본값: solar-pro)
            temperature: 생성 텍스트의 창의성 (기본값: 0.7)
            max_tokens: 최대 토큰 수 (기본값: 512)
            log_filename: 로그 파일명 (기본값: None, 저장 시 자동 생성)
        """
        self.history = ChatMessageHistory()
        
        # logs 디렉토리 생성
        self.logs_dir = "./logs"
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # 로그 파일명 설정 (저장 시점에 생성)
        self.log_filename = log_filename
        self.log_filepath = None
        
        # 프롬프트 템플릿 생성
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("placeholder", "{chat_history}"),
            ("user", "{user_input}")
        ])
        
        # LLM 모델 초기화
        self.llm = ChatUpstage(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        # 체인 생성
        self.chain = self.prompt | self.llm
    
    def chat_once(self, user_input):
        """
        사용자 입력을 받아 챗봇 응답을 생성하고, 대화 히스토리에 저장한 뒤, 응답을 리턴합니다.
        
        Args:
            user_input: 사용자 입력 문자열 (필수)
        
        Returns:
            str: AI 응답 내용
        """
        # 문자열로 변환하고 공백 제거
        user_input = str(user_input).strip()
        if not user_input:
            raise ValueError("입력값이 공백이거나 유효하지 않습니다.")
        
        response = self.chain.invoke({"user_input": user_input, "chat_history": self.history.messages})
        
        self.history.add_user_message(user_input)
        
        # response.content가 문자열인지 확인
        if isinstance(response.content, str):
            ai_response = response.content
        else:
            ai_response = str(response.content)
            
        self.history.add_ai_message(ai_response)
        
        return ai_response
    
    def show_history(self):
        """
        대화 히스토리를 출력합니다.
        """
        for msg in self.history.messages:
            role = "User" if isinstance(msg, HumanMessage) else "AI"
            print(f"{role}: {msg.content}")
    
    def get_user_messages(self):
        """
        지금까지의 사용자 메시지들을 리스트로 반환합니다.
        
        Returns:
            list: 사용자 메시지 리스트
        """
        return [msg.content for msg in self.history.messages if isinstance(msg, HumanMessage)]
    
    def get_ai_messages(self):
        """
        지금까지의 AI 메시지들을 리스트로 반환합니다.
        
        Returns:
            list: AI 메시지 리스트
        """
        return [msg.content for msg in self.history.messages if isinstance(msg, AIMessage)]
    
    def save_chat_history_to_csv(self, filename=None):
        """
        대화 히스토리를 CSV 파일로 저장합니다.
        
        Args:
            filename: 저장할 CSV 파일명 (기본값: None, 자동 생성)
        """
        # 대화 히스토리에 내용이 있는지 확인
        if not self.history.messages:
            print("대화 내용이 없습니다. 저장할 내용이 없어요.")
            return
        
        # 파일명 설정 (저장 시점에 생성)
        if filename is None:
            if self.log_filename is None:
                # 자동으로 타임스탬프 기반 파일명 생성
                timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
                filename = f"chat_log_{timestamp}.csv"
            else:
                filename = self.log_filename
        
        filepath = os.path.join(self.logs_dir, filename)
            
        # CSV 파일이 존재하지 않으면 헤더와 함께 생성
        file_exists = os.path.exists(filepath)
        
        with open(filepath, 'a', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['role', 'content', 'content_length']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # 파일이 새로 생성된 경우 헤더 작성
            if not file_exists:
                writer.writeheader()
                # 시스템 프롬프트를 첫 번째 레코드로 추가
                writer.writerow({
                    'role': 'system',
                    'content': SYSTEM_PROMPT,
                    'content_length': len(SYSTEM_PROMPT)
                })
            
            # 각 메시지를 CSV에 기록
            for msg in self.history.messages:
                role = "user" if isinstance(msg, HumanMessage) else "ai"
                content = msg.content
                content_length = len(content)
                
                writer.writerow({
                    'role': role,
                    'content': content,
                    'content_length': content_length
                })
        print(f"대화 기록이 저장되었습니다.")
        print(f"대화 내용 통계: {self.get_statistics()}")
            
    
    def get_statistics(self):
        """
        대화 통계 정보를 반환합니다.
        
        Returns:
            dict: 통계 정보 딕셔너리
        """
        user_msgs = self.get_user_messages()
        ai_msgs = self.get_ai_messages()
        
        return {
            'total_conversations': len(user_msgs),
            'user_messages_count': len(user_msgs),
            'ai_messages_count': len(ai_msgs),
            'log_filename': self.log_filename
        }
    
    def clear_history(self):
        """
        대화 히스토리를 초기화합니다.
        """
        self.history = ChatMessageHistory()
    
    def set_log_filename(self, filename):
        """
        로그 파일명을 변경합니다.
        
        Args:
            filename: 새로운 로그 파일명
        """
        self.log_filename = filename