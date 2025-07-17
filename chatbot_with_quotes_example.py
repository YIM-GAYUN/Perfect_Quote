# 명언 추천 기능이 통합된 챗봇 사용 예시

from utils.chatbot_utils import Chatbot

def main():
    # 명언 추천 기능이 포함된 챗봇 생성
    chatbot = Chatbot(
        model="solar-pro",
        temperature=0.7,
        max_tokens=300,
        enable_quotes=True  # 명언 기능 활성화
    )
    
    print("🤖 명언 추천 챗봇이 시작되었습니다!")
    print("💡 'quit' 또는 'exit'를 입력하면 종료됩니다.")
    
    while True:
        user_input = input("\n사용자: ").strip()
        
        if user_input.lower() in ['quit', 'exit', '종료']:
            print("👋 대화를 종료합니다.")
            break
        
        if not user_input:
            print("❌ 빈 입력입니다. 다시 입력해주세요.")
            continue
        
        try:
            # 명언 추천 기능을 포함한 챗봇 응답
            result = chatbot.chat_once(user_input, include_quotes=True)
            
            # AI 응답 출력
            print(f"\n🤖 챗봇: {result['ai_response']}")
            
            # 관련 명언 출력
            if result['relevant_quotes']:
                print("\n📚 관련 명언:")
                for i, quote in enumerate(result['relevant_quotes'], 1):
                    print(f"  {i}. \"{quote['quote']}\" - {quote['author']}")
                    print(f"     (유사도: {quote['similarity']:.3f})")
            
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
    
    # 대화 통계 출력
    stats = chatbot.get_statistics()
    print(f"\n📊 대화 통계:")
    print(f"   총 대화 수: {stats['total_conversations']}")
    print(f"   명언 기능: {'활성화' if stats['quotes_enabled'] else '비활성화'}")
    
    # 대화 기록 저장
    chatbot.save_chat_history_to_csv()

def test_simple_usage():
    """간단한 사용 예시"""
    chatbot = Chatbot(enable_quotes=True)
    
    # 기존 방식 (호환성 유지)
    simple_response = chatbot.chat_once_simple("오늘 시험을 망쳤어요")
    print(f"간단한 응답: {simple_response}")
    
    # 새로운 방식 (명언 포함)
    full_response = chatbot.chat_once("오늘 시험을 망쳤어요", include_quotes=True)
    print(f"AI 응답: {full_response['ai_response']}")
    print(f"관련 명언 수: {len(full_response['relevant_quotes'])}")

if __name__ == "__main__":
    # 대화형 모드
    main()
    
    # 또는 간단한 테스트
    # test_simple_usage() 