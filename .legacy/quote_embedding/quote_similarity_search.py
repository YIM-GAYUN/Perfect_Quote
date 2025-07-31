'''
Written by 이연우
데이터 로드 및 임베딩 준비: Kaggle에서 'quotes.csv' 파일을 다운로드하고, 저장된 임베딩 파일('quote_embeddings.npy')이 있으면 이를 불러옵니다. 없을 경우, SentenceTransformer 모델을 사용하여 'quote' 컬럼의 데이터를 임베딩합니다.
유사도 검색 함수 정의: 입력 텍스트의 임베딩을 생성하고, 기존 임베딩과의 코사인 유사도를 계산하여 가장 유사한 명언을 찾는 find_similar_quotes 함수를 정의합니다. 이 함수는 GPU를 활용하여 빠르게 유사도를 계산합니다.
유사한 명언 찾기 및 출력: 테스트 텍스트에 대해 find_similar_quotes 함수를 사용하여 유사한 명언을 찾고, 결과를 출력합니다. 각 결과에는 명언, 저자, 유사도가 포함됩니다.

'''


import pandas as pd
import numpy as np
import torch
import os
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity
import kagglehub

# Download latest version
path = kagglehub.dataset_download("manann/quotes-500k")

print("Path to dataset files:", path)

# 1. CSV 파일 읽기
csv_file_path = os.path.join(path, 'quotes.csv')  # 'quotes.csv'는 실제 파일명으로 변경해야 함

# 저장된 임베딩 불러오기 (또는 새로 생성)
try:
    # 저장된 임베딩 파일이 있는 경우
    embeddings = np.load('quote_embeddings.npy')
    df = pd.read_csv(csv_file_path)
    quotes = df['quote'].tolist()
except:
    # 임베딩 파일이 없는 경우 새로 생성
    df = pd.read_csv(csv_file_path)
    quotes = df['quote'].tolist()
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
    embeddings = model.encode(quotes)

# 새로운 텍스트의 임베딩 생성 및 유사도 검색 함수
def find_similar_quotes(input_text, model, quotes, embeddings, top_n=3):
    # 입력 텍스트 임베딩 (GPU 활용)
    input_embedding = model.encode([input_text], convert_to_tensor=True, device=device)[0]
    
    # 기존 임베딩을 텐서로 변환 (GPU에 로드)
    if isinstance(embeddings, np.ndarray):
        embeddings_tensor = torch.tensor(embeddings).to(device)
    else:
        embeddings_tensor = embeddings
    
    # GPU 가속 코사인 유사도 계산 (sentence-transformers의 util 사용)
    cos_scores = util.pytorch_cos_sim(input_embedding, embeddings_tensor)[0]
    
    # 유사도가 높은 순으로 인덱스 정렬 (GPU에서 CPU로 가져옴)
    top_indices = torch.topk(cos_scores, k=min(top_n, len(quotes))).indices.cpu().numpy()
    
    # 결과 반환
    results = []
    cos_scores_np = cos_scores.cpu().numpy()
    for idx in top_indices:
        results.append({
            'quote': quotes[idx],
            'author': df.iloc[idx]['author'] if 'author' in df.columns else 'Unknown',
            'similarity': float(cos_scores_np[idx])
        })
    
    return results

# GPU 사용 가능 여부 확인
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"사용 중인 디바이스: {device}")

# 모델 로드 (GPU 사용)
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2', device=device)

# 테스트: 유사한 명언 찾기
# test_text = "Love is the most powerful force in the universe"
test_text = "Conflict inevitably leaves behind scars, both visible and invisible, that linger long after the battle has ended. These wounds can fester, breeding resentment and division among individuals and communities. In contrast, love acts as a balm, soothing the pain and fostering reconciliation and understanding. It bridges divides, mends broken relationships, and nurtures a sense of unity and peace. Through acts of compassion and empathy, love has the power to heal even the deepest of wounds, transforming scars into stories of resilience and growth."

similar_quotes = find_similar_quotes(test_text, model, quotes, embeddings)

# 결과 출력
print(f"입력 텍스트: '{test_text}'")
print("\n유사한 명언:")
for i, result in enumerate(similar_quotes, 1):
    print(f"{i}. \"{result['quote']}\" - {result['author']} (유사도: {result['similarity']:.4f})")