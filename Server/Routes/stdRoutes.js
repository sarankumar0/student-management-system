// routes/stdRoutes.js
const express = require('express');
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const  multer = require('multer');
// Import models
const CourseMaterial = require('../models/courseMaterial');
const Video = require('../models/video');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assignment = require('../models/Assignment')
const User=require('../models/User');
const { verifyToken } = require('./authRoutes');

const submissionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create a subdirectory for each assignment's submissions
        const assignmentId = req.params.assignmentId; // Get assignment ID from route params
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
             // Prevent upload if ID is invalid format
             return cb(new Error('Invalid assignment ID for upload destination.'), null);
         }
        // Create path like: Server/uploads/submissions/assignments/ASSIGNMENT_ID/
        const uploadPath = path.join(__dirname, '..', 'uploads', 'submissions', 'assignments', assignmentId);
        console.log(`[Multer] Ensuring destination path exists: ${uploadPath}`);
        // Ensure the directory exists (create recursively)
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Pass the calculated path to multer
    },
    filename: function (req, file, cb) {
        // Create a unique filename: studentId-timestamp-originalName
        const studentId = req.user?._id || 'unknown_student'; // Get student ID from middleware
        const timestamp = Date.now();
        // Sanitize original filename (replace spaces, etc.)
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]+/g, '_');
        const uniqueFilename = `${studentId}-${timestamp}-${safeOriginalName}`;
        console.log(`[Multer] Generating filename: ${uniqueFilename}`);
        cb(null, uniqueFilename);
    }
});

// File filter for PDFs only
const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept PDF
    } else {
        cb(new Error('Invalid file type. Only PDF submissions are allowed.'), false); // Reject other types
    }
};

// Multer instance for handling single PDF upload with field name 'submissionFile'
const uploadSubmission = multer({
    storage: submissionStorage,
    fileFilter: pdfFileFilter,
    limits: { fileSize: 1024 * 1024 * 15 } // Example: 15MB limit for submissions
}).single('submissionFile'); // Expecting file in 'submissionFile' field from frontend form

// --- End Multer Setup ---




