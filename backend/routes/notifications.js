const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all notifications for the logged-in user
router.get('/', async (req, res) => {
    try {
        const [notifications] = await db.execute(
            'SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark a specific notification as read
router.put('/:id/read', async (req, res) => {
    try {
        await db.execute(
            'UPDATE Notifications SET read_status = 1 WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        await db.execute(
            'UPDATE Notifications SET read_status = 1 WHERE user_id = ?',
            [req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error("Error updating notifications:", error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

module.exports = router;
