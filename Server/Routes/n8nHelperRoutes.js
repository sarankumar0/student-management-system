// Routes/n8nHelperRoutes.js (New File)
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model
const dotenv = require('dotenv');

dotenv.config();

// --- Simple API Key Auth for n8n (Store in .env) ---
const N8N_INTERNAL_API_KEY = process.env.N8N_INTERNAL_API_KEY;

const authenticateN8n = (req, res, next) => {
    const apiKey = req.headers['x-n8n-api-key']; // n8n can send a custom header
    if (!N8N_INTERNAL_API_KEY) {
        console.error("N8N_INTERNAL_API_KEY not configured on server.");
        return res.status(500).json({ message: "Internal server configuration error." });
    }
    if (apiKey && apiKey === N8N_INTERNAL_API_KEY) {
        next();
    } else {
        console.warn("Unauthorized attempt to access n8n helper route.");
        res.status(401).json({ message: 'Unauthorized' });
    }
};
// --- End Auth ---


/**
 * @route   GET /api/internal/eligible-students-for-course
 * @desc    Get student contact info (email, phone) for a given course accessType.
 *          Intended for internal use by n8n.
 * @access  Protected by API Key
 */
router.get('/eligible-students-for-course',  async (req, res) => {
    const { courseAccessType } = req.query; // n8n will send this from webhook data

    console.log(`--- n8n Request: GET /eligible-students-for-course for accessType: ${courseAccessType} ---`);

    if (!courseAccessType || !['basic', 'classic', 'pro'].includes(courseAccessType.toLowerCase())) {
        return res.status(400).json({ message: "Invalid or missing courseAccessType query parameter." });
    }

    const targetPlan = courseAccessType.toLowerCase();
    let studentPlanFilter = {};

    // Logic for who gets notified for which course plan
    if (targetPlan === 'basic') {
        studentPlanFilter = { plan: { $in: ['basic', 'classic', 'pro'] } };
    } else if (targetPlan === 'classic') {
        studentPlanFilter = { plan: { $in: ['classic', 'pro'] } };
    } else if (targetPlan === 'pro') {
        studentPlanFilter = { plan: 'pro' };
    }

    try {
        const eligibleStudents = await User.find({ role: 'user', ...studentPlanFilter })
                                          .select('email name plan phoneNumber'); // Include phoneNumber if you have it

        console.log(`Found ${eligibleStudents.length} eligible students for notification.`);
        res.status(200).json({ students: eligibleStudents });

    } catch (error) {
        console.error("Error fetching students for n8n notification:", error);
        res.status(500).json({ message: 'Server error fetching eligible students.', error: error.message });
    }
});

module.exports = router;