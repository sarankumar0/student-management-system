const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/File");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.post("/api/upload", upload.single("file"), async (req, res) => {
  const { batch } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newFile = new File({
      fileName: req.file.filename,
      batch: batch,
      filePath: `/uploads/${req.file.filename}`,
    });

    await newFile.save();
    res.status(200).json({ message: `File uploaded to ${batch} batch`, file: newFile });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
});

module.exports = router;
