const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all influencers
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM influencers ORDER BY follower_count DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get influencer by username
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await db.query(
            'SELECT * FROM influencers WHERE username = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Influencer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get health claims for an influencer
router.get('/:username/claims', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await db.query(
            `SELECT hc.*, cv.verification_status, cv.confidence_score
             FROM influencers i
             JOIN health_claims hc ON i.id = hc.influencer_id
             LEFT JOIN claim_verifications cv ON hc.id = cv.claim_id
             WHERE i.username = $1
             ORDER BY hc.posted_date DESC`,
            [username]
        );
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