router.get('/dashboard', verifyToken, async (req, res) => { // <-- USE MIDDLEWARE
    try {
        console.log("--- /api/student/dashboard ---");
        console.log("req.user received:", JSON.stringify(req.user, null, 2)); // Log the whole user object
        if (!req.user || !req.user.plan) {
            console.error(">>> ERROR: User or user.plan is MISSING in req.user!");
            console.error("User plan not found after auth middleware."); // Should not happen if middleware is correct
            return res.status(401).json({ message: 'Authorization error or incomplete user data.' });
        }
        const studentPlan = req.user.plan.toLowerCase();
        console.log(`Fetching dashboard data for student ${req.user.email}, plan: ${studentPlan}`);

        // Determine access filter based on plan (same logic as before)
        let materialAccessFilter = {};
        if (studentPlan === 'basic') {
            materialAccessFilter = { accessType: 'basic' };
        } else if (studentPlan === 'classic') {
            materialAccessFilter = { accessType: { $in: ['basic', 'classic'] } };
        } else if (studentPlan === 'pro') {
            materialAccessFilter = { accessType: { $in: ['basic', 'classic', 'pro'] } };
        } else {
            materialAccessFilter = { accessType: '__noaccess__' };
        }
        console.log(`Material Filter constructed:`, JSON.stringify(materialAccessFilter, null, 2));

         // --- SEPARATE Filter for QUIZZES (Exact Match) ---
         let quizAccessFilter = {};
         if (['basic', 'classic', 'pro'].includes(studentPlan)) {
              quizAccessFilter = { accessType: studentPlan }; // Only match exact plan
          } else {
              quizAccessFilter = { accessType: '__noaccess__' }; // No match if plan is invalid
          }
         console.log(`Quiz Filter constructed:`, JSON.stringify(quizAccessFilter, null, 2));
        // Fetch data concurrently (same logic as before)
        const [pdfResult, videoResult, quizResult] = await Promise.all([
            CourseMaterial.find(materialAccessFilter) // Use material filter
                 .select('title fileUrl accessType createdAt')
                 .sort({ createdAt: -1 }).lean(),
            Video.find(materialAccessFilter) // Use material filter
                 .select('title filePath accessType createdAt')
                 .sort({ createdAt: -1 }).lean(),
            Quiz.find(quizAccessFilter) // <-- Use quiz filter HERE
                 .select('title description accessType timeLimitMinutes _id questions createdAt') // Added createdAt for sorting
                 .sort({ createdAt: -1 }).lean() // Sort quizzes by newest too
        ]);
        
        // --- ADD LOGS to inspect results ---
        console.log("Result from CourseMaterial.find:", pdfResult);
        console.log("Result from Video.find:", videoResult);
        console.log("Result from Quiz.find:", quizResult); // <-- Check this log carefully
        
        // --- Safety Check and Assign ---
        // Ensure results are arrays, default to empty array if not
        const pdfs = Array.isArray(pdfResult) ? pdfResult : [];
        const videos = Array.isArray(videoResult) ? videoResult : [];
        const quizzes = Array.isArray(quizResult) ? quizResult : []; // <-- Ensure quizzes is an array
        
        console.log("Value of 'quizzes' variable before map:", quizzes);

        // Format response (same logic as before)
        const quizzesWithCount = quizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            accessType: quiz.accessType,
            timeLimitMinutes: quiz.timeLimitMinutes,
            questionCount: quiz.questions ? quiz.questions.length : 0,
            createdAt: quiz.createdAt
        }));
        
        console.log("Generated quizzesWithCount:", quizzesWithCount); // Log the result of map
        
        res.json({
            pdfs: pdfs, // Already ensured to be an array
            videos: videos, // Already ensured to be an array
            quizzes: quizzesWithCount
        });

    } catch (error) {
        // Error handling (same logic as before)
        console.error("Error fetching student dashboard data:", error);
        res.status(500).json({ message: 'Server error while fetching dashboard data.', error: error.message });
    }
});
router.get('/quizzes/:quizId/take', verifyToken, async (req, res) => {
    const { quizId } = req.params;
    // Safely access plan from req.user (added by verifyToken)
    const studentPlan = req.user?.plan?.toLowerCase();

    console.log(`--- Request: GET /api/student/quizzes/${quizId}/take ---`);
    console.log(`User: ${req.user?.email}, Plan: ${studentPlan}`);

    // 1. Validate Quiz ID format
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        console.log(`Validation Error: Invalid Quiz ID format: ${quizId}`);
        return res.status(400).json({ message: 'Invalid Quiz ID format.' });
    }

    // 2. Ensure student plan is valid (should be set by verifyToken)
    if (!studentPlan || !['basic', 'classic', 'pro'].includes(studentPlan)) {
        console.error(`Authorization Error: Invalid or missing plan ('${studentPlan}') for user ${req.user?.email}`);
        // Send 403 as it's an authorization issue based on user data
        return res.status(403).json({ message: 'Cannot determine eligibility: User plan invalid or missing.' });
    }

    try {
        // 3. Find the quiz by ID
        // Use .lean() for performance if we don't need Mongoose methods after fetching
        const quiz = await Quiz.findById(quizId).lean();

        // 4. Check if quiz exists
        if (!quiz) {
            console.log(`Not Found Error: Quiz with ID ${quizId} not found.`);
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        console.log(`Quiz Found: ${quiz.title}, Required Access: ${quiz.accessType}`);

        // 5. Check Eligibility: Quiz accessType must exactly match student's plan
        if (quiz.accessType.toLowerCase() !== studentPlan) {
            console.warn(`Authorization Denied: Student plan '${studentPlan}' does not match quiz accessType '${quiz.accessType}'.`);
            return res.status(403).json({ message: 'You are not eligible to take this quiz.' });
        }

        // 6. Prepare quiz data for the student (Remove answers)
        const questionsForStudent = quiz.questions.map(q => {
            // Ensure q is an object before destructuring (safety check)
            if (typeof q !== 'object' || q === null) return null;

            // Create a new object excluding the correctAnswerIndex
            // Also include the question's _id (generated by Mongoose for subdocuments)
            // which is essential for matching answers during submission.
            return {
                _id: q._id, // Include the question's unique ID
                questionText: q.questionText,
                options: q.options,
                points: q.points
                // correctAnswerIndex is omitted
            };
        }).filter(q => q !== null); // Filter out any nulls just in case

        // 7. Construct the response object
        const quizForTaking = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            accessType: quiz.accessType, // May not be needed by student, but can include
            timeLimitMinutes: quiz.timeLimitMinutes,
            questions: questionsForStudent // Array of questions without answers
        };

        console.log(`Eligibility OK. Sending quiz data (without answers) for quiz ${quizId} to student ${req.user.email}`);
        res.status(200).json(quizForTaking); // Send 200 OK with the data

    } catch (error) {
        console.error(`Server Error fetching quiz ${quizId} for student ${req.user?.email}:`, error);
        res.status(500).json({ message: 'Server error while preparing the quiz.', error: error.message });
    }
});

