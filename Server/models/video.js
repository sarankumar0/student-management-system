const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: String, 
  filePath: { type: String, required: true }, 
  accessType: { 
    type: String,
    required: true,
    enum: ["basic", "classic", "pro"], 
    index: true 
  },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);