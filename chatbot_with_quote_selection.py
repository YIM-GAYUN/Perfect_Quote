# 명언 선택 기능이 포함된 챗봇 사용 예시

from utils.chatbot_utils import Chatbot
import json

def main():
    """명언 선택 플로우가 포함된 챗봇 실행"""
    print("🚀 명언 선택 챗봇 시작!")
    print("=" * 50)
    
    # 챗봇 인스턴스 생성
    chatbot = Chatbot(
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
    print("🧪 전체 플로우 테스트 시작")
    print("=" * 50)
    
    chatbot = Chatbot(enable_quotes=True)
    
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
    
    print("\n📊 대화 요약:")
    summary = chatbot.summarize_conversation()
    print(summary)
    
    print("\n🔍 명언 검색 결과:")
    result = chatbot.get_quotes_based_on_summary(top_k=3)
    
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
    print("📖 사용법 안내")
    print("=" * 50)
    print("1. 챗봇과 자유롭게 대화하세요")
    print("2. 최소 2턴 이상 대화한 후 '/quotes'를 입력하세요")
    print("3. 추천된 명언 중에서 '예' 또는 '아니오'로 선택하세요")
    print("4. 선택된 명언이 JSON 형식으로 출력됩니다")
    print("5. 'quit' 또는 'exit'로 종료할 수 있습니다")
    print()
    print("💡 추가 명령어:")
    print("   /summary - 현재까지의 대화 요약")
    print("   /quotes  - 명언 추천 및 선택 시작")
    print("=" * 50)

if __name__ == "__main__":
    # 사용법 안내
    demo_usage()
    
    # 메인 실행 모드 선택
    mode = input("실행 모드를 선택하세요 (1: 대화형, 2: 테스트): ").strip()
    
    if mode == "2":
        test_complete_flow()
    else:
        main() 