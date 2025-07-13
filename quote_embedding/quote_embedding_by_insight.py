'''
Written by 이연우
Edited by 정다훈 250323

데이터 로드 및 정제: Kaggle에서 'quotes.csv' 파일을 다운로드하여 읽어온 후, 'quote' 컬럼의 데이터를 리스트로 추출하고, 문자열이 아닌 데이터는 빈 문자열이나 문자열로 변환하여 정제합니다.
모델 로드 및 임베딩: SentenceTransformer 모델을 GPU에서 로드하고, 여러 GPU를 사용할 수 있는 경우 DataParallel로 설정합니다. 정제된 텍스트 데이터를 배치 단위로 임베딩하여 벡터로 변환합니다.
임베딩 저장 및 오류 처리: 임베딩된 벡터를 'quote_embeddings.npy' 파일로 저장하며, 임베딩 과정에서 오류가 발생할 경우 예외를 처리하고, 문제가 발생한 데이터 샘플을 출력합니다.
'''

import pandas as pd
import numpy as np
import torch
import os
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity

# GPU 사용 가능 여부 확인
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"사용 중인 디바이스: {device}")

# Download latest version
path = "/home/jdh251425/2025_prometheus/Dataset/quotes_with_insights_combined.csv"

# 1. CSV 파일 읽기
csv_file_path = os.path.join(path, 'quotes.csv')  # 'quotes.csv'는 실제 파일명으로 변경해야 함
df = pd.read_csv(csv_file_path)

# 2. quote 컬럼 추출 및 데이터 정제
quotes = df['insight'].tolist()

# 데이터 타입 확인 및 정제
cleaned_quotes = []
for i, quote in enumerate(quotes):
    # 문자열이 아닌 데이터 확인 및 변환
    if not isinstance(quote, str):
        print(f"비문자열 데이터 발견: 인덱스 {i}, 값: {quote}, 타입: {type(quote)}")
        if pd.isna(quote):  # NaN 값 처리
            cleaned_quotes.append("")  # 빈 문자열로 대체
        else:
            cleaned_quotes.append(str(quote))  # 문자열로 변환
    else:
        cleaned_quotes.append(quote)

print(f"전체 데이터 수: {len(quotes)}, 정제 후 데이터 수: {len(cleaned_quotes)}")

# 3. sentence-transformers 모델 로드 (GPU 사용)
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2', device=device)

# 여러 GPU 사용 설정
if torch.cuda.device_count() > 1:
    print(f"{torch.cuda.device_count()}개의 GPU를 사용합니다!")
    model = torch.nn.DataParallel(model)

# 4. 정제된 quote 텍스트 임베딩
try:
    batch_size = 128  # GPU 메모리에 따라 조정
    embeddings = model.module.encode(cleaned_quotes, batch_size=batch_size, 
                             show_progress_bar=True, 
                             convert_to_numpy=True)
    
    # 5. 임베딩 결과 확인
    print(f"임베딩 벡터 크기: {embeddings.shape}")
    print(f"첫 번째 임베딩 벡터 일부: {embeddings[0][:5]}...")

    # 6. 임베딩 결과 저장
    np.save('quote_embedding/embedding_results/quote_embeddings.npy', embeddings)
    print("임베딩 완료 및 저장 완료!")
    
except Exception as e:
    print(f"임베딩 중 오류 발생: {e}")
    # 문제가 발생한 데이터 샘플 출력
    for i in range(min(10, len(cleaned_quotes))):
        print(f"샘플 {i}: {cleaned_quotes[i][:50]}... (타입: {type(cleaned_quotes[i])})")