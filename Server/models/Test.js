const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  numQuestions: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  batch: {
    type: String,
    enum: ['basic', 'classic', 'pro'],
    required: true,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
      },
    },
  ],
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
