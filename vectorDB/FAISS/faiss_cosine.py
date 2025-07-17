# FAISS 인덱스 생성(코사인유사도) 및 테스트

from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
from tqdm import tqdm
import faiss

'''
# 벡터 정규화 (코사인 유사도 적용)
def normalize_vectors(vectors):
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors / norms

# 1. 벡터 정규화
quote_embeddings = np.load("insights_combined_embeddings.npy")
quote_embeddings = normalize_vectors(quote_embeddings)

# 2. FAISS 인덱스 생성 (내적 기반)
embedding_dim = quote_embeddings.shape[1]
index = faiss.IndexFlatIP(embedding_dim)  # 내적 기반 인덱스

# 3. 벡터 추가
index.add(quote_embeddings)

# 4. 저장
faiss.write_index(index, "quotes_cosine_faiss.index")
'''

def find_similar_quote_cosine(user_text, top_k=3):
    # FAISS 인덱스 불러오기
    index = faiss.read_index("./quotes_cosine_faiss.index")

    # SBERT 모델 불러오기
    model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")

    # 원본 데이터 불러오기
    df = pd.read_csv("../../Dataset/quotes_with_insights_combined.csv")

    # 사용자 입력을 벡터로 변환 후 정규화
    user_embedding = model.encode([user_text], convert_to_tensor=False)
    user_embedding = user_embedding / np.linalg.norm(user_embedding)  # 정규화

    # FAISS 검색 (내적 기반)
    distances, indices = index.search(np.array(user_embedding), top_k)

    print("\n📌 사용자의 입력 문장:", user_text)
    print("🔍 유사한 명언 추천:")

    for i in range(top_k):
        quote = df["quote"].iloc[indices[0][i]]
        author = df["author"].iloc[indices[0][i]]
        category = df["category"].iloc[indices[0][i]]
        print(f"\n✨ 추천 {i+1}: {quote}\n🖊️ 작가: {author}\n🏷️ 카테고리: {category}\n(유사도: {distances[0][i]:.4f})")


# 사용 예시
user_input = "오늘 학교에서 전공수업 시험을 봤는데 완전 망한것 같아. 준비 열심히 한 시험인데 잘 못본것 같아서 우울해."
find_similar_quote_cosine(user_input)