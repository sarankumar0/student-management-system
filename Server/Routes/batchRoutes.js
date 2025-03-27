const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/",async(req,res)=>{ 
    try{
        console.log("🔍 /api/batches route hit... Fetching batches");
        const batches = await User.aggregate([
            { $match: { role: "user" } }, // Only students
            { $group: { _id: "$plan", students: { $push: "$$ROOT" } } }, // Group by batch
            { $sort: { _id: 1 } } // Sort by batch name
          ]);
      
        if (!batches.length) {
            return res.status(404).json({ message: "No active batches found." });
          }
        console.log("✅ Batches fetched successfully:", batches);
        res.status(200).json({batches});

    }catch(error){
        console.error("🚨 Error in /api/batches:", error.message);
        res.status(500).json({ message: "Error fetching batches", error: error.message })
    }
    console.log("🔍 /api/batches endpoint hit");
    // console.log("Batches data:", batches);
});

module.exports=router;
