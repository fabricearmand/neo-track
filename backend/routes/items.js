const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get items for user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM qr_codes WHERE user_id = ?',
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

module.exports = router;
