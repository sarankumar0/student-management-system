// Routes/assignmentRoutes.js (New File)

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const User= require('../models/User');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const AssignmentSubmission=require('../models/AssignmentSubmission');
const { verifyToken, isAdmin } = require('./authRoutes'); 
const multer = require('multer');
const assignmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments'); 
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')); 
    }
});
const assignmentFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true); 
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'), false); // Reject file
    }
};

const uploadAssignmentFile = multer({
    storage: assignmentStorage,
    fileFilter: assignmentFileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // Example: 10MB limit
});
router.post('/', verifyToken, isAdmin, uploadAssignmentFile.single('assignmentFile'), async (req, res) => {
    // 'assignmentFile' is the field name expected from the frontend form for the file
    console.log("--- POST /api/assignments ---");
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file); // Check if file was uploaded

    const { title, description, dueDate, accessType } = req.body;

    // Basic Validation (Schema handles more)
    if (!title || !dueDate || !accessType) {
        if (req.file) { fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting uploaded file after validation fail:", err); }); }
        return res.status(400).json({ message: 'Missing required fields: title, dueDate, accessType.' });
    }

    try {
        const newAssignmentData = {
            title,
            description,
            dueDate: new Date(dueDate), // Ensure it's saved as a Date object
            accessType,
        };
        if (req.file) {
            newAssignmentData.fileUrl = `/uploads/assignments/${req.file.filename}`;
            console.log("File uploaded, saving path:", newAssignmentData.fileUrl);
        }
        const newAssignment = new Assignment(newAssignmentData);
        const savedAssignment = await newAssignment.save();
        console.log("Assignment created successfully:", savedAssignment._id);
        res.status(201).json(savedAssignment);
    } catch (error) {
        console.error("Error creating assignment:", error);
        // Clean up uploaded file if DB save fails
        if (req.file) { fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting uploaded file after DB error:", err); }); }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: 'Server error creating assignment.', error: error.message });
    }
});
router.get('/', verifyToken, isAdmin, async (req, res) => {
    console.log("--- GET /api/assignments ---");
    try {
        const assignments = await Assignment.find()
            .sort({ dueDate: 1 }); 
        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: 'Server error fetching assignments.', error: error.message });
    }
});
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`--- GET /api/assignments/${id} ---`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Assignment ID format.' });
    }
    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        res.status(200).json(assignment);
    } catch (error) {
        console.error(`Error fetching assignment ${id}:`, error);
        res.status(500).json({ message: 'Server error fetching assignment.', error: error.message });
    }
});
// Note: Handling file replacement on PATCH can be complex.
// This example updates text fields; file replacement requires extra logic.
router.patch('/:id', verifyToken, isAdmin, uploadAssignmentFile.single('assignmentFile'), async (req, res) => {
    const { id } = req.params;
    console.log(`--- PATCH /api/assignments/${id} ---`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        if (req.file) { fs.unlink(req.file.path, err => {}); } // Clean up if ID invalid
        return res.status(400).json({ message: 'Invalid Assignment ID format.' });
    }

    const { title, description, dueDate, accessType } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (accessType !== undefined) updateData.accessType = accessType;

    try {
        const assignmentToUpdate = await Assignment.findById(id);
        if (!assignmentToUpdate) {
            if (req.file) { fs.unlink(req.file.path, err => {}); } // Clean up
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        // File Handling: If a new file is uploaded, delete the old one and update path
        let oldFilePath = null;
        if (req.file) {
            updateData.fileUrl = `/uploads/assignments/${req.file.filename}`;
            oldFilePath = assignmentToUpdate.fileUrl ? path.join(__dirname, '..', assignmentToUpdate.fileUrl) : null;
            console.log("New file uploaded for update, will replace:", assignmentToUpdate.fileUrl);
        }
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id,
            { $set: updateData }, 
            { new: true, runValidators: true, context: 'query' } 
        );
        if (updatedAssignment && oldFilePath) {
             if (fs.existsSync(oldFilePath)) {
                 fs.unlink(oldFilePath, (err) => {
                     if (err) console.error("Error deleting old assignment file during update:", err);
                     else console.log("Old assignment file deleted:", oldFilePath);
                 });
             }
         }

        console.log("Assignment updated successfully:", updatedAssignment._id);
        res.status(200).json(updatedAssignment);

    } catch (error) {
        console.error(`Error updating assignment ${id}:`, error);
        // Clean up newly uploaded file if DB update failed
        if (req.file) { fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting newly uploaded file after update error:", err); }); }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: 'Server error updating assignment.', error: error.message });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`--- DELETE /api/assignments/${id} ---`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Assignment ID format.' });
    }

    try {
        const deletedAssignment = await Assignment.findByIdAndDelete(id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        if (deletedAssignment.fileUrl) {
            const filePath = path.join(__dirname, '..', deletedAssignment.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting assignment file:", err);
                    else console.log("Deleted assignment file:", filePath);
                });
            }
        }
        console.log("Assignment deleted successfully:", id);
        res.status(200).json({ message: `Assignment "${deletedAssignment.title}" deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting assignment ${id}:`, error);
        res.status(500).json({ message: 'Server error deleting assignment.', error: error.message });
    }
});

router.get('/:assignmentId/submissions-review', verifyToken, isAdmin, async (req, res) => {
    const { assignmentId } = req.params;
    console.log(`--- GET /api/assignments/${assignmentId}/submissions-review ---`);

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({ message: 'Invalid Assignment ID format.' });
    }

    try {
        // 1. Fetch the specific assignment
        const assignment = await Assignment.findById(assignmentId).lean();
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        console.log(`Found assignment: ${assignment.title}, AccessType: ${assignment.accessType}`);

        // 2. Determine eligible student plans based on assignment's accessType
        let eligiblePlans = [];
        const assignmentAccess = assignment.accessType.toLowerCase();

        if (assignmentAccess === 'basic') {
            eligiblePlans = ['basic', 'classic', 'pro'];
        } else if (assignmentAccess === 'classic') {
            eligiblePlans = ['classic', 'pro'];
        } else if (assignmentAccess === 'pro') {
            eligiblePlans = ['pro'];
            console.log(`--- DEBUG: Calculated eligiblePlans:`, eligiblePlans);
        } else {
             console.warn(`Unknown accessType on assignment ${assignmentId}: ${assignment.accessType}`);
             eligiblePlans = []; // Or handle as error? For now, no one is eligible
        }

        console.log(`Eligible student plans for this assignment: ${eligiblePlans.join(', ')}`);
        const queryCriteria = {
            plan: { $in: eligiblePlans },
            role: 'user'
        };
        console.log(`--- DEBUG: User query criteria:`, JSON.stringify(queryCriteria));

        // 3. Fetch all students with the eligible plans
        // Ensure you select necessary fields like name, plan etc.
        const eligibleStudents = await User.find({
                plan: { $in: eligiblePlans },
                role: 'user' // Make sure you only get students
            })
            .select('_id name email plan') // Adjust fields as needed from your User model
            .lean();

        console.log(`Found ${eligibleStudents.length} eligible students.`);

        if (eligibleStudents.length === 0) {
             return res.status(200).json({
                 assignmentDetails: assignment,
                 submissionsData: [] // No eligible students
             });
        }

        // 4. Fetch all submissions for THIS assignment
        const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
            .select('student submittedAt fileUrl isReviewed marks adminComments _id') // Select all relevant fields
            .lean();

        // 5. Create a Map of submissions keyed by student ID for quick lookup
        const submissionMap = new Map();
        submissions.forEach(sub => {
            // Ensure student ID is stored as a string key
            submissionMap.set(sub.student.toString(), sub);
        });
        console.log(`Found ${submissionMap.size} submissions for this assignment.`);

        // 6. Combine student data with submission data
        const submissionsReviewData = eligibleStudents.map(student => {
            const studentIdStr = student._id.toString();
            const submission = submissionMap.get(studentIdStr);

            return {
                studentId: student._id,
                studentName: student.name || student.email, // Use name, fallback to email
                studentPlan: student.plan,
                hasSubmitted: !!submission,
                submissionDetails: submission ? {
                    submissionId: submission._id, // Include submission ID for PATCH later
                    submittedAt: submission.submittedAt,
                    fileUrl: submission.fileUrl,
                    isReviewed: submission.isReviewed,
                    marks: submission.marks,
                    adminComments: submission.adminComments
                } : null
            };
        });

        // 7. Return combined data
        res.status(200).json({
            assignmentDetails: assignment, // Send basic assignment info too
            submissionsData: submissionsReviewData
        });

    } catch (error) {
        console.error(`Error fetching submission review data for assignment ${assignmentId}:`, error);
        res.status(500).json({ message: 'Server error fetching submission review data.', error: error.message });
    }
});

