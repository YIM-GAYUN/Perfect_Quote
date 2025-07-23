import time  # 시간 측정을 위한 모듈 추가
import pandas as pd
from openai import OpenAI
import os
import kagglehub
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print(OPENAI_API_KEY)

# OpenAI API 키 설정
client = OpenAI(
    api_key=OPENAI_API_KEY
)
# 실행 시간 측정 시작
start_time = time.time()

df = pd.read_csv("/home/jdh251425/2025_prometheus/Dataset/sampled_quotes.csv")
quotes = df['quote'].tolist()[0:2500]
authors = df['author'].tolist()[0:2500]
categories = df['category'].tolist()[0:2500]

# GPT를 사용하여 명언의 속뜻 파악
def get_insight(quote):
    try:
        response = client.responses.create(
            model="gpt-4o-mini-2024-07-18",
            instructions="You are a helpful assistant that well known about quotes and their meanings.",
            input=f'''Extract the core meaning of this quote directly: "{quote}". 
Write in declarative statements without referencing the quote itself or using phrases like 'this quote suggests'. 
Focus only on the essential message and implications.

IMPORTANT: Your response must be between 30-45 words total. Do not exceed 45 words or use fewer than 30 words.

Example:
For "We accept the love we think we deserve."
Good response: "Our self-worth influences the quality of relationships we pursue and maintain. If we believe we are worthy of love, we are more likely to accept healthy, fulfilling connections; conversely, low self-esteem may lead us to tolerate unhealthy relationships."
Bad response: "This quote suggests that people tend to accept love based on their self-worth. It means that we only welcome the type of love we believe we deserve."'''
        )
        return response.output_text.strip()
    except Exception as e:
        print(f"Error processing quote: {quote}\nError: {e}")
        return "Error"

# 결과 저장을 위한 리스트
insights = []

# 각 명언에 대해 속뜻 파악
for quote in quotes:
    insight = get_insight(quote)
    insights.append(insight)
    print(f"{quote} >>> {insight}")

# 결과를 새로운 DataFrame으로 저장
result_df = pd.DataFrame({
    'quote': quotes,
    'author': authors,
    'category': categories,
    'insight': insights
})

# 결과를 CSV 파일로 저장
result_df.to_csv('quotes_with_insights_10_test.csv', index=False)
print("작업 완료: 'quotes_with_insights.csv' 파일에 저장되었습니다.")

# 실행 시간 측정 종료
end_time = time.time()
elapsed_time = end_time - start_time
print(f"총 실행 시간: {elapsed_time:.2f}초")