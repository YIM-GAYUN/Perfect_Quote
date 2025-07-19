# 기존 그래프 구조 + 명언 검색 기능 (최소 변경)

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage
from langgraph.graph import StateGraph, START, END
from langchain_community.chat_message_histories import ChatMessageHistory
from utils.chatbot_utils import Chatbot
from utils.system_prompt import SYSTEM_PROMPT
import time
import json
from typing import TypedDict, Annotated, Optional
from dotenv import load_dotenv

load_dotenv()

# 기존 상태 + 명언 필드만 추가
class ChatbotState(TypedDict):
    user_id: Annotated[str, "User ID"]
    thread_num: Annotated[str, "Session ID"]
    user_message: Annotated[str, "User Message"]
    chatbot_message: Annotated[str, "Chatbot Message"]
    timestamp: Annotated[str, "Timestamp of the conversation"]
    chat_history: Annotated[ChatMessageHistory, "chat history of user and ai"]
    status: Annotated[str, "Status of the conversation"]
    quote: Annotated[str, "Quote for the conversation"]
    author: Annotated[str, "Author of the quote"]
    # 명언 기능을 위한 최소 추가
    quotes_data: Annotated[Optional[dict], "Quote search result"]
    # 명언 선택 모드
    quote_selection_mode: Annotated[bool, "Whether in quote selection mode"]
    current_quote_index: Annotated[int, "Current quote index for selection"]
    recommended_quotes: Annotated[list, "List of recommended quotes"]
    conversation_turns: Annotated[int, "Number of conversation turns"]

# 전역 챗봇 인스턴스
_chatbot_instance = None

def _get_chatbot():
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = Chatbot(
            model="solar-pro",
            temperature=0.7,
            max_tokens=300,
            enable_quotes=True
        )
    return _chatbot_instance

def validate_user_input(state: ChatbotState) -> ChatbotState:
    user_input = state["user_message"]
    if not isinstance(user_input, str):
        raise TypeError("User message must be a string")
    
    user_input = user_input.strip()
    if not user_input:
        raise ValueError("User message cannot be empty")
        
    if len(user_input) > 500:
        raise ValueError("User message cannot be longer than 500 characters")
    
    return {
        **state,
        "user_message": user_input
    }

def chatbot(state: ChatbotState) -> ChatbotState:
    chatbot_instance = _get_chatbot()
    user_input = state["user_message"]
    current_turns = len(state["chat_history"].messages) // 2
    
    # 명언 선택 모드 처리
    if state.get("quote_selection_mode", False):
        quotes = state.get("recommended_quotes", [])
        current_index = state.get("current_quote_index", 0)
        
        if not quotes:
            state["chat_history"].add_user_message(user_input)
            state["chat_history"].add_ai_message("명언을 찾을 수 없어서 일반 대화를 계속할게요.")
            return {
                **state,
                "chatbot_message": "명언을 찾을 수 없어서 일반 대화를 계속할게요.",
                "quote_selection_mode": False,
                "quote": "",
                "author": "",
                "quotes_data": None,
                "chat_history": state["chat_history"]
            }
        
        user_choice = user_input.lower().strip()
        
        # 명언 선택 (예)
        if user_choice in ['예', 'yes', 'y', '네', '선택']:
            selected_quote = quotes[current_index]
            
            # 최종 JSON 형식으로 응답
            final_quotes = []
            for i, q in enumerate(quotes):
                final_quotes.append((str(i), q["quote"], q["author"]))
            
            ai_response = f"좋은 선택이에요! 선택하신 명언: \"{selected_quote['quote']}\" - {selected_quote['author']}\n\n최종 결과:"
            
            state["chat_history"].add_user_message(user_input)
            state["chat_history"].add_ai_message(ai_response)
            
            return {
                **state,
                "chatbot_message": ai_response,
                "quote": selected_quote["quote"],
                "author": selected_quote["author"],
                "quotes_data": {
                    "selected_quote": selected_quote,
                    "final_result": final_quotes,
                    "all_quotes": quotes
                },
                "quote_selection_mode": False,
                "chat_history": state["chat_history"]
            }
        
        # 다음 명언 (아니오)
        elif user_choice in ['아니오', 'no', 'n', '아니', '다음']:
            next_index = (current_index + 1) % len(quotes)
            next_quote = quotes[next_index]
            
            if next_index == 0:
                message = "모든 명언을 확인했어요. 처음부터 다시 보여드릴게요.\n\n"
            else:
                message = "다음 명언이에요.\n\n"
            
            message += f"\"{next_quote['quote']}\"\n작가: {next_quote['author']}\n유사도: {next_quote['similarity']:.3f}\n\n이 명언을 선택하시겠습니까? (예/아니오)"
            
            state["chat_history"].add_user_message(user_input)
            state["chat_history"].add_ai_message(message)
            
            return {
                **state,
                "chatbot_message": message,
                "current_quote_index": next_index,
                "chat_history": state["chat_history"]
            }
        
        # 잘못된 입력
        else:
            message = "'예' 또는 '아니오'로 답해주세요."
            return {
                **state,
                "chatbot_message": message
            }
    
    # 일반 대화 처리
    original_history = chatbot_instance.history
    chatbot_instance.history = state["chat_history"]
    
    ai_response = chatbot_instance.chat_once(user_input)
    
    # 히스토리 업데이트
    state["chat_history"].add_user_message(user_input)
    state["chat_history"].add_ai_message(ai_response)
    
    updated_turns = len(state["chat_history"].messages) // 2
    
    # 8턴 후 자동으로 명언 추천 시작
    if updated_turns >= 8 and not state.get("quote_selection_mode", False):
        # 대화 요약 기반 명언 검색
        result = chatbot_instance.get_quotes_based_on_summary(top_k=3)
        
        if result["quotes"]:
            quotes = result["quotes"]
            print("[DEBUG] quotes: ", quotes)
            first_quote = quotes[0]
            
            quote_message = f"\n\n대화 내용을 분석해서 관련 명언을 찾았어요!\n\n\"{first_quote['quote']}\"\n작가: {first_quote['author']}\n유사도: {first_quote['similarity']:.3f}\n\n이 명언을 선택하시겠습니까? (예/아니오)"
            print("[DEBUG] quote_message: ", quote_message)

            # 명언 추천 메시지 추가
            state["chat_history"].add_ai_message(quote_message)
            
            return {
                **state,
                "chatbot_message": ai_response + quote_message,
                "quote_selection_mode": True,
                "current_quote_index": 0,
                "recommended_quotes": quotes,
                "quotes_data": {"summary": result["summary"], "quotes": quotes},
                "conversation_turns": updated_turns,
                "chat_history": state["chat_history"]
            }
    
    return {
        **state,
        "chatbot_message": ai_response,
        "quote": "",
        "author": "",
        "quotes_data": None,
        "conversation_turns": updated_turns,
        "chat_history": state["chat_history"]
    }

