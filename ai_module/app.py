from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import mysql.connector

app = Flask(__name__)
CORS(app)

import os

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', 'rootpassword'),
        database=os.environ.get('DB_NAME', 'govschemes')
    )

@app.route('/')
def home():
    return jsonify({"status": "AI Recommender Module is running", "endpoints": ["/api/recommend"]})

@app.route('/api/recommend', methods=['POST'])
def recommend():
    user_data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Government_Schemes")
        schemes = cursor.fetchall()
        conn.close()

        user_occ = str(user_data.get('occupation', '')).lower().strip()
        user_gender = str(user_data.get('gender', '')).lower().strip()
        user_age = int(user_data.get('age', 0))
        user_disability = str(user_data.get('disability_status', 'No')).lower().strip()

        recommendations = []
        for scheme in schemes:
            score = 0
            total_criteria = 4
            explanation_parts = []

            scheme_occ = str(scheme['occupation']).lower().strip()
            scheme_cat = str(scheme['category']).lower().strip()
            scheme_name = str(scheme['scheme_name']).lower().strip()
            scheme_elig = str(scheme['eligibility']).lower().strip()

            # Strict Rejects: Disability
            is_disability = 'disability' in scheme_cat or 'disability' in scheme_name or 'disabled' in scheme_name or 'differently abled' in scheme_elig or 'adip' in scheme_name
            if is_disability and user_disability != 'yes':
                continue

            # Strict Rejects: Pregnancy
            if ('pregnant' in scheme_elig or 'maternity' in scheme_elig or 'janani' in scheme_elig) and user_gender != 'female':
                continue

            # Strict Rejects: Occupation-category relevance
            if 'student' in user_occ and scheme_cat in ['agriculture', 'entrepreneurship', 'pension', 'housing'] and scheme_occ != 'student':
                continue
            elif ('farmer' in user_occ or 'agriculture' in user_occ) and scheme_cat in ['entrepreneurship'] and scheme_occ != 'farmer':
                continue
            elif ('entrepreneur' in user_occ or 'business' in user_occ) and scheme_cat in ['agriculture', 'pension'] and scheme_occ != 'entrepreneur':
                continue

            # Age check
            if scheme['age_group'] in ['All', 'Any']:
                score += 0.8
                explanation_parts.append("Open to all ages.")
            elif '+' in str(scheme['age_group']):
                min_age = int(str(scheme['age_group']).replace('+', ''))
                if user_age >= min_age:
                    score += 1.0
                    explanation_parts.append(f"Age {user_age} meets {scheme['age_group']} requirement.")
                else:
                    continue
            elif '-' in str(scheme['age_group']):
                parts = str(scheme['age_group']).split('-')
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    if int(parts[0]) <= user_age <= int(parts[1]):
                        score += 1.0
                        explanation_parts.append(f"Age {user_age} is within {scheme['age_group']}.")
                    else:
                        continue

            # Gender check
            if str(scheme['gender']).lower() in ['all', 'any']:
                score += 0.8
                explanation_parts.append("Open to all genders.")
            elif str(scheme['gender']).lower() == user_gender:
                score += 1.0
                explanation_parts.append(f"Gender matches ({user_gender.capitalize()}).")
            else:
                continue

            # Occupation check
            if scheme_occ in ['any', 'all']:
                score += 0.8
                explanation_parts.append("Open to all occupations.")
            elif user_occ and (user_occ in scheme_occ or scheme_occ in user_occ):
                score += 1.5
                explanation_parts.append(f"Specifically targets {user_occ.capitalize()}.")
            else:
                continue

            # Income check
            scheme_income = str(scheme['income_limit']).lower()
            user_income = float(user_data.get('income', 0))
            if scheme_income in ['any', 'no limit', 'nan', '']:
                score += 0.8
                explanation_parts.append("Income within allowed limit.")
            else:
                import re
                match = re.search(r'([\d\.]+)\s*(lakh|lakhs|k)?', scheme_income)
                if match:
                    limit_val = float(match.group(1))
                    multiplier = 100000 if match.group(2) and 'lakh' in match.group(2) else 1
                    multiplier = 1000 if match.group(2) and 'k' in match.group(2) else multiplier
                    limit_in_rupees = limit_val * multiplier
                    
                    if user_income <= limit_in_rupees:
                        score += 1.0
                        explanation_parts.append(f"Income fits under ₹{int(limit_in_rupees)} limit.")
                    else:
                        continue
                else:
                    score += 0.5

            eligibility_percentage = min((score / total_criteria) * 100, 100.0)
            confidence_score = eligibility_percentage
            
            recommendations.append({
                "scheme_id": scheme['id'],
                "scheme_name": scheme['scheme_name'],
                "eligibility_percentage": round(eligibility_percentage, 1),
                "confidence_score": round(confidence_score, 1),
                "explanation": " ".join(explanation_parts),
                "benefits": scheme['benefits']
            })
        
        recommendations = sorted(recommendations, key=lambda x: x['eligibility_percentage'], reverse=True)
        return jsonify({"recommendations": recommendations}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
