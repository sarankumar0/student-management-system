const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  marks: { type: Number, required: true },
  enrollmentDate: { type: Date, required: true },
  department: { type: String, required: true },
  course: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  prevQualification: { type: String, required: true },
  prevMarks: { type: Number, required: true },
  permAddress: { type: String, required: true },
  currAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  guardianContact: { type: String, required: true },
  parentOccupation: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  category: { type: String, required: true },
  medicalCondition: { type: String },
  // aadhar: { type: String, required: true }, // Store file path or URL
  // image: { type: String, required: true }, // Store file path or URL
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
