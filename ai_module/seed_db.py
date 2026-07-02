import pandas as pd
import mysql.connector
from mysql.connector import Error
import os

def create_database_and_tables():
    try:
        # Connect to MySQL Server
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root'
        )
        if connection.is_connected():
            cursor = connection.cursor()
            # Create Database
            cursor.execute("CREATE DATABASE IF NOT EXISTS welfare_assistant")
            cursor.execute("USE welfare_assistant")

            # Create Users Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                phone VARCHAR(15),
                password_hash VARCHAR(255),
                age INT,
                gender VARCHAR(20),
                occupation VARCHAR(100),
                income FLOAT,
                education VARCHAR(100),
                state VARCHAR(100),
                category VARCHAR(50),
                disability_status VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # Create Government_Schemes Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Government_Schemes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scheme_name VARCHAR(255),
                category VARCHAR(100),
                age_group VARCHAR(50),
                gender VARCHAR(50),
                occupation VARCHAR(100),
                income_limit VARCHAR(100),
                eligibility TEXT,
                benefits TEXT
            )
            """)

            # Create Recommendations Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Recommendations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                scheme_id INT,
                eligibility_percentage FLOAT,
                confidence_score FLOAT,
                explanation TEXT,
                is_missed_benefit BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (scheme_id) REFERENCES Government_Schemes(id)
            )
            """)

            # Create Feedback Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                scheme_id INT,
                rating INT,
                review_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (scheme_id) REFERENCES Government_Schemes(id)
            )
            """)

            # Create Admins Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE,
                password_hash VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            print("Database and tables created successfully.")

            # Seed Data
            excel_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'government_schemes.xlsx')
            if os.path.exists(excel_path):
                df = pd.read_excel(excel_path)
                
                # Check if data already exists to prevent duplicate seeding
                cursor.execute("SELECT COUNT(*) FROM Government_Schemes")
                count = cursor.fetchone()[0]
                
                if count == 0:
                    for index, row in df.iterrows():
                        insert_query = """
                        INSERT INTO Government_Schemes 
                        (scheme_name, category, age_group, gender, occupation, income_limit, eligibility, benefits)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        cursor.execute(insert_query, (
                            str(row.get('Scheme Name', '')),
                            str(row.get('Category', '')),
                            str(row.get('Age Group', '')),
                            str(row.get('Gender', '')),
                            str(row.get('Occupation', '')),
                            str(row.get('Income Limit', '')),
                            str(row.get('Eligibility', '')),
                            str(row.get('Benefits', ''))
                        ))
                    connection.commit()
                    print(f"Seeded {len(df)} schemes into the database.")
                else:
                    print("Data already seeded.")
            else:
                print("Excel file not found. Skipping data seeding.")
            
    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    create_database_and_tables()
