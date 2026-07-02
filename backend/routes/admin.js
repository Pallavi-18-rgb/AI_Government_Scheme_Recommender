const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is admin
const adminOnly = async (req, res, next) => {
    try {
        const [users] = await db.execute('SELECT is_admin FROM Users WHERE id = ?', [req.user.id]);
        if (users.length === 0 || !users[0].is_admin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error verifying admin status' });
    }
};

// Apply admin check to specific routes instead of globally
// router.use(adminOnly);

// Get global analytics
router.get('/analytics', adminOnly, async (req, res) => {
    try {
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM Users');
        const [schemeCount] = await db.execute('SELECT COUNT(*) as count FROM Government_Schemes');
        const [reviewCount] = await db.execute('SELECT COUNT(*) as count FROM Scheme_Reviews');
        
        res.json({
            totalUsers: userCount[0].count,
            totalSchemes: schemeCount[0].count,
            totalReviews: reviewCount[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// Get Chat Analytics
router.get('/chat-analytics', async (req, res) => {
    try {
        const [totalChats] = await db.execute('SELECT COUNT(*) as count FROM Chat_History');
        const [recentChats] = await db.execute(`
            SELECT c.message, c.sender, c.timestamp, u.name as user_name 
            FROM Chat_History c 
            JOIN Users u ON c.user_id = u.id 
            ORDER BY c.timestamp DESC LIMIT 10
        `);
        
        // Simple keyword frequency for "Most Asked Questions"
        const [userMessages] = await db.execute('SELECT message FROM Chat_History WHERE sender = "user"');
        const text = userMessages.map(m => m.message.toLowerCase()).join(' ');
        const keywords = ['scholarship', 'farmer', 'women', 'pension', 'health', 'housing', 'eligible', 'documents', 'apply'];
        const frequency = keywords.map(kw => ({
            keyword: kw,
            count: (text.match(new RegExp(kw, 'g')) || []).length
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        res.json({
            totalChats: totalChats[0].count,
            recentChats,
            topKeywords: frequency
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching chat analytics' });
    }
});

// Create new scheme
router.post('/schemes', adminOnly, async (req, res) => {
    try {
        const { scheme_name, benefits, eligibility, category, state, occupation, income_limit } = req.body;
        await db.execute(
            'INSERT INTO Government_Schemes (scheme_name, benefits, eligibility, category, state, occupation, income_limit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [scheme_name, benefits, eligibility, category, state, occupation, income_limit]
        );
        res.json({ message: 'Scheme created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating scheme' });
    }
});

// Edit existing scheme
router.put('/schemes/:id', adminOnly, async (req, res) => {
    try {
        const { scheme_name, benefits, eligibility, category, state, occupation, income_limit } = req.body;
        await db.execute(
            'UPDATE Government_Schemes SET scheme_name=?, benefits=?, eligibility=?, category=?, state=?, occupation=?, income_limit=? WHERE id=?',
            [scheme_name, benefits, eligibility, category, state, occupation, income_limit, req.params.id]
        );
        res.json({ message: 'Scheme updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating scheme' });
    }
});

// Delete scheme
router.delete('/schemes/:id', adminOnly, async (req, res) => {
    try {
        // Need to delete dependencies first due to foreign keys
        await db.execute('DELETE FROM Scheme_Reviews WHERE scheme_id = ?', [req.params.id]);
        await db.execute('DELETE FROM Saved_Schemes WHERE scheme_id = ?', [req.params.id]);
        await db.execute('DELETE FROM Recommendations WHERE scheme_id = ?', [req.params.id]);
        
        await db.execute('DELETE FROM Government_Schemes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Scheme deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting scheme' });
    }
});

module.exports = router;
