// models/AssignmentSubmission.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for storing individual answers within a submission (Not needed for file-based assignment)

// Main Schema for storing a student's assignment submission
const assignmentSubmissionSchema = new Schema({
    assignment: { // Reference to the Assignment document
        type: Schema.Types.ObjectId,
        ref: 'Assignment', // Use the correct model name 'Assignment'
        required: true,
        index: true
    },
    student: { // Reference to the User document (student)
        type: Schema.Types.ObjectId,
        ref: 'User', // Use 'User' as per your user model name
        required: true,
        index: true
    },
    submittedAt: { // Timestamp for when the submission occurred
        type: Date,
        default: Date.now
    },
    fileUrl: { // Stores the path to the submitted PDF
        type: String,
        required: [true, 'A file submission is required.'],
        trim: true
    },
    isReviewed: { // Has the admin reviewed this?
        type: Boolean,
        default: false,
        index: true
    },
    marks: { // Marks given by admin
        type: Number,
        default: null // Default to null, can be 0
    },
    adminComments: { // Optional feedback from admin
        type: String,
        trim: true
    }
    // timeTakenSeconds isn't usually relevant for assignment submissions
}, { timestamps: true }); // Adds createdAt, updatedAt

// --- Add Compound Index for Single-Attempt Check ---
// Ensure a student can submit a specific assignment only once
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);