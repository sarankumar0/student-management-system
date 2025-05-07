// models/CourseProgress.js (New File)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseProgressSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to your main User model holding student info
        required: true,
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course', // Refers to the AI_Course model (use 'Course' if that's the registered name)
        required: true,
    },
    completedLessons: [{ // Array of Lesson ObjectIds marked as complete
        type: Schema.Types.ObjectId,
        // No 'ref' needed here usually, as lesson IDs are specific to the course context
    }],
    // Optional: Store the ID of the last lesson the student accessed within this course
    lastAccessedLesson: {
        type: Schema.Types.ObjectId,
        default: null
    }
    // We can calculate percentage completion on the fly when fetching data,
    // or store it here if needed (but it can become stale). Calculating is often better.

}, { timestamps: true }); // Adds createdAt, updatedAt

// Unique index to ensure only one progress document per student/course combination
courseProgressSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for potentially finding all progress for a student quickly
courseProgressSchema.index({ student: 1 });

module.exports = mongoose.model('AICourseProgress', courseProgressSchema);