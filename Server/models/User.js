const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./Student");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rawPassword: { type: String },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  plan: { type: String, enum: ["basic", "classic", "pro"], default: null },
  
  studentId: { 
    type: String, 
    unique: true, 
    required: function() { 
      return this.role === "user";  // ✅ Required only if plan exists (Basic, Classic, Pro)
    } 
  },

  batch: { type: String },
  batchStartDate: { type: Date },
  lastLogin: { type: Date },
  profileImg: { type: String, default: "/uploads/default-profile.png" },
}, { timestamps: true });



// Hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
