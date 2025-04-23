const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, // Path or URL to content
    required: true
  },
  contentType: {
    type: String,
    enum: ['pdf', 'video', 'text', 'quiz'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  requiredAccessLevel: {
    type: String,
    enum: ['basic', 'classic', 'pro'],
    default: 'basic'
  }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', ChapterSchema);