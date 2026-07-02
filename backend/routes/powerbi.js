const express = require('express');
const router = express.Router();
const db = require('../config/db');

// This endpoint is specifically formatted to be consumed by Power BI's Web Data Connector.
// It aggregates data from multiple tables into a flat structure preferred by Power BI.
router.get('/export', async (req, res) => {
    try {
        // We do not enforce strict auth here if we assume Power BI is authenticating via an API key in a real scenario.
        // For demonstration purposes, we return the aggregated JSON structure.

        // 1. User Demographics
        const [users] = await db.execute('SELECT age, gender, occupation, state, category FROM Users');
        
        // 2. Scheme Analytics
        const [schemes] = await db.execute('SELECT id, scheme_name, category, state FROM Government_Schemes');
        
        // 3. Application Funnel (Saved, Feedback)
        const [feedback] = await db.execute('SELECT scheme_id, liked, saved, applied FROM Recommendation_Feedback');
        
        // 4. Notifications Sent (proxy for engagement)
        const [notifications] = await db.execute('SELECT type, created_at FROM Notifications');

        // Flat mapping for Power BI
        const powerBiPayload = {
            metadata: {
                generated_at: new Date(),
                connector_version: "1.0",
                dataset: "AI_GovScheme_Analytics"
            },
            data: {
                users: users,
                schemes: schemes,
                engagement: feedback,
                system_events: notifications
            }
        };

        res.json(powerBiPayload);
    } catch (error) {
        console.error('PowerBI Export Error:', error);
        res.status(500).json({ error: 'Failed to generate Power BI dataset' });
    }
});

module.exports = router;
