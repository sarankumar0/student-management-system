const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rawPassword: { type: String },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  plan: { type: String, enum: ["basic", "classic", "pro"], default: null }, 
  registrationNumber: { type: String, unique: true, required: true }, 
  batch:{type: String},
  batchStartDate:{type:Date},
  lastLogin: { type: Date },
  profileImg: { type: String, default: "/uploads/default-profile.png" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
});{timeStamps:true}

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
