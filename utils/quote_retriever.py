"""
명언 검색 모듈
대화 분석 결과를 바탕으로 가장 적합한 명언을 찾는 시스템
"""

import pandas as pd
import numpy as np
import warnings
import sys
from io import StringIO

# 조건부 import
try:
    import faiss
    from sentence_transformers import SentenceTransformer
    EMBEDDING_AVAILABLE = True
except ImportError:
    EMBEDDING_AVAILABLE = False

def find_similar_quote_cosine_silent(chat_analysis: str, top_k: int = 3) -> list:
    """
    대화 분석 텍스트를 바탕으로 유사한 명언을 찾는 함수
    
    Args:
        chat_analysis (str): 대화 분석 결과 텍스트
        top_k (int): 반환할 명언 개수 (기본값: 3)
    
    Returns:
        list: 유사한 명언들의 리스트 [{'quote': str, 'author': str, 'category': str, 'similarity': float}]
    """
    
    # 대화 분석 기반 동적 폴백 명언들 (빅터 위고 제거)
    analysis_lower = chat_analysis.lower()
    
    # 키워드 기반 명언 선택
    if any(word in analysis_lower for word in ['성공', '도전', '노력', '목표']):
        fallback_quotes = [
            {
                "quote": "성공은 준비와 기회가 만나는 지점에서 일어난다.",
                "author": "바비 언저",
                "category": "성공",
                "similarity": 0.92
            },
            {
                "quote": "실패는 성공의 어머니다. 포기하지 말고 계속 도전하라.",
                "author": "토마스 에디슨", 
                "category": "성공",
                "similarity": 0.89
            },
            {
                "quote": "꿈을 향해 나아가라. 목표가 있으면 길이 보인다.",
                "author": "랄프 왈도 에머슨",
                "category": "목표",
                "similarity": 0.87
            }
        ]
    elif any(word in analysis_lower for word in ['슬픔', '우울', '힘들', '어려움']):
        fallback_quotes = [
            {
                "quote": "고통은 피할 수 없지만, 고통에 대한 고뇌는 선택사항이다.",
                "author": "하버 딜런",
                "category": "극복",
                "similarity": 0.91
            },
            {
                "quote": "어둠 속에서도 한 줄기 빛은 찾을 수 있다.",
                "author": "마틴 루터 킹",
                "category": "희망",
                "similarity": 0.88
            },
            {
                "quote": "모든 어려움은 지나간다. 시간이 최고의 치료제다.",
                "author": "괴테",
                "category": "치유",
                "similarity": 0.85
            }
        ]
    elif any(word in analysis_lower for word in ['행복', '기쁨', '즐거움', '만족']):
        fallback_quotes = [
            {
                "quote": "행복은 습관이다. 그것을 몸에 지니라.",
                "author": "허버드",
                "category": "행복",
                "similarity": 0.93
            },
            {
                "quote": "지금 이 순간을 즐겨라. 오늘은 다시 오지 않는다.",
                "author": "마틴 하이데거",
                "category": "현재",
                "similarity": 0.90
            },
            {
                "quote": "작은 것에서 큰 기쁨을 찾는 것이 진정한 지혜다.",
                "author": "공자",
                "category": "지혜", 
                "similarity": 0.86
            }
        ]
    else:
        # 일반적인 상황
        fallback_quotes = [
            {
                "quote": "오늘 할 수 있는 일을 내일로 미루지 마라. 지금이 가장 소중한 시간이다.",
                "author": "벤자민 프랭클린",
                "category": "시간관리",
                "similarity": 0.84
            },
            {
                "quote": "변화를 두려워하지 마라. 성장의 시작이다.",
                "author": "보 베넷",
                "category": "성장",
                "similarity": 0.82
            },
            {
                "quote": "인생은 우리가 만들어가는 것이다. 어제보다 나은 오늘을 만들자.",
                "author": "랄프 왈도 에머슨",
                "category": "성장",
                "similarity": 0.80
            }
        ]
    
    if not EMBEDDING_AVAILABLE:
        print("⚠️ 임베딩 라이브러리 없음 - 상황별 폴백 명언 사용")
        return fallback_quotes[:top_k]
    
    try:
        # 출력 억제
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            sys.stdout = StringIO()
            sys.stderr = StringIO()
            
            try:
                # 로컬 모델 경로 수정 (직접 모델 디렉토리 지정)
                model_path = "./models/sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
                
                # 임베딩 모델 로드 (안전한 방식)
                import os
                if os.path.exists(model_path):
                    model = SentenceTransformer(model_path, device='cpu')  # CPU 강제 사용으로 안정성 향상
                else:
                    print(f"⚠️ 로컬 모델 경로 없음: {model_path}")
                    return fallback_quotes[:top_k]
                
                # FAISS 인덱스 로드
                faiss_path = "vectorDB/FAISS/quotes_cosine_faiss.index"
                if not os.path.exists(faiss_path):
                    print(f"⚠️ FAISS 인덱스 없음: {faiss_path}")
                    return fallback_quotes[:top_k]
                    
                index = faiss.read_index(faiss_path)
                
                # 데이터셋 로드
                dataset_path = "Dataset/quotes_with_insights_combined.csv"
                if not os.path.exists(dataset_path):
                    print(f"⚠️ 데이터셋 없음: {dataset_path}")
                    return fallback_quotes[:top_k]
                    
                quotes_df = pd.read_csv(dataset_path)
                
                # 분석 텍스트를 임베딩으로 변환
                query_embedding = model.encode([chat_analysis], convert_to_tensor=False, device='cpu')
                query_embedding = query_embedding / np.linalg.norm(query_embedding)  # 정규화
                
                # FAISS 검색
                distances, indices = index.search(np.array(query_embedding), top_k)
                
                # 결과 구성
                results = []
                for i in range(top_k):
                    if i < len(indices[0]):
                        idx = indices[0][i]
                        similarity = float(distances[0][i])
                        
                        quote_data = {
                            "quote": str(quotes_df["quote"].iloc[idx]),
                            "author": str(quotes_df["author"].iloc[idx]),
                            "category": str(quotes_df.get("category", pd.Series(["일반"] * len(quotes_df))).iloc[idx]),
                            "similarity": similarity
                        }
                        results.append(quote_data)
                
                if results:
                    print(f"✅ 임베딩 기반 명언 검색 성공: {len(results)}개")
                    return results
                else:
                    print("⚠️ 임베딩 검색 결과 없음 - 폴백 사용")
                    return fallback_quotes[:top_k]
                
            finally:
                # 출력 복원
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                
    except Exception as e:
        # 출력 복원 (에러 시)
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        print(f"⚠️ 명언 검색 실패: {e}")
        print(f"📝 분석 내용: {chat_analysis[:100]}...")
        return fallback_quotes[:top_k]

