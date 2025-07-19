import pandas as pd
from openai import OpenAI
import time
import os
from tqdm import tqdm
import json
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class InsightTranslator:
    def __init__(self, api_key=None, input_file='Dataset/quotes_with_insights_combined.csv', 
                 output_file='Dataset/quotes_with_insights_translated.csv'):
        """
        OpenAI API를 사용해서 insight 열을 번역하는 클래스
        
        Args:
            api_key: OpenAI API 키 (None이면 환경변수에서 가져옴)
            input_file: 입력 CSV 파일 경로
            output_file: 출력 CSV 파일 경로
        """
        self.input_file = input_file
        self.output_file = output_file
        self.checkpoint_file = 'translation_checkpoint.json'
        
        # OpenAI 클라이언트 초기화
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            # 환경변수에서 API 키 가져오기 (main에서 이미 로드됨)
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OpenAI API 키가 설정되지 않았습니다.")
            self.client = OpenAI(api_key=api_key)
    
    def translate_text(self, text, target_language='Korean'):
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": f"You are a professional translator. Translate the given text to Korean. "
                                 f"Keep the meaning intact and make it natural in Korean. "
                                 f"Only return the translated text without any additional comments."
                    },
                    {
                        "role": "user", 
                        "content": text
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"번역 오류: {e}")
            return text  # 오류 발생 시 원본 텍스트 반환
    
    def save_checkpoint(self, completed_rows, translated_data):
        """체크포인트를 저장합니다."""
        checkpoint = {
            'completed_rows': completed_rows,
            'translated_data': translated_data
        }
        with open(self.checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump(checkpoint, f, ensure_ascii=False, indent=2)
    
    def load_checkpoint(self):
        """체크포인트를 불러옵니다."""
        if os.path.exists(self.checkpoint_file):
            with open(self.checkpoint_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def translate_csv(self, batch_size=10, delay_between_batches=1):
        """
        CSV 파일의 insight 열을 번역합니다.
        
        Args:
            batch_size: 배치 크기 (API 호출 횟수 제한을 위해)
            delay_between_batches: 배치 간 대기 시간 (초)
        """
        print("CSV 파일을 읽는 중...")
        df = pd.read_csv(self.input_file)
        
        print(f"총 {len(df)}개의 행을 번역할 예정입니다.")
        print(f"컬럼: {df.columns.tolist()}")
        
        # 체크포인트 확인
        checkpoint = self.load_checkpoint()
        if checkpoint:
            print(f"체크포인트를 발견했습니다. {checkpoint['completed_rows']}행까지 완료되었습니다.")
            start_idx = checkpoint['completed_rows']
            translated_insights = checkpoint['translated_data']
        else:
            start_idx = 0
            translated_insights = []
        
        # 번역 진행
        total_rows = len(df)
        
        for i in tqdm(range(start_idx, total_rows), desc="번역 진행", initial=start_idx, total=total_rows):
            insight = df.iloc[i]['insight']
            
            # 번역 실행
            translated_insight = self.translate_text(insight)
            translated_insights.append(translated_insight)
            
            # 배치마다 체크포인트 저장
            if (i + 1) % batch_size == 0:
                self.save_checkpoint(i + 1, translated_insights)
                print(f"\n체크포인트 저장됨: {i + 1}/{total_rows} 완료")
                
                # 배치 간 대기
                if delay_between_batches > 0:
                    time.sleep(delay_between_batches)
        
        # 번역 완료 후 결과를 DataFrame에 적용
        print("\n번역 완료! 결과를 저장하는 중...")
        df_translated = df.copy()
        df_translated['insight'] = translated_insights
        
        # 결과 저장
        df_translated.to_csv(self.output_file, index=False, encoding='utf-8-sig')
        print(f"번역된 파일이 저장되었습니다: {self.output_file}")
        
        # 체크포인트 파일 삭제
        if os.path.exists(self.checkpoint_file):
            os.remove(self.checkpoint_file)
            print("체크포인트 파일이 삭제되었습니다.")
        
        return df_translated

def main():
    """메인 함수"""
    print("=== CSV Insight 번역기 ===")
    
    # .env 파일에서 API 키 확인
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print("✅ .env 파일에서 OpenAI API 키를 찾았습니다.")
    else:
        print("❌ .env 파일에서 OpenAI API 키를 찾을 수 없습니다.")
        api_key = input("OpenAI API 키를 직접 입력하세요: ").strip()
        if not api_key:
            print("API 키가 입력되지 않았습니다. 프로그램을 종료합니다.")
            return
    
    # 번역기 초기화
    try:
        translator = InsightTranslator(api_key=api_key)
    except ValueError as e:
        print(f"오류: {e}")
        return
    
    # 설정 확인 및 번역 시작
    print(f"입력 파일: {translator.input_file}")
    print(f"출력 파일: {translator.output_file}")
    print("번역을 시작합니다...")
    
    # 번역 실행
    try:
        translator.translate_csv(batch_size=10, delay_between_batches=1)
        print("\n번역이 성공적으로 완료되었습니다!")
        
    except KeyboardInterrupt:
        print("\n번역이 중단되었습니다. 체크포인트가 저장되어 다음에 이어서 진행할 수 있습니다.")
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main() 