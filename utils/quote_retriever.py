# !pip install sentence_transformers faiss-cpu

from sentence_transformers import SentenceTransformer
import faiss
import pandas as pd
import numpy as np

# 전역 변수로 모델과 데이터를 한 번만 로드
_model = None
_index = None
_df = None

def load_resources():
    """모델과 데이터를 한 번만 로드하는 함수"""
    global _model, _index, _df
    
    if _model is None:
        print("🤖 모델 로딩 중... (처음 실행시에만)")
        _model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
    
    if _index is None:
        print("📚 FAISS 인덱스 로딩 중...")
        _index = faiss.read_index("./vectorDB/FAISS/quotes_cosine_faiss.index")
    
    if _df is None:
        print("📊 데이터 로딩 중...")
        _df = pd.read_csv("./Dataset/quotes_with_insights_combined.csv")
    
    return _model, _index, _df

def find_similar_quote_cosine(user_text, top_k=10):
    """최적화된 유사 명언 검색 함수"""
    # 리소스 로드 (한 번만)
    model, index, df = load_resources()
    
    # 사용자 입력을 벡터로 변환 후 정규화
    user_embedding = model.encode([user_text], convert_to_tensor=False, show_progress_bar=False)
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
    
    return distances, indices

def find_similar_quote_cosine_silent(user_text, top_k=10):
    """출력 없이 결과만 반환하는 함수 (API용)"""
    # 리소스 로드 (한 번만)
    model, index, df = load_resources()
    
    # 사용자 입력을 벡터로 변환 후 정규화
    user_embedding = model.encode([user_text], convert_to_tensor=False, show_progress_bar=False)
    user_embedding = user_embedding / np.linalg.norm(user_embedding)  # 정규화

    # FAISS 검색 (내적 기반)
    distances, indices = index.search(np.array(user_embedding), top_k)
    
    # 결과를 딕셔너리 리스트로 반환
    results = []
    for i in range(top_k):
        results.append({
            "quote": df["quote"].iloc[indices[0][i]],
            "author": df["author"].iloc[indices[0][i]],
            "category": df["category"].iloc[indices[0][i]],
            "similarity": float(distances[0][i])
        })
    
    return results

def interactive_search():
    """대화형 검색 모드"""
    print("🚀 명언 검색 시스템 시작!")
    print("💡 'quit' 또는 'exit'를 입력하면 종료됩니다.")
    
    # 처음 한 번만 리소스 로드
    load_resources()
    
    while True:
        user_input = input("\n🔍 검색할 문장을 입력하세요: ").strip()
        
        if user_input.lower() in ['quit', 'exit', '종료']:
            print("👋 검색을 종료합니다.")
            break
        
        if not user_input:
            print("❌ 빈 입력입니다. 다시 입력해주세요.")
            continue
        
        try:
            find_similar_quote_cosine(user_input)
        except Exception as e:
            print(f"❌ 오류 발생: {e}")

# 사용 예시 (단일 실행)
if __name__ == "__main__":
    user_input = "오늘 학교에서 전공수업 시험을 봤는데 완전 망한것 같아. 준비 열심히 한 시험인데 잘 못본것 같아서 우울해."
    find_similar_quote_cosine(user_input)
    
    # 대화형 모드로 전환하려면 아래 주석 해제
    # interactive_search()


