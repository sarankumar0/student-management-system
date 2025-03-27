const express = require("express");
const router = express.Router();
const DeletedLog = require("../models/DeletedLog");


// ✅ Get all deleted logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await DeletedLog.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs", error: err });
  }
});

// ✅ Add a new deleted log (optional route if needed)
router.post("/logs", async (req, res) => {
  try {
    const newLog = new DeletedLog(req.body);
    await newLog.save();
    res.status(201).json({ message: "Log added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding log", error: err });
  }
});

module.exports = router;
