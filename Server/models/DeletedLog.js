const mongoose = require("mongoose");

const deletedLogSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    department: { type: String },
    course: { type: String },
    yearOfStudy: { type: Number },
    deletedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeletedLog", deletedLogSchema);
