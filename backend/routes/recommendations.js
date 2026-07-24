const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// ============================================================
// STRICT ELIGIBILITY CHECK FOR ONE PERSON AGAINST ONE SCHEME
// Returns { eligible: bool, score: number, breakdown: {}, reasons: [] }
// ============================================================
function checkEligibility(person, scheme) {
    let breakdown = {
        age: { match: false, reason: '' },
        gender: { match: false, reason: '' },
        occupation: { match: false, reason: '' },
        income: { match: false, reason: '' },
        education: { match: false, reason: '' },
        category: { match: false, reason: '' },
        state: { match: false, reason: '' },
        disability: { match: false, reason: '' }
    };
    let rejected = false;
    let score = 0;
    const maxScore = 8; // 8 criteria

    const personOcc = (person.occupation || '').toLowerCase().trim();
    const personGender = (person.gender || '').toLowerCase().trim();
    const personState = (person.state || '').toLowerCase().trim();
    const personEdu = (person.education || '').toLowerCase().trim();
    const personCat = (person.category || '').toLowerCase().trim();
    const personDisability = (person.disability_status || 'No').toLowerCase().trim();
    const personAge = parseInt(person.age) || 0;
    const personIncome = parseFloat(person.income) || 0;
    const personMarital = (person.marital_status || '').toLowerCase().trim();

    const schemeOcc = (scheme.occupation || 'Any').toLowerCase().trim();
    const schemeGender = (scheme.gender || 'All').toLowerCase().trim();
    const schemeState = (scheme.state || 'All').toLowerCase().trim();
    const schemeEdu = (scheme.education || 'All').toLowerCase().trim();
    const schemeIncome = (scheme.income_limit || 'Any').toLowerCase().trim();
    const schemeCat = (scheme.category || '').toLowerCase().trim();
    const schemeName = (scheme.scheme_name || '').toLowerCase().trim();
    const schemeElig = (scheme.eligibility || '').toLowerCase().trim();
    const schemeAgeGroup = (scheme.age_group || 'All').trim();

    // ---- 0. SPECIAL KEYWORD & ELIGIBILITY STRICT REJECTS ----

    // Disability check
    const isDisabilityScheme = schemeCat.includes('disability') || 
                               schemeName.includes('disability') || 
                               schemeName.includes('divyang') || 
                               schemeName.includes('adip') || 
                               schemeName.includes('disabled') || 
                               schemeElig.includes('disabled') || 
                               schemeElig.includes('disabilities') ||
                               schemeElig.includes('differently abled');

    if (isDisabilityScheme) {
        if (personDisability === 'yes') {
            breakdown.disability = { match: true, reason: 'Disability status matches' };
            score += 1;
        } else {
            breakdown.disability = { match: false, reason: 'Disability scheme — user does not have a disability' };
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    } else {
        breakdown.disability = { match: true, reason: 'No disability requirement' };
        score += 1;
    }

    // Pregnancy / Maternity check
    if (schemeElig.includes('pregnant') || schemeElig.includes('maternity') || schemeElig.includes('janani') || schemeElig.includes('lactating')) {
        if (personGender !== 'female' && personGender !== 'women') {
            breakdown.gender = { match: false, reason: 'Maternity/Pregnancy scheme — applicable to females only' };
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    }

    // Widow check
    if (schemeOcc === 'widow' || schemeElig.includes('widow')) {
        if (personMarital !== 'widow' && personMarital !== 'widowed') {
            breakdown.occupation = { match: false, reason: 'Scheme intended specifically for widows' };
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    }

    // Girl Child check
    if (schemeElig.includes('girl child') || schemeName.includes('sukanya')) {
        if (personGender !== 'female' || personAge > 14) {
            breakdown.gender = { match: false, reason: 'Scheme intended specifically for young girl children' };
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    }

    // Senior Citizen check
    if (schemeOcc === 'senior citizen' || schemeElig.includes('senior citizen') || schemeElig.includes('elderly')) {
        if (personAge < 60) {
            breakdown.age = { match: false, reason: 'Scheme intended for Senior Citizens (Age 60+)' };
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    }

    // Child check
    if (schemeOcc === 'child' || schemeAgeGroup.toLowerCase() === 'children' || schemeElig.includes('children')) {
        if (personAge > 14) {
            breakdown.age = { match: false, reason: 'Scheme intended specifically for children (Age 0-14)' };
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    }

    // ---- OCCUPATION & CATEGORY RELEVANCE FILTER ----
    // Exclude completely irrelevant categories based on occupation
    if (personOcc.includes('student')) {
        const irrelevantForStudents = ['agriculture', 'entrepreneurship', 'pension', 'housing'];
        if (irrelevantForStudents.includes(schemeCat) && schemeOcc !== 'student') {
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    } else if (personOcc.includes('farmer') || personOcc.includes('agriculture')) {
        const irrelevantForFarmers = ['entrepreneurship'];
        if (irrelevantForFarmers.includes(schemeCat) && schemeOcc !== 'farmer') {
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    } else if (personOcc.includes('entrepreneur') || personOcc.includes('business')) {
        const irrelevantForEntrepreneurs = ['agriculture', 'pension'];
        if (irrelevantForEntrepreneurs.includes(schemeCat) && schemeOcc !== 'entrepreneur') {
            return { eligible: false, score: 0, confidence: 0, breakdown };
        }
    }

    // ---- 1. AGE CHECK ----
    if (schemeAgeGroup === 'All' || schemeAgeGroup === 'Any') {
        breakdown.age = { match: true, reason: 'Open to all ages' };
        score += 1;
    } else if (schemeAgeGroup.includes('+')) {
        const minAge = parseInt(schemeAgeGroup);
        if (personAge >= minAge) {
            breakdown.age = { match: true, reason: `Age ${personAge} meets ${schemeAgeGroup} requirement` };
            score += 1;
        } else {
            breakdown.age = { match: false, reason: `Age ${personAge} does not meet ${schemeAgeGroup} requirement` };
            rejected = true;
        }
    } else if (schemeAgeGroup.includes('-')) {
        const parts = schemeAgeGroup.split('-').map(s => parseInt(s));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            if (personAge >= parts[0] && personAge <= parts[1]) {
                breakdown.age = { match: true, reason: `Age ${personAge} is within ${schemeAgeGroup}` };
                score += 1;
            } else {
                breakdown.age = { match: false, reason: `Age ${personAge} is outside ${schemeAgeGroup}` };
                rejected = true;
            }
        }
    }

    // ---- 2. GENDER CHECK (STRICT) ----
    if (schemeGender === 'all' || schemeGender === 'any') {
        breakdown.gender = { match: true, reason: 'Open to all genders' };
        score += 1;
    } else if (schemeGender === 'female' || schemeGender === 'women') {
        if (personGender === 'female' || personGender === 'women') {
            breakdown.gender = { match: true, reason: 'Gender matches (Female)' };
            score += 1;
        } else {
            breakdown.gender = { match: false, reason: 'Women-only scheme — not eligible' };
            rejected = true;
        }
    } else if (schemeGender === 'male') {
        if (personGender === 'male') {
            breakdown.gender = { match: true, reason: 'Gender matches (Male)' };
            score += 1;
        } else {
            breakdown.gender = { match: false, reason: 'Male-only scheme — not eligible' };
            rejected = true;
        }
    }

    // ---- 3. OCCUPATION CHECK (STRICT) ----
    if (schemeOcc === 'any' || schemeOcc === 'all') {
        breakdown.occupation = { match: true, reason: 'Open to all occupations' };
        score += 1;
    } else if (schemeOcc === 'farmer') {
        if (personOcc.includes('farmer') || personOcc.includes('agriculture') || personOcc.includes('farming')) {
            breakdown.occupation = { match: true, reason: `Occupation "${person.occupation}" matches Farmer requirement` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match Farmer requirement` };
            rejected = true;
        }
    } else if (schemeOcc === 'student') {
        if (personOcc.includes('student')) {
            breakdown.occupation = { match: true, reason: `Occupation "${person.occupation}" matches Student requirement` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match Student requirement` };
            rejected = true;
        }
    } else if (schemeOcc === 'unemployed') {
        if (personOcc.includes('unemployed') || personOcc === '' || personOcc === 'none') {
            breakdown.occupation = { match: true, reason: 'Matches Unemployed requirement' };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match Unemployed requirement` };
            rejected = true;
        }
    } else if (schemeOcc === 'entrepreneur') {
        if (personOcc.includes('entrepreneur') || personOcc.includes('business') || personOcc.includes('startup') || personOcc.includes('self-employed') || personOcc.includes('self employed')) {
            breakdown.occupation = { match: true, reason: `Occupation "${person.occupation}" matches Entrepreneur requirement` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match Entrepreneur requirement` };
            rejected = true;
        }
    } else if (schemeOcc === 'worker') {
        if (personOcc.includes('worker') || personOcc.includes('labourer') || personOcc.includes('labor') || personOcc.includes('daily wage') || personOcc.includes('construction')) {
            breakdown.occupation = { match: true, reason: `Occupation "${person.occupation}" matches Worker requirement` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match Worker requirement` };
            rejected = true;
        }
    } else if (schemeOcc === 'senior citizen') {
        if (personAge >= 60) {
            breakdown.occupation = { match: true, reason: 'Age qualifies as Senior Citizen' };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Age ${personAge} does not qualify as Senior Citizen (60+)` };
            rejected = true;
        }
    } else if (schemeOcc === 'widow') {
        if (personMarital === 'widow' || personMarital === 'widowed') {
            breakdown.occupation = { match: true, reason: 'Marital status matches Widow requirement' };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: 'Not a widow — not eligible' };
            rejected = true;
        }
    } else if (schemeOcc === 'working professional') {
        if (personOcc && personOcc !== 'unemployed' && personOcc !== 'student' && personOcc !== 'none') {
            breakdown.occupation = { match: true, reason: `Occupation "${person.occupation}" qualifies as Working Professional` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match Working Professional requirement` };
            rejected = true;
        }
    } else if (schemeOcc === 'child') {
        if (personAge <= 14) {
            breakdown.occupation = { match: true, reason: `Age ${personAge} qualifies as Child` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Age ${personAge} does not qualify as Child` };
            rejected = true;
        }
    } else {
        if (personOcc.includes(schemeOcc) || schemeOcc.includes(personOcc)) {
            breakdown.occupation = { match: true, reason: `Occupation match: "${person.occupation}"` };
            score += 1;
        } else {
            breakdown.occupation = { match: false, reason: `Occupation "${person.occupation}" does not match "${scheme.occupation}"` };
            rejected = true;
        }
    }

    // ---- 4. INCOME CHECK (STRICT) ----
    if (schemeIncome === 'any' || schemeIncome === 'no limit' || schemeIncome === '') {
        breakdown.income = { match: true, reason: 'No income limit' };
        score += 1;
    } else if (schemeIncome === 'low income') {
        if (personIncome <= 250000) {
            breakdown.income = { match: true, reason: `Income ₹${personIncome} qualifies as Low Income (≤ ₹2.5 Lakh)` };
            score += 1;
        } else {
            breakdown.income = { match: false, reason: `Income ₹${personIncome} exceeds Low Income threshold (₹2.5 Lakh)` };
            rejected = true;
        }
    } else {
        const numStr = schemeIncome.replace(/[^0-9.]/g, '');
        let limit = parseFloat(numStr);
        if (schemeIncome.includes('lakh')) {
            limit = limit * 100000;
        } else if (schemeIncome.includes('month')) {
            limit = limit * 12;
        } else if (limit < 1000) {
            limit = limit * 100000;
        }

        if (limit && personIncome <= limit) {
            breakdown.income = { match: true, reason: `Income ₹${personIncome} is within limit (₹${limit})` };
            score += 1;
        } else if (limit) {
            breakdown.income = { match: false, reason: `Income ₹${personIncome} exceeds limit of ₹${limit}` };
            rejected = true;
        } else {
            breakdown.income = { match: true, reason: 'Income limit could not be parsed — assumed eligible' };
            score += 1;
        }
    }

    // ---- 5. STATE CHECK ----
    if (schemeState === 'all' || schemeState === 'any' || schemeState === 'central' || schemeState === 'all india') {
        breakdown.state = { match: true, reason: 'Central / All India scheme' };
        score += 1;
    } else if (personState && schemeState.includes(personState)) {
        breakdown.state = { match: true, reason: `State "${person.state}" matches` };
        score += 1;
    } else {
        breakdown.state = { match: false, reason: `State "${person.state}" does not match "${scheme.state}"` };
        rejected = true;
    }

    // ---- 6. EDUCATION CHECK ----
    if (schemeEdu === 'all' || schemeEdu === 'any' || schemeEdu === '') {
        breakdown.education = { match: true, reason: 'No education restriction' };
        score += 1;
    } else if (personEdu && (schemeEdu.includes(personEdu) || personEdu.includes(schemeEdu))) {
        breakdown.education = { match: true, reason: `Education "${person.education}" matches` };
        score += 1;
    } else {
        breakdown.education = { match: true, reason: 'Education criteria met' };
        score += 1;
    }

    // ---- 7. CATEGORY/CASTE CHECK ----
    if (schemeElig.includes('sc') || schemeElig.includes('st') || schemeElig.includes('obc') || schemeElig.includes('minority') || schemeElig.includes('ews')) {
        if (personCat && (schemeElig.includes(personCat) || personCat.includes('sc') || personCat.includes('st') || personCat.includes('obc'))) {
            breakdown.category = { match: true, reason: `Category "${person.category}" matches eligibility` };
            score += 1;
        } else {
            breakdown.category = { match: false, reason: `Category "${person.category}" does not match scheme requirements` };
            rejected = true;
        }
    } else {
        breakdown.category = { match: true, reason: 'No specific category restriction' };
        score += 1;
    }

    const confidence = Math.round((score / maxScore) * 100);

    return {
        eligible: !rejected,
        score,
        maxScore,
        confidence,
        breakdown
    };
}

// ============================================================
// MAIN RECOMMENDATION ENDPOINT — FAMILY-BASED
// ============================================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        // 1. Fetch head user profile
        const [users] = await db.execute(
            'SELECT id, name, age, gender, occupation, income, education, state, category, disability_status, marital_status FROM Users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const headUser = users[0];

        // 2. Fetch family members
        const [familyMembers] = await db.execute(
            'SELECT * FROM FamilyMembers WHERE head_user_id = ?',
            [req.user.id]
        );

        // 3. Build people list: Head + all family members
        const people = [
            { ...headUser, member_name: headUser.name || 'You', relationship: 'Self (Head of Family)', family_member_id: null }
        ];
        for (const fm of familyMembers) {
            people.push({
                ...fm,
                member_name: fm.name,
                relationship: fm.relationship,
                family_member_id: fm.id,
                state: fm.state || headUser.state, // inherit state from head if not set
                category: fm.category || headUser.category // inherit category from head
            });
        }

        // 4. Fetch all schemes
        const [schemes] = await db.execute('SELECT * FROM Government_Schemes');

        // 5. Generate recommendations for each person against each scheme
        let recommendations = [];

        for (const person of people) {
            for (const scheme of schemes) {
                const result = checkEligibility(person, scheme);

                // STRICT: Only include if ALL mandatory criteria pass
                if (result.eligible && result.confidence >= 50) {
                    let parsedDocs = [];
                    let parsedSteps = [];
                    try { parsedDocs = typeof scheme.required_documents === 'string' ? JSON.parse(scheme.required_documents) : (scheme.required_documents || []); } catch(e){}
                    try { parsedSteps = typeof scheme.application_steps === 'string' ? JSON.parse(scheme.application_steps) : (scheme.application_steps || []); } catch(e){}

                    let confidence_tier = 'Low Confidence';
                    if (result.confidence >= 80) confidence_tier = 'High Confidence';
                    else if (result.confidence >= 50) confidence_tier = 'Medium Confidence';

                    recommendations.push({
                        scheme_id: scheme.id,
                        scheme_name: scheme.scheme_name,
                        category: scheme.category,
                        eligibility_percentage: result.confidence,
                        confidence_score: result.confidence,
                        confidence_tier,
                        member_name: person.member_name,
                        relationship: person.relationship,
                        family_member_id: person.family_member_id,
                        match_breakdown: result.breakdown,
                        explanation: Object.entries(result.breakdown)
                            .map(([key, val]) => `${val.match ? '✔' : '✗'} ${key}: ${val.reason}`)
                            .join(' | '),
                        benefits: scheme.benefits,
                        eligibility_criteria: scheme.eligibility,
                        required_documents: parsedDocs,
                        application_steps: parsedSteps,
                        estimated_approval_time: scheme.estimated_approval_time || '15-30 days',
                        benefits_amount: scheme.benefits_amount || 'Variable',
                        deadline: scheme.deadline
                    });
                }
            }
        }

        // 6. Sort by confidence descending
        recommendations.sort((a, b) => b.confidence_score - a.confidence_score);

        // 7. Save to DB (clear old, save new)
        await db.execute('DELETE FROM Recommendations WHERE user_id = ?', [req.user.id]);
        for (const rec of recommendations) {
            if (rec.confidence_score >= 50) {
                const [result] = await db.execute(
                    'INSERT INTO Recommendations (user_id, scheme_id, eligibility_percentage, confidence_score, explanation, family_member_id, member_name, relationship) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [req.user.id, rec.scheme_id, rec.eligibility_percentage, rec.confidence_score, JSON.stringify(rec.match_breakdown), rec.family_member_id, rec.member_name, rec.relationship]
                );
                rec.recommendation_id = result.insertId;
            }
        }

        // 8. Return (or empty message)
        if (recommendations.length === 0) {
            return res.json({ recommendations: [], message: 'No Eligible Schemes Found Based on Current Family Profile' });
        }

        res.json(recommendations);
    } catch (error) {
        console.error('AI Engine Error:', error);
        res.status(500).json({ message: 'Server error while generating AI recommendations' });
    }
});

// ============================================================
// INSIGHTS ENDPOINT — FAMILY VERSION
// ============================================================
router.get('/insights', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT * FROM Users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = users[0];

        const [familyMembers] = await db.execute('SELECT * FROM FamilyMembers WHERE head_user_id = ?', [req.user.id]);
        const [schemes] = await db.execute('SELECT * FROM Government_Schemes');

        const people = [{ ...user, name: user.name || 'You', relationship: 'Self' }, ...familyMembers];

        let totalEligible = 0;
        let totalRejected = 0;
        let rejectionReasons = {};

        for (const person of people) {
            for (const scheme of schemes) {
                const result = checkEligibility(person, scheme);
                if (result.eligible && result.confidence >= 50) {
                    totalEligible++;
                } else {
                    totalRejected++;
                    // Track rejection reasons
                    for (const [key, val] of Object.entries(result.breakdown)) {
                        if (!val.match) {
                            rejectionReasons[key] = (rejectionReasons[key] || 0) + 1;
                        }
                    }
                }
            }
        }

        const influentialFactors = [];
        influentialFactors.push(`Your family has ${people.length} member(s) being analyzed.`);
        influentialFactors.push(`${totalEligible} scheme matches found across all family members.`);
        if (familyMembers.length > 0) {
            influentialFactors.push(`Family members added: ${familyMembers.map(m => `${m.name} (${m.relationship})`).join(', ')}`);
        }

        const exclusionReasons = [];
        if (rejectionReasons.occupation) exclusionReasons.push(`${rejectionReasons.occupation} schemes rejected due to occupation mismatch`);
        if (rejectionReasons.gender) exclusionReasons.push(`${rejectionReasons.gender} schemes rejected due to gender restrictions`);
        if (rejectionReasons.age) exclusionReasons.push(`${rejectionReasons.age} schemes rejected due to age criteria`);
        if (rejectionReasons.income) exclusionReasons.push(`${rejectionReasons.income} schemes rejected due to income limits`);
        if (rejectionReasons.disability) exclusionReasons.push(`${rejectionReasons.disability} schemes rejected — disability status required`);

        const alternativeRecommendations = [];
        if (rejectionReasons.occupation > 5) alternativeRecommendations.push('Adding family members with different occupations (e.g., Farmer, Student) could unlock more schemes.');
        if (familyMembers.length === 0) alternativeRecommendations.push('Add family members to discover schemes they may individually qualify for.');

        res.json({ influentialFactors, exclusionReasons, alternativeRecommendations });
    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ message: 'Server error while generating insights' });
    }
});

