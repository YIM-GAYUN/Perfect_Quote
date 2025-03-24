# FAISS 인덱스 생성(L2거리) 및 테스트

from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
from tqdm import tqdm
import faiss

# 1. 벡터 데이터 불러오기
quote_embeddings = np.load("insights_combined_embeddings.npy")

# 2. FAISS 인덱스 생성 (L2 거리 기반)
embedding_dim = quote_embeddings.shape[1]  # 벡터 차원 (384)
index = faiss.IndexFlatL2(embedding_dim)

# 3. FAISS 인덱스에 명언 벡터 추가
index.add(quote_embeddings)

# 4. FAISS 인덱스 저장
faiss.write_index(index, "quotes_L2_faiss.index")

print("✅ FAISS 인덱스 생성 및 저장 완료!")

def find_similar_quote(user_text, top_k=3):
    # FAISS 인덱스 불러오기
    index = faiss.read_index("quotes_L2_faiss.index")

    # SBERT 모델 불러오기
    model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")

    # 원본 데이터 불러오기
    df = pd.read_csv("quotes_with_insights_combined.csv")

    # 사용자 입력을 벡터로 변환
    user_embedding = model.encode([user_text], convert_to_tensor=False)

    # FAISS 검색 (최근접 이웃 찾기)
    distances, indices = index.search(np.array(user_embedding), top_k)

    # 결과 출력
    print("\n📌 사용자의 입력 문장:", user_text)
    print("🔍 유사한 명언 추천:")

    for i in range(top_k):
        quote = df["quote"].iloc[indices[0][i]]
        author = df["author"].iloc[indices[0][i]]
        category = df["category"].iloc[indices[0][i]]
        print(f"\n✨ 추천 {i+1}: {quote}\n🖊️ 작가: {author}\n🏷️ 카테고리: {category}\n(유사도 거리: {distances[0][i]:.4f})")

# 사용 예시
user_input = "Today is a very proud day because I did my best."
find_similar_quote(user_input)