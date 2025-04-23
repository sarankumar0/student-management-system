//routes/statsRoute.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken,isAdmin } = require('./authRoutes');
const LoginHistory = require('../models/LoginHistory');



 router.get("/count-by-plan", verifyToken, isAdmin, async (req, res) => { // Protect route
    try {
        const plans = ["basic", "classic", "pro"];
        const counts = await User.aggregate([
            { $match: { role: "user", plan: { $in: plans } } }, // Ensure role is 'user'
            { $group: { _id: "$plan", count: { $sum: 1 } } }
        ]);
  
        // Initialize result with all plans having 0 count
        const result = { basic: 0, classic: 0, pro: 0 };
        counts.forEach(plan => {
             if (result.hasOwnProperty(plan._id)) { // Check if _id is a valid plan
                result[plan._id] = plan.count;
             }
        });
  
        console.log("📊 Sending count-by-plan data:", result);
        res.status(200).json(result);
    } catch (error) {
         console.error("❌ Error fetching count-by-plan:", error);
        res.status(500).json({ message: "Error fetching user count", error: error.message });
    }
  });
  
  router.get("/login-stats", verifyToken, isAdmin, async (req, res) => {
    try {
        console.log("Fetching unique daily login stats from LoginHistory...");
  
        // --- AGGREGATE FROM LoginHistory COLLECTION ---
        const uniqueDailyLogins = await LoginHistory.aggregate([
           
            {
                // Group by the date part of the loginAt timestamp
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$loginAt", timezone: "UTC" } }, // Group by YYYY-MM-DD (use appropriate timezone)
                    // Add each unique userId to a set for that day
                    uniqueUserIds: { $addToSet: "$userId" }
                }
            },
            {
                // Project to get the count (size of the unique user set)
                $project: {
                    _id: 0, // Exclude the default _id grouping field
                    date: "$_id", // Rename _id to date
                    count: { $size: "$uniqueUserIds" } // Calculate the count of unique users
                }
            },
            {
                 // Sort by date ascending
                $sort: { date: 1 }
            }
        ]);
        console.log("Sending unique daily login stats data:", uniqueDailyLogins);
        res.status(200).json(uniqueDailyLogins); // Send data in [{date, count}] format
  
    } catch (error) {
        console.error("Error fetching unique daily login stats:", error);
        res.status(500).json({ message: "Error fetching login stats", error: error.message });
    }
  });
  

 

module.exports = router;