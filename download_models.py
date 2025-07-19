#!/usr/bin/env python3
"""
임베딩 모델 사전 다운로드 스크립트
한 번 실행하면 모델이 로컬에 저장되어 서버 시작 시간 단축
"""

import os
import time
from sentence_transformers import SentenceTransformer

def download_models():
    """필요한 모델들을 로컬에 다운로드"""
    
    models_dir = "./models/sentence-transformers"
    os.makedirs(models_dir, exist_ok=True)
    
    models_to_download = [
        {
            "name": "sentence-transformers/all-MiniLM-L6-v2",
            "size": "22MB",
            "description": "경량 모델 (영어 특화, 빠른 속도)"
        },
        {
            "name": "sentence-transformers/paraphrase-multilingual-mpnet-base-v2", 
            "size": "1GB",
            "description": "다국어 모델 (한국어 지원, 높은 성능)"
        }
    ]
    
    print("🚀 임베딩 모델 다운로드 시작")
    print("=" * 50)
    
    for i, model_info in enumerate(models_to_download, 1):
        model_name = model_info["name"]
        local_path = os.path.join(models_dir, model_name.split("/")[-1])
        
        print(f"\n{i}. {model_name}")
        print(f"   크기: {model_info['size']}")
        print(f"   설명: {model_info['description']}")
        print(f"   저장 경로: {local_path}")
        
        if os.path.exists(local_path):
            print(f"   ✅ 이미 다운로드됨 - 건너뛰기")
            continue
            
        try:
            start_time = time.time()
            print(f"   📥 다운로드 중...")
            
            # 모델 다운로드 및 로컬 저장
            model = SentenceTransformer(model_name)
            model.save(local_path)
            
            download_time = time.time() - start_time
            print(f"   ✅ 다운로드 완료 ({download_time:.1f}초)")
            
        except Exception as e:
            print(f"   ❌ 다운로드 실패: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 모델 다운로드 완료!")
    print("\n📋 사용법:")
    print("   1. 서버 시작: python app.py")
    print("   2. 로컬 모델이 자동으로 사용됩니다")
    
if __name__ == "__main__":
    download_models() 