router.post('/quizzes/:quizId/submit', verifyToken, async (req, res) => {
    const { quizId } = req.params;
    const studentId = req.user?._id; // From verifyToken middleware
    const studentPlan = req.user?.plan?.toLowerCase();
    // Expect answers and optionally timeTakenSeconds from frontend
    const { answers, timeTakenSeconds } = req.body; // answers = [{ questionId: "...", selectedOptionIndex: N or null }]

    console.log(`--- Request: POST /api/student/quizzes/${quizId}/submit ---`);
    console.log(`Student: ${req.user?.email}, Plan: ${studentPlan}`);
    console.log(`Received Answers Payload:`, JSON.stringify(answers, null, 2));
    console.log(`Received Time Taken: ${timeTakenSeconds}`);

    // 1. --- Basic Validation ---
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ message: 'Invalid Quiz ID format.' });
    }
    if (!studentId) { // Should be caught by verifyToken, but double-check
        return res.status(401).json({ message: 'Authentication error: Student ID not found.' });
    }
    if (!Array.isArray(answers)) {
        return res.status(400).json({ message: 'Invalid submission format: Answers must be an array.' });
    }

    try {
        // 2. --- Check for Existing Submission (Single Attempt Logic) ---
        const existingSubmission = await QuizSubmission.findOne({ quiz: quizId, student: studentId });
        if (existingSubmission) {
            console.warn(`User ${studentId} already submitted quiz ${quizId}.`);
            return res.status(409).json({ message: 'You have already submitted this quiz.' }); // 409 Conflict
        }

        // 3. --- Fetch the Original Quiz with Correct Answers ---
        // Important: Do NOT use .lean() here if accessing subdocument methods/properties directly,
        // though converting to object later might be fine. Fetch full doc for safety.
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // 4. --- Verify Eligibility (Again, as a safeguard) ---
        if (quiz.accessType.toLowerCase() !== studentPlan) {
            return res.status(403).json({ message: 'You are not eligible for this quiz.' });
        }

        // 5. --- Score the Submission ---
        let calculatedScore = 0;
        let totalPossiblePoints = 0;
        const processedAnswers = []; // To store answers with isCorrect flag

        // Create a map of correct answers for quick lookup: { questionId: correctIndex }
        const correctAnswersMap = new Map();
        quiz.questions.forEach(q => {
            correctAnswersMap.set(q._id.toString(), q.correctAnswerIndex);
            totalPossiblePoints += (q.points || 1); // Sum up total points
        });

        // Iterate through the submitted answers
        answers.forEach(submittedAnswer => {
            const questionId = submittedAnswer.questionId;
            const studentChoice = submittedAnswer.selectedOptionIndex;
            const correctChoice = correctAnswersMap.get(questionId); // Get correct answer index from map

            let isCorrect = false;
            // Check if the question exists in the quiz and if the answer matches
            if (correctAnswersMap.has(questionId) && studentChoice !== null && studentChoice === correctChoice) {
                isCorrect = true;
                // Find the original question to get its points value
                const question = quiz.questions.find(q => q._id.toString() === questionId);
                calculatedScore += (question?.points || 1); // Add points for correct answer
            }

            // Add processed answer to the array for saving
            processedAnswers.push({
                questionId: questionId, // Ensure this is the ObjectId or string version Mongoose expects
                selectedOptionIndex: studentChoice,
                isCorrect: isCorrect // Store if the answer was correct
            });
        });
        console.log(`Scoring complete: Score=${calculatedScore}, Total Points=${totalPossiblePoints}`);

        // 6. --- Determine Pass/Fail Status ---
        let passed = null; // null if no passing score defined
        if (quiz.passingScorePercentage !== null && quiz.passingScorePercentage !== undefined && totalPossiblePoints > 0) {
            const scorePercentage = (calculatedScore / totalPossiblePoints) * 100;
            passed = scorePercentage >= quiz.passingScorePercentage;
            console.log(`Pass status check: Score%=${scorePercentage.toFixed(1)}, Passing%=${quiz.passingScorePercentage}, Passed=${passed}`);
        }

        // 7. --- Create and Save the Submission Document ---
        const newSubmission = new QuizSubmission({
            quiz: quizId,
            student: studentId,
            answers: processedAnswers, // Save the array with isCorrect flag
            score: calculatedScore,
            totalPossibleScore: totalPossiblePoints,
            passed: passed, // Save calculated pass status
            timeTakenSeconds: typeof timeTakenSeconds === 'number' ? timeTakenSeconds : undefined // Save time if provided
        });

        const savedSubmission = await newSubmission.save(); // This triggers the unique index check again
        console.log(`Quiz submission saved successfully: ${savedSubmission._id}`);

        // 8. --- Send Response ---
        res.status(201).json({ // 201 Created
            message: "Quiz submitted successfully!",
            submissionId: savedSubmission._id,
            score: savedSubmission.score,
            totalPossibleScore: savedSubmission.totalPossibleScore,
            passed: savedSubmission.passed,
            submittedAt: savedSubmission.submittedAt
            // Avoid sending back full answers/quiz again unless needed
        });

    } catch (error) {
        console.error(`Error submitting quiz ${quizId} for student ${studentId}:`, error);

        // Handle potential duplicate key error from unique index (quiz + student)
        if (error.code === 11000) {
            console.warn(`Duplicate submission attempt detected by DB index for quiz ${quizId}, student ${studentId}.`);
            return res.status(409).json({ message: 'You have already submitted this quiz.' }); // 409 Conflict
        }

        // Handle Mongoose validation errors (less likely here unless payload format wrong)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Submission validation failed", errors: messages });
        }

        // Generic server error
        res.status(500).json({ message: 'Server error while submitting quiz.', error: error.message });
    }
});

