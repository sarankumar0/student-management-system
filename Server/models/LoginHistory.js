// models/LoginHistory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model
        required: true,
        index: true // Index for potential future lookups per user
    },
    loginAt: {
        type: Date,
        default: Date.now,
        index: true // Index for efficient date-based aggregation
    }
    // You could add more fields later if needed (e.g., IP address, user agent)
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);