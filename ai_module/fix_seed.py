import pandas as pd
import mysql.connector
import os
import json

try:
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'govscheme_db'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'rootpassword'),
        database=os.getenv('DB_NAME', 'govschemes')
    )
    if connection.is_connected():
        cursor = connection.cursor()
        df = pd.read_excel('/dataset/government_schemes.xlsx')
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("TRUNCATE TABLE Government_Schemes")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        for index, row in df.iterrows():
            try:
                cursor.execute("""
                    INSERT INTO Government_Schemes 
                    (scheme_name, benefits, eligibility, category, state, occupation, income_limit, required_documents, application_steps, estimated_approval_time, benefits_amount, education, age_group, gender)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(row['Scheme Name']) if pd.notna(row['Scheme Name']) else '',
                    str(row['Benefits']) if pd.notna(row['Benefits']) else '',
                    str(row['Eligibility']) if pd.notna(row['Eligibility']) else '',
                    str(row['Category']) if pd.notna(row['Category']) else 'General',
                    'All India',
                    str(row['Occupation']) if pd.notna(row['Occupation']) else 'Any',
                    str(row['Income Limit']) if pd.notna(row['Income Limit']) else 'Any',
                    json.dumps(['Aadhaar Card', 'Bank Passbook', 'Income Certificate', 'Caste Certificate']),
                    json.dumps(['Register on portal', 'Submit details']),
                    '15-30 days',
                    'Variable',
                    'All',
                    str(row['Age Group']) if pd.notna(row['Age Group']) else 'All',
                    str(row['Gender']) if pd.notna(row['Gender']) else 'All'
                ))
            except Exception as e:
                print(f"Error inserting row {index}: {e}")
        
        connection.commit()
        print('Successfully populated Government_Schemes!')
        
except Exception as e:
    print(f'Error: {e}')
finally:
    if 'connection' in locals() and connection.is_connected():
        cursor.close()
        connection.close()