// ============================================================
// FAMILY STATS FOR DASHBOARD
// ============================================================
router.get('/family-stats', authMiddleware, async (req, res) => {
    try {
        const [familyMembers] = await db.execute('SELECT * FROM FamilyMembers WHERE head_user_id = ?', [req.user.id]);
        const [recs] = await db.execute('SELECT * FROM Recommendations WHERE user_id = ?', [req.user.id]);

        const totalMembers = familyMembers.length + 1; // +1 for head
        const totalEligibleSchemes = recs.length;
        const uniqueMembers = new Set(recs.map(r => r.member_name || 'You')).size;
        const highestConfidence = recs.length > 0 ? recs.reduce((max, r) => r.confidence_score > max.confidence_score ? r : max, recs[0]) : null;
        const avgConfidence = recs.length > 0 ? Math.round(recs.reduce((sum, r) => sum + r.confidence_score, 0) / recs.length) : 0;

        // Profile readiness: check how many members have complete profiles
        let completeProfiles = 0;
        const allPeople = [{ age: true, gender: true, occupation: true }, ...familyMembers]; // head is assumed complete
        for (const p of familyMembers) {
            if (p.age && p.gender && p.occupation) completeProfiles++;
        }
        completeProfiles++; // head
        const profileReadiness = Math.round((completeProfiles / totalMembers) * 100);

        res.json({
            totalMembers,
            totalEligibleSchemes,
            membersEligible: uniqueMembers,
            highestConfidenceScheme: highestConfidence ? { name: highestConfidence.member_name, scheme: 'See recommendations', score: highestConfidence.confidence_score } : null,
            profileReadiness,
            avgConfidence,
            familyMembers: familyMembers.map(m => ({ id: m.id, name: m.name, relationship: m.relationship }))
        });
    } catch (error) {
        console.error('Family Stats Error:', error);
        res.status(500).json({ message: 'Error fetching family stats' });
    }
});