router.get('/submissions/quiz/:quizId', verifyToken, async (req, res) => {
    const { quizId } = req.params;
    const studentId = req.user?._id;

    console.log(`--- Request: GET /api/student/submissions/quiz/${quizId} ---`);
    console.log(`User: ${req.user?.email}, Student ID: ${studentId}`);

    // 1. Validate inputs
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        console.log(`Validation Error: Invalid Quiz ID format: ${quizId}`);
        return res.status(400).json({ 
            message: 'Invalid Quiz ID format.',
            details: { receivedQuizId: quizId }
        });
    }

    if (!studentId) {
        console.error("Authorization Error: Student ID missing from req.user");
        return res.status(401).json({ 
            message: 'Authentication error: Student ID not found.' 
        });
    }

    try {
        // 2. Find the submission
        console.log(`Searching for submission with quizId: ${quizId}, studentId: ${studentId}`);
        const submission = await QuizSubmission.findOne({
            quiz: quizId,
            student: studentId
        })
        .select('score totalPossibleScore submittedAt answers passed timeTakenSeconds quiz')
        .lean();

        if (!submission) {
            console.log(`No submission found for quiz ${quizId}, student ${studentId}.`);
            return res.status(200).json({ 
                submission: null, 
                quiz: null,
                message: 'No submission found for this quiz.'
            });
        }

        // 3. Validate submission's quiz reference
        if (!submission.quiz || !mongoose.Types.ObjectId.isValid(submission.quiz)) {
            console.error(`Data Integrity Error: Submission ${submission._id} has invalid quiz reference: ${submission.quiz}`);
            return res.status(500).json({ 
                message: "Data integrity issue: Invalid quiz reference in submission.",
                submissionId: submission._id
            });
        }

        // 4. Fetch the associated quiz
        console.log(`Fetching quiz details for submission ${submission._id}, quiz ID: ${submission.quiz}`);
        const quiz = await Quiz.findById(submission.quiz)
            .select('title description questions timeLimitMinutes passingScorePercentage')
            .lean();

        if (!quiz) {
            console.error(`Data Integrity Error: Quiz ${submission.quiz} not found for submission ${submission._id}`);
            return res.status(200).json({
                submission: submission,
                quiz: null,
                warning: "Original quiz details could not be found"
            });
        }

        // 5. Prepare and send successful response
        console.log(`Successfully retrieved submission and quiz data for review`);
        return res.status(200).json({
            submission: submission,
            quiz: quiz,
            message: "Submission and quiz data retrieved successfully"
        });

    } catch (error) {
        console.error(`Server Error: Failed to process submission review request:`, error);
        
        if (!res.headersSent) {
            return res.status(500).json({ 
                message: 'Server error while processing your request.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } else {
            console.error("Response already sent when error occurred:", error.message);
            // Consider implementing a proper error logging system here
        }
    }
});

router.get('/quizzes', verifyToken, async (req, res) => { // Note: Path is just '/quizzes' relative to '/api/student'
    const studentPlan = req.user?.plan?.toLowerCase();

    console.log(`--- Request: GET /api/student/quizzes ---`);
    console.log(`User: ${req.user?.email}, Plan: ${studentPlan}`);

    // Validate student plan
    if (!studentPlan || !['basic', 'classic', 'pro'].includes(studentPlan)) {
        console.error(`Authorization Error: Invalid or missing plan ('${studentPlan}') for user ${req.user?.email}`);
        return res.status(403).json({ message: 'Cannot determine eligibility: User plan invalid or missing.' });
    }

    try {
        // --- Filter for QUIZZES (Exact Match) ---
        const quizAccessFilter = { accessType: studentPlan }; // Only match exact plan
        console.log(`Quiz Filter constructed:`, JSON.stringify(quizAccessFilter, null, 2));

        // Fetch available Quizzes matching the filter
        const quizzes = await Quiz.find(quizAccessFilter)
            .select('title description accessType timeLimitMinutes _id questions createdAt') // Get fields needed for list display
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean(); // Use lean

        // Format response: Add question count
        const quizzesWithCount = quizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            accessType: quiz.accessType,
            timeLimitMinutes: quiz.timeLimitMinutes,
            questionCount: quiz.questions ? quiz.questions.length : 0,
            createdAt: quiz.createdAt
        }));

        console.log(`Found ${quizzesWithCount.length} available quizzes for plan ${studentPlan}`);
        // Send response containing ONLY the quizzes array
        res.status(200).json({ quizzes: quizzesWithCount }); // Send object with 'quizzes' key

    } catch (error) {
        console.error(`Server Error fetching available quizzes for student ${req.user?.email}:`, error);
        res.status(500).json({ message: 'Server error while fetching available quizzes.', error: error.message });
    }
});

