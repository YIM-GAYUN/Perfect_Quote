# Perfect Quote Chatbot

명언 추천 챗봇 프로젝트입니다.

## 설치

```bash
# 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 또는
.venv\Scripts\activate  # Windows

# 패키지 설치
pip install -r requirements.txt
```

## 사용법

### 클래스 기반 사용법 (권장)

```python
from utils import Chatbot

# 챗봇 인스턴스 생성
chatbot = Chatbot(
    model="solar-pro",
    temperature=0.7,
    max_tokens=512
)

# 대화하기 (입력받음)
response = chatbot.chat_once()
print("AI:", response)

# 문자열로 직접 대화하기
response = chatbot.chat_once("안녕하세요!")
print("AI:", response)

# 대화 후 CSV 저장
response = chatbot.chat_once("오늘 날씨가 좋네요")
print("AI:", response)
chatbot.save_chat_history_to_csv()

# 대화 히스토리 확인
chatbot.show_history()

# 통계 정보
stats = chatbot.get_statistics()
print(f"총 대화 횟수: {stats['total_conversations']}")
```

### 고급 클래스 기능

```python
from utils import Chatbot

chatbot = Chatbot()

# 여러 번 대화
for _ in range(3):
    response = chatbot.chat_once_with_logging()
    print("AI:", response)

# 사용자 메시지만 가져오기
user_msgs = chatbot.get_user_messages()
print("사용자 메시지들:", user_msgs)

# AI 메시지만 가져오기  
ai_msgs = chatbot.get_ai_messages()
print("AI 메시지들:", ai_msgs)

# 히스토리 초기화
chatbot.clear_history()

# 로그 파일명 변경
chatbot.set_log_filename("new_log.csv")
```

## 프로젝트 구조

```
Perfect_Quote/
├── utils/
│   ├── __init__.py          # 패키지 초기화
│   ├── chatbot_utils.py     # Chatbot 클래스
│   └── system_prompt.py     # 시스템 프롬프트
├── requirements.txt         # 필요한 패키지들
├── README.md               # 프로젝트 설명
├── example_class_usage.py  # 클래스 사용 예시
└── chatbot_practice.ipynb  # 연습용 노트북
```

## Chatbot 클래스 메서드

### 초기화
- `__init__(model, temperature, max_tokens, log_filename)`: 챗봇 초기화

### 대화 관련
- `chat_once(user_input=None)`: 한 번의 대화 처리
- `show_history()`: 대화 히스토리 출력

### 데이터 관리
- `get_user_messages()`: 사용자 메시지들 반환
- `get_ai_messages()`: AI 메시지들 반환
- `get_statistics()`: 대화 통계 정보 반환
- `clear_history()`: 대화 히스토리 초기화

### 로깅 관련
- `save_chat_history_to_csv(filename)`: 대화 히스토리를 CSV 파일로 저장
- `set_log_filename(filename)`: 로그 파일명 변경

## CSV 로깅 기능

대화 내용을 CSV 파일로 저장하는 기능이 추가되었습니다.

### CSV 파일 구조
- `role`: 메시지 발신자 (system/user/ai)
- `content`: 메시지 내용
- `content_length`: 텍스트 길이

**참고**: 파일의 첫 번째 레코드는 항상 시스템 프롬프트입니다.

### 파일 저장 위치
- 저장 경로: `./logs/` 디렉토리
- 파일명 형식: `chat_log_YYYY_MM_DD_HH_MM_SS.csv`
- 예시: `chat_log_2024_01_15_14_30_25.csv`

### 사용 예시

```python
from utils import Chatbot

chatbot = Chatbot()
response = chatbot.chat_once("안녕하세요!")
chatbot.save_chat_history_to_csv()
```

또는 클래스 예시 파일 실행:
```bash
python example_class_usage.py
``` 