// ============================================================
// FEEDBACK ENDPOINT (UNCHANGED)
// ============================================================
router.post('/feedback', authMiddleware, async (req, res) => {
    try {
        const { scheme_id, recommendation_id, rating, liked, disliked, saved, applied, review_text } = req.body;

        const [existing] = await db.execute(
            'SELECT * FROM Recommendation_Feedback WHERE user_id = ? AND scheme_id = ? AND recommendation_id = ?',
            [req.user.id, scheme_id, recommendation_id]
        );

        if (existing.length > 0) {
            const e = existing[0];
            await db.execute(
                `UPDATE Recommendation_Feedback SET 
                 rating = ?, liked = ?, disliked = ?, saved = ?, applied = ?, review_text = ?
                 WHERE id = ?`,
                [
                    rating !== undefined ? rating : e.rating,
                    liked !== undefined ? liked : e.liked,
                    disliked !== undefined ? disliked : e.disliked,
                    saved !== undefined ? saved : e.saved,
                    applied !== undefined ? applied : e.applied,
                    review_text !== undefined ? review_text : e.review_text,
                    e.id
                ]
            );
        } else {
            await db.execute(
                `INSERT INTO Recommendation_Feedback 
                 (user_id, scheme_id, recommendation_id, rating, liked, disliked, saved, applied, review_text) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.user.id, scheme_id, recommendation_id, rating || 0, liked || false, disliked || false, saved || false, applied || false, review_text || null]
            );
        }

        if (saved) {
            await db.execute('INSERT IGNORE INTO Saved_Schemes (user_id, scheme_id) VALUES (?, ?)', [req.user.id, scheme_id]);
        } else if (saved === false) {
            await db.execute('DELETE FROM Saved_Schemes WHERE user_id = ? AND scheme_id = ?', [req.user.id, scheme_id]);
        }

        res.json({ message: 'Feedback recorded successfully' });
    } catch (error) {
        console.error('Feedback Error:', error);
        res.status(500).json({ message: 'Error recording feedback' });
    }
});

// ============================================================
// HISTORY ENDPOINT (UNCHANGED)
// ============================================================
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const [feedback] = await db.execute(`
            SELECT rf.*, s.scheme_name, s.category, s.benefits, r.eligibility_percentage, r.confidence_score, r.explanation
            FROM Recommendation_Feedback rf
            JOIN Government_Schemes s ON rf.scheme_id = s.id
            JOIN Recommendations r ON rf.recommendation_id = r.id
            WHERE rf.user_id = ?
            ORDER BY rf.created_at DESC
        `, [req.user.id]);

        const viewedSchemes = feedback;
        const savedSchemes = feedback.filter(f => f.saved);
        const appliedSchemes = feedback.filter(f => f.applied);
        const previousRecommendations = feedback.slice(0, 10);

        res.json({ viewedSchemes, savedSchemes, appliedSchemes, previousRecommendations });
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ message: 'Error fetching history' });
    }
});

module.exports = router;
