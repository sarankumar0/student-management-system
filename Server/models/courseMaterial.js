const mongoose = require("mongoose");

const CourseMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    // batch: { type: String, required: true },
    accessType: { type: String, required: true, enum: ["basic", "classic", "pro"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseMaterial", CourseMaterialSchema);
