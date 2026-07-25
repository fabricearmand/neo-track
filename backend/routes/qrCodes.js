const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();
const pool = require('../config/database');

// Get all QR codes for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT qc.*, oi.owner_name, oi.owner_email, oi.owner_phone
             FROM qr_codes qc
             LEFT JOIN owner_info oi ON qc.id = oi.qr_code_id
             WHERE qc.user_id = ?`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get QR codes error:', error);
        res.status(500).json({ error: 'Failed to fetch QR codes' });
    }
});

// Get single QR code
router.get('/:qrCodeId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT qc.*, oi.owner_name, oi.owner_email, oi.owner_phone
             FROM qr_codes qc
             LEFT JOIN owner_info oi ON qc.id = oi.qr_code_id
             WHERE qc.qr_code_id = ?`,
            [req.params.qrCodeId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'QR code not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get QR code error:', error);
        res.status(500).json({ error: 'Failed to fetch QR code' });
    }
});

// Create new QR code
router.post('/', async (req, res) => {
    try {
        const {
            user_id,
            item_name,
            item_description,
            reward_amount,
            qr_type,
            qr_cost,
            owner_name,
            owner_email,
            owner_phone,
            contact_name,
            contact_email,
            contact_phone
        } = req.body;

        const qr_code_id = 'QR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        // Insert QR code
        const [qrResult] = await pool.execute(
            'INSERT INTO qr_codes (qr_code_id, user_id, item_name, item_description, reward_amount, qr_type) VALUES (?, ?, ?, ?, ?, ?)',
            [qr_code_id, user_id, item_name, item_description || null, reward_amount || 0, qr_type || 'basic']
        );

        const qrCodeId = qrResult.insertId;

        await pool.execute(
            'INSERT INTO notifications (user_id, qr_code_id, title, message) VALUES (?, ?, ?, ?)',
            [user_id, qrCodeId, 'QR Code Created', `Your QR code for "${item_name}" has been created successfully.`]
        );

        // Insert owner info
        await pool.execute(
            'INSERT INTO owner_info (qr_code_id, owner_name, owner_email, owner_phone) VALUES (?, ?, ?, ?)',
            [qrCodeId, owner_name, owner_email, owner_phone]
        );

        // Insert emergency contact if provided
        if (contact_name || contact_email || contact_phone) {
            await pool.execute(
                'INSERT INTO emergency_contacts (qr_code_id, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?)',
                [qrCodeId, contact_name, contact_email, contact_phone]
            );
        }

        // Generate QR code data URL - now points to public page
        const publicUrl = `http://localhost:3000/public-item.html?id=${qr_code_id}`;
        const qrData = JSON.stringify({
            qr_code_id,
            item_name,
            owner_name,
            owner_email,
            owner_phone,
            public_url: publicUrl
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData);

        res.status(201).json({
            id: qrCodeId,
            qr_code_id,
            qr_code_data_url: qrCodeDataURL,
            message: 'QR code created successfully'
        });

    } catch (error) {
        console.error('Create QR code error:', error);
        res.status(500).json({ error: 'Failed to create QR code' });
    }
});

// Update QR code
router.put('/:qrCodeId', async (req, res) => {
    try {
        const { item_description, reward_amount, status } = req.body;

        const [result] = await pool.execute(
            'UPDATE qr_codes SET item_description = ?, reward_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE qr_code_id = ?',
            [item_description, reward_amount, status, req.params.qrCodeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'QR code not found' });
        }

        res.json({ message: 'QR code updated successfully' });

    } catch (error) {
        console.error('Update QR code error:', error);
        res.status(500).json({ error: 'Failed to update QR code' });
    }
});

// Delete QR code
router.delete('/:qrCodeId', async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM qr_codes WHERE qr_code_id = ?',
            [req.params.qrCodeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'QR code not found' });
        }

        res.json({ message: 'QR code deleted successfully' });

    } catch (error) {
        console.error('Delete QR code error:', error);
        res.status(500).json({ error: 'Failed to delete QR code' });
    }
});

module.exports = router;
