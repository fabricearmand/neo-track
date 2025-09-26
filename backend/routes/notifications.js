const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get notifications for user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT n.*, qc.item_name
             FROM notifications n
             LEFT JOIN qr_codes qc ON n.qr_code_id = qc.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
    try {
        const [result] = await pool.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [req.params.notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/user/:userId/read-all', async (req, res) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [req.params.userId]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

module.exports = router;
