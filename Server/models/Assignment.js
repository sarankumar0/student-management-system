// models/Assignment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Assignment title is required.'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters.'] // Optional limit
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required.']
    },
    // Optional: Link to a specific course or subject if you create those models later
    // courseSubject: {
    //     type: String // Or: type: Schema.Types.ObjectId, ref: 'Subject'
    // },
    fileUrl: {
        type: String,
        trim: true,
        default: null // Default to null if no file uploaded
    },
    accessType: { // Controls visibility based on student plan
        type: String,
        required: [true, 'Access type (batch) is required.'],
        enum: {
            values: ['basic', 'classic', 'pro'],
            message: 'Access type must be basic, classic, or pro.'
        },
        index: true // Index for faster querying by plan
    },
}, { timestamps: true }); 

assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);