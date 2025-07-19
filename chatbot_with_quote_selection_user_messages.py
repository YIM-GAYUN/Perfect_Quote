# 사용자 메시지 기반 명언 선택 챗봇 (대화 요약 vs 사용자 메시지 비교용)

from utils.chatbot_utils import Chatbot
import json

class ChatbotUserMessages(Chatbot):
    """
    사용자 메시지 기반 명언 추천 챗봇
    대화 요약 대신 사용자 메시지들을 직접 활용하여 명언 검색
    """
    
    def get_quotes_based_on_user_messages(self, top_k=3):
        """
        사용자 메시지들을 바탕으로 관련 명언을 추천합니다.
        
        Args:
            top_k: 추천할 명언 개수 (기본값: 3)
        
        Returns:
            dict: 사용자 메시지와 관련 명언을 포함한 딕셔너리
        """
        if not self.enable_quotes:
            return {"user_messages": "명언 기능이 비활성화되어 있습니다.", "quotes": []}
        
        # 사용자 메시지들 가져오기
        user_messages = self.get_user_messages()
        
        if not user_messages:
            return {"user_messages": "사용자 메시지가 없습니다.", "quotes": []}
        
        # 사용자 메시지들을 하나의 텍스트로 결합
        user_messages_text = " ".join(user_messages)
        
        try:
            # 사용자 메시지를 바탕으로 명언 검색
            from utils.quote_retriever import find_similar_quote_cosine_silent
            quotes = find_similar_quote_cosine_silent(user_messages_text, top_k)
            return {
                "user_messages": user_messages_text,
                "quotes": quotes
            }
        except Exception as e:
            print(f"⚠️ 명언 추천 중 오류 발생: {e}")
            return {"user_messages": user_messages_text, "quotes": []}
    
    def interactive_chat_with_quotes_selection(self):
        """
        대화형 챗봇 - 여러 번 대화 후 사용자 메시지 기반 명언 추천 및 선택
        """
        print("🤖 사용자 메시지 기반 명언 추천 챗봇이 시작되었습니다!")
        print("💡 일반 대화: 메시지 입력")
        print("💡 명언 추천 시작: '/quotes' 입력")
        print("💡 사용자 메시지 보기: '/messages' 입력")
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
                selected_quote = self._quote_selection_flow_user_messages()
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
            
            # 사용자 메시지 확인 요청
            if user_input.lower() == '/messages':
                if not self.history.messages:
                    print("❌ 확인할 사용자 메시지가 없습니다.")
                    continue
                
                user_messages = self.get_user_messages()
                print(f"\n📝 사용자 메시지들:")
                for i, msg in enumerate(user_messages, 1):
                    print(f"  {i}. {msg}")
                print(f"\n🔗 결합된 텍스트: {' '.join(user_messages)}")
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
    
    def _quote_selection_flow_user_messages(self):
        """
        사용자 메시지 기반 명언 선택 플로우
        
        Returns:
            dict: 선택된 명언 정보 또는 None
        """
        print("🔍 사용자 메시지를 분석하여 명언을 추천하는 중...")
        
        # 사용자 메시지 기반 명언 검색
        result = self.get_quotes_based_on_user_messages(top_k=3)
        
        if not result["quotes"]:
            print("❌ 관련 명언을 찾을 수 없습니다.")
            return None
        
        print(f"\n📝 분석된 사용자 메시지:")
        user_messages = self.get_user_messages()
        for i, msg in enumerate(user_messages, 1):
            print(f"  {i}. {msg}")
        
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

def main():
    """사용자 메시지 기반 명언 선택 플로우가 포함된 챗봇 실행"""
    print("🚀 사용자 메시지 기반 명언 선택 챗봇 시작!")
    print("=" * 50)
    
    # 챗봇 인스턴스 생성
    chatbot = ChatbotUserMessages(
        model="solar-pro",
        temperature=0.7,
        max_tokens=300,
        enable_quotes=True
    )
    
    # 명언 선택 기능이 포함된 대화형 모드 시작
    result = chatbot.interactive_chat_with_quotes_selection()
    
    if result:
        print("\n🎯 최종 결과:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    print("\n👋 프로그램을 종료합니다.")

def test_complete_flow():
    """전체 플로우 테스트 (자동화된 시뮬레이션)"""
    print("🧪 사용자 메시지 기반 전체 플로우 테스트 시작")
    print("=" * 50)
    
    chatbot = ChatbotUserMessages(enable_quotes=True)
    
    # 시뮬레이션된 대화
    test_messages = [
        "안녕하세요",
        "오늘 학교에서 시험을 봤는데 너무 어려웠어요",
        "친구들은 다 잘 본 것 같은데 저만 못 본 것 같아서 우울해요",
        "앞으로 어떻게 해야 할지 모르겠어요. 자신감도 없고 미래가 불안해요"
    ]
    
    print("📝 시뮬레이션된 대화:")
    for i, msg in enumerate(test_messages, 1):
        response = chatbot.chat_once(msg)
        print(f"{i}. 사용자: {msg}")
        print(f"   챗봇: {response[:50]}...")
    
    print("\n📊 사용자 메시지 모음:")
    user_messages = chatbot.get_user_messages()
    for i, msg in enumerate(user_messages, 1):
        print(f"{i}. {msg}")
    
    print(f"\n🔗 결합된 검색 텍스트:")
    combined_text = " ".join(user_messages)
    print(f"'{combined_text}'")
    
    print("\n🔍 명언 검색 결과:")
    result = chatbot.get_quotes_based_on_user_messages(top_k=3)
    
    if result["quotes"]:
        quotes_json = []
        for i, quote in enumerate(result["quotes"]):
            quote_data = {
                "id": str(i),
                "quote": quote["quote"],
                "author": quote["author"]
            }
            quotes_json.append(quote_data)
            print(f"{i+1}. \"{quote['quote'][:60]}...\" - {quote['author']}")
            print(f"   유사도: {quote['similarity']:.3f}")
        
        print(f"\n📋 JSON 형식 결과:")
        print(json.dumps(quotes_json, ensure_ascii=False, indent=2))
    else:
        print("❌ 명언을 찾을 수 없습니다.")

def demo_usage():
    """사용법 데모"""
    print("📖 사용법 안내 (사용자 메시지 기반)")
    print("=" * 50)
    print("1. 챗봇과 자유롭게 대화하세요")
    print("2. 최소 2턴 이상 대화한 후 '/quotes'를 입력하세요")
    print("3. 추천된 명언 중에서 '예' 또는 '아니오'로 선택하세요")
    print("4. 선택된 명언이 JSON 형식으로 출력됩니다")
    print("5. 'quit' 또는 'exit'로 종료할 수 있습니다")
    print()
    print("💡 추가 명령어:")
    print("   /messages - 현재까지의 사용자 메시지 확인")
    print("   /quotes   - 명언 추천 및 선택 시작")
    print("=" * 50)
    print("🔬 실험 목적: 대화 요약 vs 사용자 메시지 비교")

if __name__ == "__main__":
    # 사용법 안내
    demo_usage()
    
    # 메인 실행 모드 선택
    mode = input("실행 모드를 선택하세요 (1: 대화형, 2: 테스트): ").strip()
    
    if mode == "2":
        test_complete_flow()
    else:
        main() 