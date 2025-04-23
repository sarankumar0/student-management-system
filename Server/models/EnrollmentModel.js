const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedChapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  certificate: {
    issued: { 
      type: Boolean, 
      default: false 
    },
    issuedAt: Date
  },
  accessLevel: {
    type: String,
    enum: ['basic', 'classic', 'pro'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);