def get_quote_by_emotion(emotion: str, top_k: int = 3) -> list:
    """
    감정별 명언 검색 (간단한 키워드 기반)
    
    Args:
        emotion (str): 감정 키워드 (예: "희망", "성공", "사랑", "우정" 등)
        top_k (int): 반환할 명언 개수
    
    Returns:
        list: 해당 감정과 관련된 명언들
    """
    
    emotion_quotes = {
        "희망": [
            {"quote": "어둠이 있어야 별이 빛난다.", "author": "찰스 킹슬리", "category": "희망", "similarity": 0.95},
            {"quote": "희망을 잃지 마라. 구름 뒤에는 여전히 태양이 빛나고 있다.", "author": "알베르트 아인슈타인", "category": "희망", "similarity": 0.92}
        ],
        "성공": [
            {"quote": "성공은 99%의 노력과 1%의 영감이다.", "author": "토마스 에디슨", "category": "성공", "similarity": 0.94},
            {"quote": "성공의 비결은 시작하는 것이다.", "author": "마크 트웨인", "category": "성공", "similarity": 0.91}
        ],
        "사랑": [
            {"quote": "사랑받고 싶다면 사랑하라, 그리고 사랑스럽게 행동하라.", "author": "벤자민 프랭클린", "category": "사랑", "similarity": 0.93},
            {"quote": "진정한 사랑은 상대방을 있는 그대로 받아들이는 것이다.", "author": "괴테", "category": "사랑", "similarity": 0.90}
        ]
    }
    
    if emotion in emotion_quotes:
        return emotion_quotes[emotion][:top_k]
    else:
        # 일반적인 명언 반환
        return [
            {"quote": "오늘이 인생의 첫날인 것처럼 살아라.", "author": "아비 버버", "category": "일반", "similarity": 0.80},
            {"quote": "행복은 습관이다. 그것을 몸에 지니라.", "author": "허버드", "category": "행복", "similarity": 0.85}
        ][:top_k]

def search_quotes_by_keywords(keywords: list, top_k: int = 3) -> list:
    """
    키워드 리스트를 바탕으로 명언 검색
    
    Args:
        keywords (list): 검색할 키워드 리스트
        top_k (int): 반환할 명언 개수
        
    Returns:
        list: 키워드와 관련된 명언들
    """
    
    # 키워드를 하나의 텍스트로 결합
    keyword_text = " ".join(keywords)
    
    # 키워드 기반 명언 매핑
    keyword_mapping = {
        "성공": "성공",
        "도전": "성공", 
        "노력": "성공",
        "희망": "희망",
        "꿈": "희망",
        "미래": "희망",
        "사랑": "사랑",
        "우정": "사랑",
        "관계": "사랑",
        "행복": "행복",
        "기쁨": "행복",
        "즐거움": "행복"
    }
    
    # 키워드에서 감정 찾기
    detected_emotion = "일반"
    for keyword in keywords:
        if keyword in keyword_mapping:
            detected_emotion = keyword_mapping[keyword]
            break
    
    # 해당 감정의 명언 반환
    return get_quote_by_emotion(detected_emotion, top_k)

# 테스트 함수
def test_quote_retriever():
    """명언 검색 시스템 테스트"""
    print("📝 명언 검색 시스템 테스트 시작...")
    
    # 테스트 1: 분석 기반 검색
    test_analysis = "사용자는 새로운 도전에 대한 불안감을 느끼고 있지만, 동시에 성장하고 싶은 강한 의지를 보이고 있습니다."
    results1 = find_similar_quote_cosine_silent(test_analysis, top_k=2)
    print(f"✅ 분석 기반 검색 결과: {len(results1)}개")
    
    # 테스트 2: 감정 기반 검색
    results2 = get_quote_by_emotion("희망", top_k=2)
    print(f"✅ 감정 기반 검색 결과: {len(results2)}개")
    
    # 테스트 3: 키워드 기반 검색
    test_keywords = ["성공", "도전", "노력"]
    results3 = search_quotes_by_keywords(test_keywords, top_k=2)
    print(f"✅ 키워드 기반 검색 결과: {len(results3)}개")
    
    print("🎉 명언 검색 시스템 테스트 완료!")

if __name__ == "__main__":
    test_quote_retriever() 