router.get('/submissions',verifyToken,async(req,res)=>{
    const studentId=req.user?._id;
    console.log(`--- Request: GET /api/student/submissions ---`);
    console.log(`User: ${req.user?.email}`);
    if(!studentId){
        return res.status(401).json({ message: 'Authentication error: Student ID not found.' });
    }
    try{
        const submissions=await QuizSubmission.find({student:studentId})
        .populate({
            path:'quiz',
            model:'Quiz',
            select:'title accessType'
        }).select('quiz score totalPossibleScore passed submittedAt createdAt')
        .sort({submittedAt:-1});
        console.log(`Found ${submissions.length} submissions for student ${studentId}`);
        res.status(200).json({ submissions: submissions || [] })
    } catch (error) {
        console.error(`Server Error fetching submissions for student ${studentId}:`, error);
        res.status(500).json({ message: 'Server error while retrieving submission history.', error: error.message });
    }
});

// --- Add other student-specific routes later ---
// POST /api/quizzes/:quizId/submit       (will also use verifyToken)
// GET /api/student/submissions         (will also use verifyToken)
router.get('/assignments', verifyToken, async (req, res) => {
    // 1. Extract student info from verified token
    const studentId = req.user?._id;
    const studentPlan = req.user?.plan?.toLowerCase();

    console.log(`--- Request: GET /api/student/assignments ---`);
    console.log(`User: ${req.user?.email}, Plan: ${studentPlan}, ID: ${studentId}`);

    // 2. Validate student ID and Plan
    if (!studentId || !studentPlan || !['basic', 'classic', 'pro'].includes(studentPlan)) {
        console.error(`Authorization Error: Invalid/missing plan ('${studentPlan}') or student ID for user ${req.user?.email}`);
        // Use 403 Forbidden as it's an eligibility/authorization issue based on token data
        return res.status(403).json({ message: 'Authorization error: Cannot determine eligibility due to invalid user data.' });
    }

    try {
        // 3. Construct the MongoDB filter based on the student's plan
        let assignmentAccessFilter = {};
        if (studentPlan === 'basic') {
            assignmentAccessFilter = { accessType: 'basic' };
        } else if (studentPlan === 'classic') {
            assignmentAccessFilter = { accessType: { $in: ['basic', 'classic'] } };
        } else { // Pro plan
            assignmentAccessFilter = { accessType: { $in: ['basic', 'classic', 'pro'] } };
        }
        console.log(`Assignment Filter constructed:`, JSON.stringify(assignmentAccessFilter));

        // 4. Fetch eligible Assignment documents
        const assignments = await Assignment.find(assignmentAccessFilter)
            .select('title description dueDate fileUrl accessType createdAt') // Select fields needed by UI
            .sort({ dueDate: 1 }) // Sort by nearest due date first
            .lean(); // Use .lean() for performance boost with plain JS objects

        console.log(`Found ${assignments.length} potentially visible assignments for student plan '${studentPlan}'.`);

        // If no assignments found, return early
        if (assignments.length === 0) {
            return res.status(200).json({ assignments: [] });
        }

        // 5. Check submission status for *these specific* assignments by *this* student
        const assignmentIds = assignments.map(a => a._id); // Get IDs of fetched assignments

        const studentSubmissions = await AssignmentSubmission.find({
                student: studentId,
                assignment: { $in: assignmentIds } // Efficiently query only relevant submissions
            })
            .select('assignment submittedAt fileUrl isReviewed marks adminComments') // Select only needed fields
            .lean(); // Use .lean()
// *** TEMPORARY LOGGING ***
console.log(`DEBUG: Fetched submissions for student ${studentId}:`, JSON.stringify(studentSubmissions, null, 2));
        // Create a lookup Map for quick access to submission details by assignment ID
        const submissionMap = new Map();
        studentSubmissions.forEach(sub => {
            // submissionMap.set(sub.assignment.toString(), {
            //     submittedAt: sub.submittedAt,
            //     submissionFileUrl: sub.fileUrl // Renaming for clarity vs assignment fileUrl
            // });
            submissionMap.set(sub.assignment.toString(), sub);
        });
       
        console.log(`Found ${submissionMap.size} submissions by student ${studentId} for these assignments.`);

        // 6. Combine assignment data with submission status
        const assignmentsWithStatus = assignments.map(assignment => {
            const assignmentIdStr = assignment._id.toString();
            const submissionDetails = submissionMap.get(assignmentIdStr);
            return {
                ...assignment, // Spread the original assignment fields
                hasSubmitted: !!submissionDetails, // True if details exist in the map
                submissionDetails: submissionDetails ? { // << Check if these fields are selected from DB
                    submittedAt: submissionDetails.submittedAt,
                    submissionFileUrl: submissionDetails.submissionFileUrl,
                    // *** ENSURE THESE ARE INCLUDED ***
                    isReviewed: submissionDetails.isReviewed,
                    marks: submissionDetails.marks,
                    adminComments: submissionDetails.adminComments
                } : null // Attach details if submitted, else null
            };
        });

        // 7. Send the final response
        res.status(200).json({ assignments: assignmentsWithStatus });

    } catch (error) {
        console.error(`Server Error fetching assignments for student ${studentId}:`, error);
        res.status(500).json({ message: 'Server error while retrieving assignments.', error: error.message });
    }
});

