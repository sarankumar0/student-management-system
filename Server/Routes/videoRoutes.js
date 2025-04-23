// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const Video = require('../models/video'); // Import the Video model

// GET videos based on batch parameter (determining accessType filter)
router.get('/:batch', async (req, res) => {
  try {
    const { batch } = req.params;
    if (!batch) {
      return res.status(400).json({ message: "Batch parameter is required." });
    }

    const batchLower = batch.toLowerCase();
    let filter = {};

    // --- Filtering logic based on accessType ---
    if (batchLower === "basic") {
      filter = { accessType: "basic" };
    } else if (batchLower === "classic") {
      filter = { accessType: { $in: ["basic", "classic"] } };
    } else if (batchLower === "pro") { // Be explicit for "pro"
      filter = { accessType: { $in: ["basic", "classic", "pro"] } };
    } else {
      // Handle invalid batch parameter
      console.warn(`Invalid batch parameter received for videos: ${batch}`);
      return res.json([]); // Return empty array for unknown batch
    }
    // --- End Filtering Logic ---

    console.log(`Fetching videos with filter:`, filter); // Log the filter

    // Find videos matching the filter, sort by newest first
    const videos = await Video.find(filter).sort({ uploadedAt: -1 });
    res.json(videos);

  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ message: "Error fetching videos", error: err.message });
  }
});

module.exports = router;