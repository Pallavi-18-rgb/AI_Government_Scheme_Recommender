const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Get all documents (required by eligible schemes + user's availability)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch recommendations to find eligible schemes
        const [recs] = await db.execute('SELECT scheme_id FROM Recommendations WHERE user_id = ?', [req.user.id]);
        
        let allRequiredDocs = new Set();
        
        if (recs.length > 0) {
            const schemeIds = recs.map(r => r.scheme_id).join(',');
            const [schemes] = await db.execute(`SELECT required_documents FROM Government_Schemes WHERE id IN (${schemeIds})`);
            
            schemes.forEach(s => {
                if (s.required_documents) {
                    try {
                        const docs = typeof s.required_documents === 'string' ? JSON.parse(s.required_documents) : s.required_documents;
                        docs.forEach(doc => allRequiredDocs.add(doc));
                    } catch(e) {}
                }
            });
        }
        
        const [userDocs] = await db.execute('SELECT document_type, is_available FROM User_Documents WHERE user_id = ?', [req.user.id]);
        const userDocMap = {};
        userDocs.forEach(d => { userDocMap[d.document_type] = d.is_available === 1 });

        const result = Array.from(allRequiredDocs).map(doc => ({
            name: doc,
            is_available: userDocMap[doc] || false
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching documents', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
});

// Update document availability
router.post('/update', authMiddleware, async (req, res) => {
    try {
        const { document_type, is_available } = req.body;
        
        await db.execute(
            `INSERT INTO User_Documents (user_id, document_type, is_available) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE is_available = ?`,
            [req.user.id, document_type, is_available, is_available]
        );
        
        res.json({ message: 'Document updated successfully' });
    } catch (error) {
        console.error('Error updating document', error);
        res.status(500).json({ message: 'Error updating document' });
    }
});

module.exports = router;