router.post('/assignments/:assignmentId/submit', verifyToken, (req, res) => {
    // Use multer middleware FIRST to handle file upload
    uploadSubmission(req, res, async (uploadError) => {
        // --- Handle Multer Errors (Invalid file type, size limit, etc.) ---
        if (uploadError) {
            console.error("[Submit Assignment] Multer upload error:", uploadError);
            if (uploadError instanceof multer.MulterError) {
                 // Specific multer errors (e.g., file size limit)
                return res.status(400).json({ message: `File upload error: ${uploadError.message}` });
            } else if (uploadError.message.includes('Invalid file type')) {
                // Custom error from file filter
                 return res.status(400).json({ message: uploadError.message });
             }
             // Other unexpected upload errors
            return res.status(500).json({ message: 'Error uploading file.', error: uploadError.message });
        }

        // --- Multer finished (or no file was expected/uploaded) ---
        const { assignmentId } = req.params;
        const studentId = req.user?._id;
        const studentPlan = req.user?.plan?.toLowerCase();

        console.log(`--- Request: POST /api/student/assignments/${assignmentId}/submit ---`);
        console.log(`Student: ${req.user?.email}, Plan: ${studentPlan}`);

        // --- Check if a file was actually uploaded ---
        if (!req.file) {
            console.log("[Submit Assignment] No file submitted.");
            return res.status(400).json({ message: 'No submission file was uploaded. Please select a PDF.' });
        }
        console.log("[Submit Assignment] File received:", req.file.filename);


        // --- Validation ---
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            fs.unlink(req.file.path, err => {}); // Clean up uploaded file
            return res.status(400).json({ message: 'Invalid Assignment ID format.' });
        }
        if (!studentId) {
            fs.unlink(req.file.path, err => {}); // Clean up uploaded file
            return res.status(401).json({ message: 'Authentication error: Student ID not found.' });
        }

        try {
            // --- Check for Existing Submission ---
            const existingSubmission = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId });
            if (existingSubmission) {
                console.warn(`User ${studentId} already submitted assignment ${assignmentId}.`);
                fs.unlink(req.file.path, err => {}); // Clean up uploaded file
                return res.status(409).json({ message: 'You have already submitted this assignment.' });
            }

            // --- Check Assignment Eligibility ---
            const assignment = await Assignment.findById(assignmentId).select('accessType');
            if (!assignment) {
                fs.unlink(req.file.path, err => {}); // Clean up uploaded file
                return res.status(404).json({ message: 'Assignment not found.' });
            }
            // Check if student plan allows access (using cascading logic like materials)
             let isEligible = false;
             if (studentPlan === assignment.accessType.toLowerCase()) isEligible = true;
             if (studentPlan === 'classic' && assignment.accessType.toLowerCase() === 'basic') isEligible = true;
             if (studentPlan === 'pro') isEligible = true; // Pro sees all

             if (!isEligible) {
                 console.warn(`Eligibility check failed: Plan '${studentPlan}' vs Assignment Access '${assignment.accessType}'`);
                 fs.unlink(req.file.path, err => {}); // Clean up uploaded file
                 return res.status(403).json({ message: 'You are not eligible for this assignment.' });
             }

            // --- Create and Save Submission Record ---
            const relativeFilePath = `/uploads/submissions/assignments/${assignmentId}/${req.file.filename}`;

            const newSubmission = new AssignmentSubmission({
                assignment: assignmentId,
                student: studentId,
                fileUrl: relativeFilePath, // Store the relative path
                // isReviewed and marks default to false/null from schema
            });

            const savedSubmission = await newSubmission.save();
            console.log(`Assignment submission saved successfully: ${savedSubmission._id}`);

            res.status(201).json({
                message: "Assignment submitted successfully!",
                submissionId: savedSubmission._id,
                fileUrl: savedSubmission.fileUrl, // Send back the path
                submittedAt: savedSubmission.submittedAt
            });

        } catch (error) {
            console.error(`Error saving submission for assignment ${assignmentId}, student ${studentId}:`, error);
            // Clean up uploaded file if DB save fails
            fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting uploaded file after DB error:", err); });

            // Handle potential duplicate key error from index (should have been caught earlier, but safeguard)
            if (error.code === 11000) {
                return res.status(409).json({ message: 'Submission already exists (database index).' });
            }
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: "Submission validation failed", errors: Object.values(error.errors).map(e => e.message) });
            }
            res.status(500).json({ message: 'Server error saving submission.', error: error.message });
        }
    }); // End of uploadSubmission callback
}); // End of router.post


module.exports = router;