def save_history(state: ChatbotState) -> ChatbotState:
    return {
        **state,
        "status": "success",
        "timestamp": str(time.time())
    }

# 기존과 동일한 간단한 워크플로우
def build_graph():
    workflow = StateGraph(ChatbotState)
    workflow.add_node("validate_user_input", validate_user_input)
    workflow.add_node("chatbot", chatbot)
    workflow.add_node("save_history", save_history)

    workflow.add_edge(START, "validate_user_input")
    workflow.add_edge("validate_user_input", "chatbot")
    workflow.add_edge("chatbot", "save_history")
    workflow.add_edge("save_history", END)

    return workflow.compile()

class SimpleChatbotWithQuotes:
    """기존 구조 + 명언 기능 (최소 변경)"""
    
    def __init__(self):
        self.graph = build_graph()
        self._sessions = {}  # 세션별 상태 저장
    
    def chat_once(self, user_input: str, user_id: str = "user1", thread_num: str = "thread1"):
        """단일 턴 대화 실행"""
        session_key = f"{user_id}_{thread_num}"
        
        # 기존 상태가 있으면 가져오기, 없으면 새로 생성
        if session_key not in self._sessions:
            self._sessions[session_key] = self._create_initial_state(user_id, thread_num)
        
        current_state = self._sessions[session_key]
        current_state["user_message"] = user_input
        
        # 그래프 실행
        result = self.graph.invoke(current_state)
        
        # 상태 업데이트
        self._sessions[session_key] = result
        
        # 프론트엔드용 응답 형식
        response = {
            "chatbot_message": result["chatbot_message"],
            "status": result["status"],
            "timestamp": result["timestamp"],
            "user_id": result["user_id"],
            "thread_num": result["thread_num"]
        }
        
        # 명언 정보가 있으면 추가
        if result["quote"] and result["author"]:
            response["quote"] = result["quote"]
            response["author"] = result["author"]
        
        # 명언 검색 결과가 있으면 추가
        if result.get("quotes_data"):
            response["quotes_data"] = result["quotes_data"]
            
            # 최종 JSON 형식이 있으면 추가
            if "final_result" in result["quotes_data"]:
                response["final_result"] = result["quotes_data"]["final_result"]
        
        # 명언 선택 모드 정보 추가
        if result.get("quote_selection_mode"):
            response["quote_selection_mode"] = True
            quotes = result.get("recommended_quotes", [])
            current_index = result.get("current_quote_index", 0)
            if quotes and current_index < len(quotes):
                current_quote = quotes[current_index]
                response["current_quote"] = {
                    "quote": current_quote["quote"],
                    "author": current_quote["author"],
                    "similarity": current_quote.get("similarity", 0),
                    "index": current_index + 1,
                    "total": len(quotes)
                }
        
        return response
    
    def _create_initial_state(self, user_id: str, thread_num: str):
        """초기 상태 생성"""
        return {
            "user_id": user_id,
            "thread_num": thread_num,
            "user_message": "",
            "chatbot_message": "",
            "timestamp": "",
            "chat_history": ChatMessageHistory(),
            "status": "",
            "quote": "",
            "author": "",
            "quotes_data": None,
            "quote_selection_mode": False,
            "current_quote_index": 0,
            "recommended_quotes": [],
            "conversation_turns": 0
        }
    
    def get_conversation_history(self, user_id: str = "user1", thread_num: str = "thread1"):
        """대화 히스토리 조회"""
        session_key = f"{user_id}_{thread_num}"
        if session_key not in self._sessions:
            return []
        
        history = []
        messages = self._sessions[session_key]["chat_history"].messages
        
        for msg in messages:
            history.append({
                "role": "user" if isinstance(msg, HumanMessage) else "assistant",
                "content": msg.content
            })
        
        return history
    
    def reset_conversation(self, user_id: str = "user1", thread_num: str = "thread1"):
        """대화 초기화"""
        session_key = f"{user_id}_{thread_num}"
        if session_key in self._sessions:
            del self._sessions[session_key]

