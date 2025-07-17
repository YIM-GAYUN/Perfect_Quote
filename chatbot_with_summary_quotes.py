# 요약 기반 명언 추천 챗봇 사용 예시

from utils.chatbot_utils import Chatbot

def main():
    # 요약 기반 명언 추천 챗봇 생성
    chatbot = Chatbot(
        model="solar-pro",
        temperature=0.7,
        max_tokens=300,
        enable_quotes=True
    )
    
    # 대화형 모드 시작
    chatbot.interactive_chat_with_quotes()

def test_example():
    """테스트 예시"""
    chatbot = Chatbot(enable_quotes=True)
    
    # 여러 번 대화
    print("=== 대화 시작 ===")
    responses = []
    
    user_messages = [
        "안녕하세요",
        "오늘 학교에서 시험을 봤는데 너무 어려웠어요",
        "친구들은 다 잘 본 것 같은데 저만 못 본 것 같아서 우울해요",
        "앞으로 어떻게 해야 할지 모르겠어요"
    ]
    
    for msg in user_messages:
        response = chatbot.chat_once(msg)
        responses.append(response)
        print(f"사용자: {msg}")
        print(f"챗봇: {response}\n")
    
    # 대화 요약
    print("=== 대화 요약 ===")
    summary = chatbot.summarize_conversation()
    print(summary)
    
    # 명언 추천
    print("\n=== 명언 추천 ===")
    result = chatbot.get_quotes_based_on_summary()
    
    if result["quotes"]:
        for i, quote in enumerate(result["quotes"], 1):
            print(f"{i}. \"{quote['quote']}\" - {quote['author']}")
            print(f"   카테고리: {quote['category']} (유사도: {quote['similarity']:.3f})")
    else:
        print("관련 명언을 찾을 수 없습니다.")

if __name__ == "__main__":
    # 대화형 모드 실행
    main()
    
    # 또는 테스트 예시 실행
    # test_example() 