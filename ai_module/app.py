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
        password=os.environ.get('DB_PASSWORD', 'root'),
        database=os.environ.get('DB_NAME', 'welfare_assistant')
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

        recommendations = []
        for scheme in schemes:
            score = 0
            total_criteria = 4
            explanation_parts = []

            # Age check
            if scheme['age_group'] == 'All' or scheme['age_group'] == '18+':
                if user_data.get('age', 0) >= 18:
                    score += 0.8
                    explanation_parts.append("Your age generally meets the scheme's criteria.")
            elif '-' in scheme['age_group']:
                # Example: 18-60
                parts = scheme['age_group'].split('-')
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    if int(parts[0]) <= user_data.get('age', 0) <= int(parts[1]):
                        score += 1.0
                        explanation_parts.append("Your age fits the required bracket.")

            # Gender check
            if str(scheme['gender']).lower() in ['all', 'any']:
                score += 0.8
                explanation_parts.append("The scheme is open to all genders.")
            elif str(scheme['gender']).lower() == str(user_data.get('gender', '')).lower():
                score += 1.0
                explanation_parts.append("Your gender aligns with the scheme requirements.")

            # Occupation check
            scheme_occ = str(scheme['occupation']).lower()
            user_occ = str(user_data.get('occupation', '')).lower()
            if scheme_occ in ['any', 'all']:
                score += 0.8
                explanation_parts.append("Your occupation matches the general target group.")
            elif user_occ and user_occ in scheme_occ:
                score += 1.5 # Boost for specific occupation match
                explanation_parts.append("This scheme specifically targets your occupation.")

            # Income check (Parse specific limits like '< ₹8 Lakh')
            scheme_income = str(scheme['income_limit']).lower()
            user_income = float(user_data.get('income', 0))
            if scheme_income in ['any', 'no limit', 'nan', '']:
                score += 0.8
                explanation_parts.append("Your income is within the allowed limit (no strict limit).")
            else:
                import re
                # Extract numbers from things like "< ₹8 Lakh" or "< ?8 Lakh" or "800000"
                match = re.search(r'([\d\.]+)\s*(lakh|lakhs|k)?', scheme_income)
                if match:
                    limit_val = float(match.group(1))
                    multiplier = 100000 if match.group(2) and 'lakh' in match.group(2) else 1
                    multiplier = 1000 if match.group(2) and 'k' in match.group(2) else multiplier
                    limit_in_rupees = limit_val * multiplier
                    
                    if user_income <= limit_in_rupees:
                        score += 1.0
                        explanation_parts.append(f"Your income fits the specific limit (under {int(limit_in_rupees)}).")
                    else:
                        explanation_parts.append(f"Your income exceeds the scheme limit of {int(limit_in_rupees)}.")
                else:
                    # fallback if parsing fails but it's not "Any"
                    score += 0.5
                    explanation_parts.append("Income limit requires manual verification.")

            eligibility_percentage = min((score / total_criteria) * 100, 100.0)
            confidence_score = eligibility_percentage * 0.9 # Just a mock AI confidence heuristic
            
            if eligibility_percentage >= 50:
                recommendations.append({
                    "scheme_id": scheme['id'],
                    "scheme_name": scheme['scheme_name'],
                    "eligibility_percentage": round(eligibility_percentage, 1),
                    "confidence_score": round(confidence_score, 1),
                    "explanation": " ".join(explanation_parts),
                    "benefits": scheme['benefits']
                })
        
        # Sort by eligibility descending
        recommendations = sorted(recommendations, key=lambda x: x['eligibility_percentage'], reverse=True)
        return jsonify({"recommendations": recommendations}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
