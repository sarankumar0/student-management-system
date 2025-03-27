const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  plan: { type: String, required: true, unique: true },    // basic, classic, pro
  lastId: { type: Number, required: true, default: 1000 }, // Start from 1000
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
