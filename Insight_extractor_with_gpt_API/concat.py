import pandas as pd

# 각 CSV 파일을 데이터프레임으로 읽어오기
df_part_0 = pd.read_csv('quotes_with_insights_part_0.csv')
df_part_1 = pd.read_csv('quotes_with_insights_part_1.csv')
df_part_2 = pd.read_csv('quotes_with_insights_part_2.csv')
df_part_3 = pd.read_csv('quotes_with_insights_part_3.csv')

# 데이터프레임을 하나로 합치기
df_combined = pd.concat([df_part_0, df_part_1, df_part_2, df_part_3], ignore_index=True)

# 합쳐진 데이터프레임을 새로운 CSV 파일로 저장
df_combined.to_csv('quotes_with_insights_combined.csv', index=False)

print("CSV 파일이 성공적으로 합쳐졌습니다.")