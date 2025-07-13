'''
Written by 정다훈

데이터 로드 및 준비: Kaggle에서 'quotes.csv' 파일을 다운로드하고, 상위 10개의 명언을 리스트로 추출합니다.
명언의 속뜻 파악: OpenAI의 GPT 모델을 사용하여 각 명언의 속뜻을 요약하는 get_insight 함수를 정의하고, 이를 통해 명언의 의미를 파악합니다.
결과 저장: 명언과 그 속뜻을 새로운 DataFrame에 저장한 후, 'quotes_with_insights.csv' 파일로 저장합니다.
'''
import pandas as pd
from openai import OpenAI
import os
import kagglehub
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print(OPENAI_API_KEY)

# OpenAI API 키 설정
client = OpenAI(
    api_key=OPENAI_API_KEY
)
# Download latest version
path = kagglehub.dataset_download("manann/quotes-500k")

print("Path to dataset files:", path)

# 1. CSV 파일 읽기
csv_file_path = os.path.join(path, 'quotes.csv')  # 'quotes.csv'는 실제 파일명으로 변경해야 함
df = pd.read_csv(csv_file_path)
quotes = df['quote'].tolist()[:10]

# GPT를 사용하여 명언의 속뜻 파악
def get_insight(quote):
    try:
        response = client.responses.create(
            model="gpt-4o-mini-2024-07-18",
            instructions="You are a helpful assistant that well known about quotes and their meanings.",
            input=f"Summarize the essence of the following quote in some sentences.: \"{quote}\". Do not include any other text than the explanation."
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
    'insight': insights
})

# 결과를 CSV 파일로 저장
result_df.to_csv('quotes_with_insights.csv', index=False)
print("작업 완료: 'quotes_with_insights.csv' 파일에 저장되었습니다.")