# 사용 예시
def test_simple_chatbot():
    """간단한 테스트"""
    chatbot = SimpleChatbotWithQuotes()
    
    print("=== 자동 명언 추천 챗봇 테스트 ===")
    print("4턴 대화 후 자동으로 명언이 추천됩니다!")
    
    test_messages = [
        "안녕하세요",
        "오늘 시험이 너무 어려웠어요", 
        "친구들은 다 잘 본 것 같은데 저만 못한 것 같아서 우울해요",  # 3턴째 - 자동 명언 추천
        "아니오",  # 첫 번째 명언 거절
        "아니오",  # 두 번째 명언 거절  
        "예"       # 세 번째 명언 선택
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n--- Turn {i} ---")
        print(f"사용자: {message}")
        
        response = chatbot.chat_once(message)
        print(f"챗봇: {response['chatbot_message']}")
        
        # 명언 선택 모드 정보 표시
        if response.get("quote_selection_mode"):
            current = response.get("current_quote")
            if current:
                print(f"현재 명언 ({current['index']}/{current['total']}): \"{current['quote'][:50]}...\"")
        
        # 선택된 명언 표시
        if response.get("quote") and not response.get("quote_selection_mode"):
            print(f"선택된 명언: \"{response['quote']}\" - {response['author']}")
        
        # 최종 JSON 결과 표시
        if response.get("final_result"):
            print(f"\n최종 JSON 결과:")
            print(json.dumps(response["final_result"], ensure_ascii=False, indent=2))
            break

def interactive_test():
    """대화형 테스트"""
    print("안녕하세요! \n딱 맞는 말에 오신 것을 환영합니다. \n사연을 들려주시면 챗봇이 알맞는 명언을 출력해드려요.")
    print("=" * 50)
    print("4턴 대화 후 자동으로 명언이 추천됩니다!")
    print("명언 선택 시 '예' 또는 '아니오'로 답해주세요.")
    print("'종료', 'quit', 'exit' 입력시 프로그램이 종료됩니다.")
    print("=" * 50)
    print("모델을 로딩 중입니다...")
    
    chatbot = SimpleChatbotWithQuotes()
    
    print("로딩 완료! 대화를 시작하세요.")
    print()
    
    turn = 0
    while True:
        turn += 1
        try:
            user_input = input(f"사용자: ").strip()
            
            if user_input.lower() in ['종료', 'quit', 'exit']:
                print("대화를 종료합니다. 좋은 하루 되세요!")
                break
            
            if not user_input:
                print("빈 입력입니다. 다시 입력해주세요.")
                turn -= 1
                continue
            
            response = chatbot.chat_once(user_input)
            print(f"챗봇: {response['chatbot_message']}")
            
            # 명언 선택 모드 정보 표시
            if response.get("quote_selection_mode"):
                current = response.get("current_quote")
                if current:
                    print(f"현재 명언 ({current['index']}/{current['total']})")
            
            # 최종 JSON 결과 표시
            if response.get("final_result"):
                print("\n" + "="*50)
                print("명언 선택이 완료되었습니다!")
                print("최종 JSON 결과:")
                print(json.dumps(response["final_result"], ensure_ascii=False, indent=2))
                print("="*50)
                
                continue_choice = input("\n대화를 계속하시겠어요? (예/아니오): ").strip().lower()
                if continue_choice in ['아니오', 'no', 'n']:
                    print("대화를 종료합니다. 좋은 하루 되세요!")
                    break
                else:
                    print("\n새로운 대화를 시작합니다!")
                    chatbot.reset_conversation()
                    turn = 0
            
            print()  # 줄바꿈
            
        except KeyboardInterrupt:
            print("\n\n프로그램을 종료합니다.")
            break
        except Exception as e:
            print(f"오류가 발생했습니다: {e}")
            print("다시 시도해주세요.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_simple_chatbot()
    else:
        interactive_test() 