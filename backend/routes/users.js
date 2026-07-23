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

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, phone, age, gender, occupation, income, education, state, category, disability_status, is_admin, marital_status FROM Users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { age, gender, occupation, income, education, state, category, disability_status, marital_status } = req.body;
        await db.execute(
            'UPDATE Users SET age = ?, gender = ?, occupation = ?, income = ?, education = ?, state = ?, category = ?, disability_status = ?, marital_status = ? WHERE id = ?',
            [age, gender, occupation, income, education, state, category, disability_status, marital_status, req.user.id]
        );
        // Delete stale cached recommendations so new ones are regenerated instantly
        await db.execute('DELETE FROM Recommendations WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/dashboard-stats', authMiddleware, async (req, res) => {
    try {
        // 1. Calculate Profile Readiness Score & Missing Fields
        const [users] = await db.execute('SELECT age, gender, occupation, income, education, state, category, disability_status, marital_status FROM Users WHERE id = ?', [req.user.id]);
        let completionScore = 0;
        let missingFields = [];
        
        if (users.length > 0) {
            const u = users[0];
            const fields = ['age', 'gender', 'occupation', 'income', 'education', 'state', 'category', 'disability_status', 'marital_status'];
            let filled = 0;
            
            fields.forEach(f => { 
                if (u[f] !== null && u[f] !== '') {
                    filled++;
                } else {
                    missingFields.push(f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
                }
            });
            completionScore = Math.round((filled / fields.length) * 100);
        }

        // 2. Count Eligible Schemes (Recommendations >= 50%)
        const [recs] = await db.execute('SELECT COUNT(*) as count FROM Recommendations WHERE user_id = ? AND eligibility_percentage >= 50', [req.user.id]);
        const eligibleCount = recs[0].count;

        // 3. Count Saved Schemes
        const [saved] = await db.execute('SELECT COUNT(*) as count FROM Saved_Schemes WHERE user_id = ?', [req.user.id]);
        const savedCount = saved[0].count;

        // 4. Calculate Advanced XAI Metrics based on REAL data
        const [genRecs] = await db.execute('SELECT COUNT(*) as count FROM Recommendations WHERE user_id = ?', [req.user.id]);
        const generatedCount = genRecs[0].count;
        
        const [feedbackData] = await db.execute('SELECT COUNT(*) as count, SUM(IF(rating > 0, rating, 0)) as total_rating, SUM(IF(rating > 0, 1, 0)) as rating_count, SUM(IF(saved = 1, 1, 0)) as saved_count, SUM(IF(liked = 1, 1, 0)) as liked_count, SUM(IF(applied = 1, 1, 0)) as applied_count FROM Recommendation_Feedback WHERE user_id = ?', [req.user.id]);
        const fb = feedbackData[0];
        
        const avgRating = fb.rating_count > 0 ? (fb.total_rating / fb.rating_count) : 0;
        const avgRatingPercentage = (avgRating / 5) * 100;
        
        const savedCountFB = parseInt(fb.saved_count) || 0;
        const likedCountFB = parseInt(fb.liked_count) || 0;
        const appliedCountFB = parseInt(fb.applied_count) || 0;
        
        // Accepted is considered any positive interaction
        const acceptedCountFB = savedCountFB + likedCountFB + appliedCountFB;

        const acceptanceRate = generatedCount > 0 ? Math.min(100, Math.round((acceptedCountFB / generatedCount) * 100)) : 0;
        const savedRate = generatedCount > 0 ? Math.min(100, Math.round((savedCountFB / generatedCount) * 100)) : 0;
        const appliedRate = generatedCount > 0 ? Math.min(100, Math.round((appliedCountFB / generatedCount) * 100)) : 0;

        const accuracyScore = generatedCount > 0 ? Math.min(100, Math.round(((appliedCountFB + savedCountFB) / generatedCount) * 100)) : 0;

        let satisfactionScore = 0;
        if (generatedCount > 0) {
            satisfactionScore = Math.round((avgRatingPercentage * 0.40) + (acceptanceRate * 0.20) + (savedRate * 0.20) + (appliedRate * 0.20));
        }

        // 5. Application Readiness Score & Deadlines
        let documentAvailabilityScore = 0;
        let missingDocumentsAlert = [];
        let upcomingDeadlines = [];
        let eligibilityScore = 0;

        if (genRecs[0].count > 0) {
            // Get required documents from recommended schemes
            const [recs] = await db.execute('SELECT r.eligibility_percentage, s.required_documents, s.deadline, s.scheme_name FROM Recommendations r JOIN Government_Schemes s ON r.scheme_id = s.id WHERE r.user_id = ?', [req.user.id]);
            
            let totalElig = 0;
            let allRequiredDocs = new Set();
            recs.forEach(r => {
                totalElig += r.eligibility_percentage;
                try {
                    const docs = typeof r.required_documents === 'string' ? JSON.parse(r.required_documents) : (r.required_documents || []);
                    docs.forEach(d => allRequiredDocs.add(d));
                } catch(e) {}
                
                if (r.deadline) {
                    const diffDays = Math.ceil((new Date(r.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0 && diffDays <= 30) {
                        upcomingDeadlines.push({ name: r.scheme_name, daysLeft: diffDays });
                    }
                }
            });
            eligibilityScore = Math.round(totalElig / recs.length) || 0;
            
            // Check how many documents user has
            const [userDocs] = await db.execute('SELECT document_type FROM User_Documents WHERE user_id = ? AND is_available = 1', [req.user.id]);
            const userDocSet = new Set(userDocs.map(d => d.document_type));
            
            let hasDocs = 0;
            allRequiredDocs.forEach(d => {
                if (userDocSet.has(d)) hasDocs++;
                else missingDocumentsAlert.push(d);
            });
            
            if (allRequiredDocs.size > 0) {
                documentAvailabilityScore = Math.round((hasDocs / allRequiredDocs.size) * 100);
            } else {
                documentAvailabilityScore = 100;
            }
        } else {
            eligibilityScore = 0;
            documentAvailabilityScore = 0;
        }

        const readinessScore = Math.round((completionScore * 0.4) + (documentAvailabilityScore * 0.4) + (eligibilityScore * 0.2));

        res.json({
            profileCompletion: completionScore,
            eligibleSchemes: eligibleCount,
            savedSchemes: savedCount,
            missingFields: missingFields,
            readiness: {
                score: readinessScore,
                documentScore: documentAvailabilityScore,
                eligibilityScore: eligibilityScore,
                missingDocuments: missingDocumentsAlert.slice(0, 5), // top 5
                upcomingDeadlines: upcomingDeadlines.sort((a,b)=>a.daysLeft-b.daysLeft).slice(0, 3)
            },
            metrics: {
                totalGenerated: generatedCount,
                acceptanceRate: acceptanceRate,
                accuracyScore: accuracyScore,
                satisfactionScore: satisfactionScore,
                savedCount: savedCountFB,
                appliedCount: appliedCountFB
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

router.get('/analytics', authMiddleware, async (req, res) => {
    try {
        // 1. Top Applied Schemes
        const [topApplied] = await db.execute(`
            SELECT s.scheme_name as name, COUNT(rf.id) as applications 
            FROM Recommendation_Feedback rf 
            JOIN Government_Schemes s ON rf.scheme_id = s.id 
            WHERE rf.applied = 1
            GROUP BY s.id 
            ORDER BY applications DESC 
            LIMIT 5
        `);

        // 2. Category Distribution
        const [categoryDist] = await db.execute(`
            SELECT category as name, COUNT(*) as value 
            FROM Government_Schemes 
            WHERE category IS NOT NULL AND category != ''
            GROUP BY category
        `);

        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM Users');
        const totalUsers = userCount[0].count;
        
        const [schemeCount] = await db.execute('SELECT COUNT(*) as count FROM Government_Schemes');
        const totalSchemes = schemeCount[0].count;

        const [globalFB] = await db.execute('SELECT SUM(IF(application_status="Started",1,0)) as started, SUM(IF(application_status="Completed",1,0)) as completed, SUM(IF(saved=1,1,0)) as saved, SUM(IF(applied=1,1,0)) as applied, AVG(IF(rating>0,rating,NULL)) as avg_rating FROM Recommendation_Feedback');
        const totalApplied = globalFB[0].applied || 0;
        const totalSaved = globalFB[0].saved || 0;
        const totalStarted = globalFB[0].started || 0;
        const totalCompleted = globalFB[0].completed || 0;
        const avgRating = globalFB[0].avg_rating || 0;

        const [recStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_recs,
                SUM(IF(confidence_score >= 80, 1, 0)) as high_conf,
                SUM(IF(confidence_score >= 50 AND confidence_score < 80, 1, 0)) as med_conf,
                SUM(IF(confidence_score < 50, 1, 0)) as low_conf
            FROM Recommendations
        `);

        const totalRecs = recStats[0].total_recs || 0;
        const highConf = recStats[0].high_conf || 0;
        const medConf = recStats[0].med_conf || 0;
        const lowConf = recStats[0].low_conf || 0;

        const acceptanceRate = totalRecs > 0 ? Math.round(((totalSaved + totalApplied) / totalRecs) * 100) : 0;
        const satisfactionScore = Math.round((avgRating / 5) * 100) || 0;

        res.json({
            schemeData: topApplied.length ? topApplied : [{ name: 'Awaiting Data', applications: 0 }],
            demographicData: categoryDist.length ? categoryDist : [{ name: 'General', value: 1 }],
            totalUsers,
            totalSchemes,
            totalApplied,
            totalSaved,
            totalStarted,
            totalCompleted,
            recommendationData: {
                totalRecs,
                highConf,
                medConf,
                lowConf,
                acceptanceRate,
                satisfactionScore
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// Get Saved Schemes
router.get('/saved-schemes', authMiddleware, async (req, res) => {
    try {
        const [saved] = await db.execute(`
            SELECT s.*, ss.saved_at 
            FROM Saved_Schemes ss
            JOIN Government_Schemes s ON ss.scheme_id = s.id
            WHERE ss.user_id = ?
            ORDER BY ss.saved_at DESC
        `, [req.user.id]);
        res.json(saved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching saved schemes' });
    }
});

// Save a Scheme
router.post('/saved-schemes', authMiddleware, async (req, res) => {
    try {
        const { scheme_id } = req.body;
        
        // Check if already saved
        const [existing] = await db.execute('SELECT id FROM Saved_Schemes WHERE user_id = ? AND scheme_id = ?', [req.user.id, scheme_id]);
        if (existing.length > 0) return res.status(400).json({ message: 'Scheme already saved' });

        await db.execute('INSERT INTO Saved_Schemes (user_id, scheme_id) VALUES (?, ?)', [req.user.id, scheme_id]);
        res.json({ message: 'Scheme saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving scheme' });
    }
});

// Remove a Saved Scheme
router.delete('/saved-schemes/:scheme_id', authMiddleware, async (req, res) => {
    try {
        await db.execute('DELETE FROM Saved_Schemes WHERE user_id = ? AND scheme_id = ?', [req.user.id, req.params.scheme_id]);
        res.json({ message: 'Scheme removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing scheme' });
    }
});

module.exports = router;
