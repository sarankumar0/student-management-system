// models/Quiz.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for individual questions within a quiz
const questionSchema = new Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required.'],
        trim: true,
    },
    options: {
        type: [String], // Array of possible answer strings
        required: [true, 'At least two options are required.'],
        validate: [
            {
                validator: function (arr) {
                    return arr && arr.length >= 2; // Ensure at least 2 options
                },
                message: 'Each question must have at least two options.'
            },
            {
                validator: function (arr) {
                    // Ensure no empty strings in options
                    return arr.every(option => option && option.trim().length > 0);
                },
                message: 'Options cannot be empty.'
            }
        ]
    },
    correctAnswerIndex: {
        type: Number,
        required: [true, 'A correct answer index must be specified.'],
        validate: {
            validator: function (value) {
                // 'this' refers to the question document being validated
                // Ensure index is within the bounds of the options array
                return Number.isInteger(value) && value >= 0 && value < this.options.length;
            },
            message: props => `Correct answer index (${props.value}) is out of bounds for the provided options.`
        }
    },
    points: { // Optional: points per question
        type: Number,
        default: 1,
        min: [0, 'Points cannot be negative.']
    }
}, { _id: true }); // Ensure subdocuments get their own _id

// Main Quiz Schema
const quizSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    accessType: { // Determines which batch can access this quiz
        type: String,
        required: [true, 'Access type (batch) is required.'],
        enum: {
            values: ['basic', 'classic', 'pro'],
            message: 'Access type must be basic, classic, or pro.'
        },
        index: true // Index for faster querying by batch
    },
    questions: {
        type: [questionSchema], // Array of embedded question documents
        required: true,
        validate: [
            {
                 validator: function (arr) { return arr && arr.length > 0; },
                 message: 'A quiz must have at least one question.'
            }
        ]
    },
    // Assuming you have User model for admins/instructors
    // createdBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User', // Replace 'User' with your actual User model name if different
    //     // required: true // Make required once auth is implemented
    // },
    timeLimitMinutes: {
        type: Number,
        min: [1, 'Time limit must be at least 1 minute.'],
        required: [true, 'Time Limit (Minutes) is required.'] // <-- ADD required
    },
    passingScorePercentage: {
        type: Number,
        min: 0,
        max: 100,
        required: [true, 'Passing Score Percentage is required.'] // <-- ADD required
    }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Quiz', quizSchema);