router.patch('/submissions/:submissionId/review', verifyToken, isAdmin, async (req, res) => {
    const { submissionId } = req.params;
    const { marks, adminComments } = req.body; // Extract marks and comments from request body

    console.log(`--- PATCH /api/assignments/submissions/${submissionId}/review ---`);
    console.log("Request Body:", req.body);

    // 1. Validate Submission ID
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
        return res.status(400).json({ message: 'Invalid Submission ID format.' });
    }

    // 2. Validate Input Data (Basic)
    // Allow null or number for marks, allow null or string for comments
    if (marks !== undefined && marks !== null && typeof marks !== 'number') {
        return res.status(400).json({ message: 'Invalid data type for marks. Must be a number or null.' });
    }
     if (adminComments !== undefined && adminComments !== null && typeof adminComments !== 'string') {
         return res.status(400).json({ message: 'Invalid data type for comments. Must be a string or null.' });
     }

    try {
        // 3. Prepare Update Data
        const updateData = {
            isReviewed: true, // Mark as reviewed when saving
            // Only include fields if they are present in the request body to allow partial updates
            // Allow setting back to null explicitly
        };
        if (marks !== undefined) {
            updateData.marks = marks; // Can be a number or null
        }
        if (adminComments !== undefined) {
             // Trim comments if it's a string, otherwise allow null
            updateData.adminComments = typeof adminComments === 'string' ? adminComments.trim() : adminComments;
        }

        console.log("Update Data Prepared:", updateData);

        // 4. Find and Update the Submission
        const updatedSubmission = await AssignmentSubmission.findByIdAndUpdate(
            submissionId,
            { $set: updateData }, // Use $set to update specified fields
            { new: true, runValidators: true } // Return updated doc, run schema validators
        );

        // 5. Check if Submission was Found and Updated
        if (!updatedSubmission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        console.log("Submission updated successfully:", updatedSubmission);

        // 6. Return Success Response
        res.status(200).json({
            message: 'Submission reviewed successfully.',
            submission: updatedSubmission // Return the updated submission details
        });

    } catch (error) {
        console.error(`Error updating review for submission ${submissionId}:`, error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: "Validation failed", errors: Object.values(error.errors).map(e => e.message) });
        }
        res.status(500).json({ message: 'Server error updating submission review.', error: error.message });
    }
});



module.exports = router; 