const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Auth middleware
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

// GET all family members for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [members] = await db.execute(
            'SELECT * FROM FamilyMembers WHERE head_user_id = ? ORDER BY created_at ASC',
            [req.user.id]
        );
        res.json(members);
    } catch (error) {
        console.error('Get family members error:', error);
        res.status(500).json({ message: 'Error fetching family members' });
    }
});

// POST add a new family member
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, relationship, age, gender, occupation, income, education, disability_status, category, marital_status } = req.body;

        if (!name || !relationship) {
            return res.status(400).json({ message: 'Name and relationship are required' });
        }

        const [result] = await db.execute(
            `INSERT INTO FamilyMembers 
             (head_user_id, name, relationship, age, gender, occupation, income, education, disability_status, category, marital_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, name, relationship, age || null, gender || null, occupation || null, income || 0, education || null, disability_status || 'No', category || null, marital_status || null]
        );

        res.status(201).json({ message: 'Family member added successfully', id: result.insertId });
    } catch (error) {
        console.error('Add family member error:', error);
        res.status(500).json({ message: 'Error adding family member' });
    }
});

// PUT update a family member
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, relationship, age, gender, occupation, income, education, disability_status, category, marital_status } = req.body;

        // Verify ownership
        const [existing] = await db.execute('SELECT * FROM FamilyMembers WHERE id = ? AND head_user_id = ?', [req.params.id, req.user.id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Family member not found' });

        await db.execute(
            `UPDATE FamilyMembers SET 
             name = ?, relationship = ?, age = ?, gender = ?, occupation = ?, income = ?, 
             education = ?, disability_status = ?, category = ?, marital_status = ?
             WHERE id = ? AND head_user_id = ?`,
            [name, relationship, age || null, gender || null, occupation || null, income || 0, education || null, disability_status || 'No', category || null, marital_status || null, req.params.id, req.user.id]
        );

        res.json({ message: 'Family member updated successfully' });
    } catch (error) {
        console.error('Update family member error:', error);
        res.status(500).json({ message: 'Error updating family member' });
    }
});

// DELETE a family member
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT * FROM FamilyMembers WHERE id = ? AND head_user_id = ?', [req.params.id, req.user.id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Family member not found' });

        await db.execute('DELETE FROM FamilyMembers WHERE id = ? AND head_user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Family member deleted successfully' });
    } catch (error) {
        console.error('Delete family member error:', error);
        res.status(500).json({ message: 'Error deleting family member' });
    }
});

module.exports = router;
