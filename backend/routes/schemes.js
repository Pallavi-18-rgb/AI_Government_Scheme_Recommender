const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = 'SELECT * FROM Government_Schemes WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND (scheme_name LIKE ? OR benefits LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        const [schemes] = await db.execute(query, params);
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [schemes] = await db.execute('SELECT * FROM Government_Schemes WHERE id = ?', [req.params.id]);
        if (schemes.length === 0) return res.status(404).json({ message: 'Scheme not found' });
        res.json(schemes[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await db.execute(`
            SELECT r.*, u.name as user_name 
            FROM Scheme_Reviews r
            JOIN Users u ON r.user_id = u.id
            WHERE r.scheme_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        
        const [avg] = await db.execute('SELECT AVG(rating) as average_rating FROM Scheme_Reviews WHERE scheme_id = ?', [req.params.id]);
        
        res.json({
            reviews,
            average_rating: avg[0].average_rating || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

// Post Review
const authMiddleware = require('../middleware/auth');
router.post('/:id/reviews', authMiddleware, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Must be logged in to review' });
        
        const { rating, review } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating' });

        // Check if user already reviewed
        const [existing] = await db.execute('SELECT id FROM Scheme_Reviews WHERE user_id = ? AND scheme_id = ?', [req.user.id, req.params.id]);
        
        if (existing.length > 0) {
            await db.execute('UPDATE Scheme_Reviews SET rating = ?, review = ? WHERE id = ?', [rating, review, existing[0].id]);
        } else {
            await db.execute('INSERT INTO Scheme_Reviews (user_id, scheme_id, rating, review) VALUES (?, ?, ?, ?)', [req.user.id, req.params.id, rating, review]);
        }
        res.json({ message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error submitting review' });
    }
});

// Delete Review
router.delete('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Must be logged in to delete review' });
        
        // Ensure the user owns the review or is an admin
        const [review] = await db.execute('SELECT user_id FROM Scheme_Reviews WHERE id = ? AND scheme_id = ?', [req.params.reviewId, req.params.id]);
        if (review.length === 0) return res.status(404).json({ message: 'Review not found' });
        
        if (review[0].user_id !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await db.execute('DELETE FROM Scheme_Reviews WHERE id = ?', [req.params.reviewId]);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting review' });
    }
});

module.exports = router;
