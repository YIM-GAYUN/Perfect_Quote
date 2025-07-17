from langchain_upstage import ChatUpstage
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_message_histories import ChatMessageHistory
from dotenv import load_dotenv
from utils.system_prompt import SYSTEM_PROMPT
from utils.summarize_prompt import SUMMARIZE_PROMPT
import os
import csv
from datetime import datetime

# 명언 추천 기능을 위한 import
try:
    from utils.quote_retriever import find_similar_quote_cosine_silent, load_resources
    QUOTE_FEATURE_AVAILABLE = True
except ImportError:
    QUOTE_FEATURE_AVAILABLE = False
    print("⚠️ 명언 추천 기능을 사용하려면 sentence-transformers와 faiss-cpu를 설치하세요.")

load_dotenv()

class Chatbot:
    """
    Perfect Quote Chatbot 클래스
    
    챗봇과의 대화를 관리하고, 대화 히스토리를 저장하며, CSV 로깅 기능을 제공합니다.
    여러 번 대화 후 요약을 통해 명언을 추천합니다.
    """
    
    def __init__(self, model="solar-pro", temperature=0.7, max_tokens=512, log_filename=None, enable_quotes=True):
        """
        챗봇을 초기화합니다.
        
        Args:
            model: 사용할 LLM 모델명 (기본값: solar-pro)
            temperature: 생성 텍스트의 창의성 (기본값: 0.7)
            max_tokens: 최대 토큰 수 (기본값: 512)
            log_filename: 로그 파일명 (기본값: None, 저장 시 자동 생성)
            enable_quotes: 명언 추천 기능 활성화 여부 (기본값: True)
        """
        self.history = ChatMessageHistory()
        
        # logs 디렉토리 생성
        self.logs_dir = "./logs"
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # 로그 파일명 설정 (저장 시점에 생성)
        self.log_filename = log_filename
        self.log_filepath = None
        
        # 명언 기능 설정
        self.enable_quotes = enable_quotes and QUOTE_FEATURE_AVAILABLE
        if self.enable_quotes:
            try:
                # 명언 모델과 데이터를 미리 로드 (한 번만)
                load_resources()
                print("✅ 명언 추천 기능이 활성화되었습니다.")
            except Exception as e:
                print(f"⚠️ 명언 추천 기능 초기화 실패: {e}")
                self.enable_quotes = False
        
        # 프롬프트 템플릿 생성
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("placeholder", "{chat_history}"),
            ("user", "{user_input}")
        ])
        
        # 요약 프롬프트 템플릿 생성
        self.summarize_prompt = ChatPromptTemplate.from_messages([
            ("system", SUMMARIZE_PROMPT),
            ("user", "{conversation_history}")
        ])
        
        # LLM 모델 초기화
        self.llm = ChatUpstage(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        # 체인 생성
        self.chain = self.prompt | self.llm
        self.summarize_chain = self.summarize_prompt | self.llm
    
    def chat_once(self, user_input):
        """
        기본 대화 기능 - 명언 추천 없이 단순 대화
        
        Args:
            user_input: 사용자 입력 문자열 (필수)
        
        Returns:
            str: AI 응답 내용
        """
        # 문자열로 변환하고 공백 제거
        user_input = str(user_input).strip()
        if not user_input:
            raise ValueError("입력값이 공백이거나 유효하지 않습니다.")
        
        # 챗봇 응답 생성
        response = self.chain.invoke({"user_input": user_input, "chat_history": self.history.messages})
        
        self.history.add_user_message(user_input)
        
        # response.content가 문자열인지 확인
        if isinstance(response.content, str):
            ai_response = response.content
        else:
            ai_response = str(response.content)
            
        self.history.add_ai_message(ai_response)
        
        return ai_response
    
    def summarize_conversation(self):
        """
        현재까지의 대화 내용을 요약합니다.
        
        Returns:
            str: 대화 요약 내용
        """
        if not self.history.messages:
            return "대화 내용이 없습니다."
        
        # 대화 히스토리를 문자열로 변환
        conversation_text = ""
        for msg in self.history.messages:
            role = "사용자" if isinstance(msg, HumanMessage) else "챗봇"
            conversation_text += f"{role}: {msg.content}\n"
        
        # 요약 생성
        summary_response = self.summarize_chain.invoke({"conversation_history": conversation_text})
        
        if isinstance(summary_response.content, str):
            return summary_response.content
        else:
            return str(summary_response.content)
    
    def get_quotes_based_on_summary(self, top_k=3):
        """
        대화 요약을 바탕으로 관련 명언을 추천합니다.
        
        Args:
            top_k: 추천할 명언 개수 (기본값: 3)
        
        Returns:
            dict: 요약과 관련 명언을 포함한 딕셔너리
        """
        if not self.enable_quotes:
            return {"summary": "명언 기능이 비활성화되어 있습니다.", "quotes": []}
        
        # 대화 요약 생성
        summary = self.summarize_conversation()
        
        try:
            # 요약을 바탕으로 명언 검색
            quotes = find_similar_quote_cosine_silent(summary, top_k)
            return {
                "summary": summary,
                "quotes": quotes
            }
        except Exception as e:
            print(f"⚠️ 명언 추천 중 오류 발생: {e}")
            return {"summary": summary, "quotes": []}
    
    def interactive_chat_with_quotes_selection(self):
        """
        대화형 챗봇 - 여러 번 대화 후 명언 추천 및 선택
        """
        print("🤖 명언 추천 챗봇이 시작되었습니다!")
        print("💡 일반 대화: 메시지 입력")
        print("💡 명언 추천 시작: '/quotes' 입력")
        print("💡 대화 요약: '/summary' 입력")
        print("💡 종료: 'quit' 또는 'exit' 입력")
        
        while True:
            user_input = input("\n사용자: ").strip()
            
            if user_input.lower() in ['quit', 'exit', '종료']:
                print("👋 대화를 종료합니다.")
                break
            
            if not user_input:
                print("❌ 빈 입력입니다. 다시 입력해주세요.")
                continue
            
            # 명언 추천 및 선택 플로우
            if user_input.lower() == '/quotes':
                if len(self.history.messages) < 4:  # 최소 2턴 대화 필요
                    print("❌ 명언 추천을 위해서는 최소 2번의 대화가 필요합니다.")
                    continue
                
                # 명언 선택 플로우 시작
                selected_quote = self._quote_selection_flow()
                if selected_quote:
                    # 최종 결과를 JSON 형식으로 출력
                    final_result = [
                        {
                            "id": "0",
                            "quote": selected_quote["quote"],
                            "author": selected_quote["author"]
                        }
                    ]
                    print(f"\n🎉 최종 선택된 명언:")
                    print(f"📝 JSON 결과: {final_result}")
                    return final_result
                else:
                    print("❌ 명언 선택이 취소되었습니다.")
                continue
            
            # 대화 요약 요청
            if user_input.lower() == '/summary':
                if not self.history.messages:
                    print("❌ 요약할 대화 내용이 없습니다.")
                    continue
                
                summary = self.summarize_conversation()
                print(f"\n📝 대화 요약:")
                print(summary)
                continue
            
            # 일반 대화
            try:
                ai_response = self.chat_once(user_input)
                print(f"\n🤖 챗봇: {ai_response}")
            except Exception as e:
                print(f"❌ 오류 발생: {e}")
        
        # 대화 통계 출력
        stats = self.get_statistics()
        print(f"\n📊 대화 통계:")
        print(f"   총 대화 수: {stats['total_conversations']}")
        print(f"   명언 기능: {'활성화' if stats['quotes_enabled'] else '비활성화'}")
        
        # 대화 기록 저장
        self.save_chat_history_to_csv()
        return None
    
    def _quote_selection_flow(self):
        """
        명언 선택 플로우 - 유사도 순서대로 명언을 제시하고 사용자가 선택
        
        Returns:
            dict: 선택된 명언 정보 또는 None
        """
        print("🔍 대화 내용을 분석하여 명언을 추천하는 중...")
        
        # 대화 요약 및 명언 검색
        result = self.get_quotes_based_on_summary(top_k=3)
        
        if not result["quotes"]:
            print("❌ 관련 명언을 찾을 수 없습니다.")
            return None
        
        print(f"\n📝 대화 요약:")
        print(result["summary"])
        print(f"\n📚 추천 명언을 확인해주세요:")
        
        quotes = result["quotes"]
        current_index = 0
        
        while True:
            # 현재 명언 표시
            quote = quotes[current_index]
            print(f"\n✨ 추천 명언 {current_index + 1}:")
            print(f"📜 \"{quote['quote']}\"")
            print(f"🖊️ 작가: {quote['author']}")
            print(f"🏷️ 카테고리: {quote['category']}")
            print(f"📊 유사도: {quote['similarity']:.3f}")
            
            # 사용자 선택 받기
            while True:
                choice = input("\n이 명언을 선택하시겠습니까? (예/아니오): ").strip().lower()
                
                if choice in ['예', 'yes', 'y', '네', '선택']:
                    print(f"✅ 명언이 선택되었습니다!")
                    return quote
                
                elif choice in ['아니오', 'no', 'n', '아니', '다음']:
                    # 다음 명언으로 이동
                    current_index = (current_index + 1) % len(quotes)
                    if current_index == 0:
                        print("💫 모든 명언을 확인했습니다. 처음부터 다시 보여드리겠습니다.")
                    break
                
                elif choice in ['취소', 'cancel', 'quit']:
                    return None
                
                else:
                    print("❌ '예' 또는 '아니오'로 답해주세요. (취소하려면 '취소' 입력)")

    # 기존 interactive_chat_with_quotes 메서드는 그대로 유지
    def interactive_chat_with_quotes(self):
        """
        대화형 챗봇 - 여러 번 대화 후 명언 추천 (기존 버전)
        """
        print("🤖 명언 추천 챗봇이 시작되었습니다!")
        print("💡 일반 대화: 메시지 입력")
        print("💡 명언 추천: '/quotes' 입력")
        print("💡 대화 요약: '/summary' 입력")
        print("💡 종료: 'quit' 또는 'exit' 입력")
        
        while True:
            user_input = input("\n사용자: ").strip()
            
            if user_input.lower() in ['quit', 'exit', '종료']:
                print("👋 대화를 종료합니다.")
                break
            
            if not user_input:
                print("❌ 빈 입력입니다. 다시 입력해주세요.")
                continue
            
            # 명언 추천 요청
            if user_input.lower() == '/quotes':
                if len(self.history.messages) < 4:  # 최소 2턴 대화 필요
                    print("❌ 명언 추천을 위해서는 최소 2번의 대화가 필요합니다.")
                    continue
                
                print("🔍 대화 내용을 분석하여 명언을 추천하는 중...")
                result = self.get_quotes_based_on_summary()
                
                print(f"\n📝 대화 요약:")
                print(result["summary"])
                
                if result["quotes"]:
                    print(f"\n📚 추천 명언:")
                    for i, quote in enumerate(result["quotes"], 1):
                        print(f"  {i}. \"{quote['quote']}\" - {quote['author']}")
                        print(f"     카테고리: {quote['category']} (유사도: {quote['similarity']:.3f})")
                else:
                    print("❌ 관련 명언을 찾을 수 없습니다.")
                continue
            
            # 대화 요약 요청
            if user_input.lower() == '/summary':
                if not self.history.messages:
                    print("❌ 요약할 대화 내용이 없습니다.")
                    continue
                
                summary = self.summarize_conversation()
                print(f"\n📝 대화 요약:")
                print(summary)
                continue
            
            # 일반 대화
            try:
                ai_response = self.chat_once(user_input)
                print(f"\n🤖 챗봇: {ai_response}")
            except Exception as e:
                print(f"❌ 오류 발생: {e}")
        
        # 대화 통계 출력
        stats = self.get_statistics()
        print(f"\n📊 대화 통계:")
        print(f"   총 대화 수: {stats['total_conversations']}")
        print(f"   명언 기능: {'활성화' if stats['quotes_enabled'] else '비활성화'}")
        
        # 대화 기록 저장
        self.save_chat_history_to_csv()
    
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
            'log_filename': self.log_filename,
            'quotes_enabled': self.enable_quotes
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