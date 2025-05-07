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
const AICourse = require('../models/AI_courses');
const AICourseProgress = require('../models/AICourseProgress');

let TimetableEntry, Event, Internship;
try { TimetableEntry = require('../models/TimetableEntry'); } catch (e) { console.log("TimetableEntry model not found, skipping."); }
try { Event = require('../models/Event'); } catch (e) { console.log("Event model not found, skipping."); }
try { Internship = require('../models/Internship'); } catch (e) { console.log("Internship model not found, skipping."); }
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
router.get('/dashboard', verifyToken, async (req, res) => {
    const studentId = req.user?._id;
    const studentPlan = req.user?.plan?.toLowerCase();
    const studentName = req.user?.name;

    console.log(`--- Request: GET /api/student/dashboard ---`);
    console.log(`User: ${req.user?.email}, Plan: ${studentPlan}`);

    if (!studentPlan || !['basic', 'classic', 'pro'].includes(studentPlan)) {
        return res.status(403).json({ message: 'Invalid user data for dashboard.' });
    }

    try {
        // --- Filters based on plan ---
        let courseMaterialFilter = { status: 'published' }; // Base filter for published content
        if (studentPlan === 'basic') { courseMaterialFilter.accessType = 'basic'; }
        else if (studentPlan === 'classic') { courseMaterialFilter.accessType = { $in: ['basic', 'classic'] }; }
        else if (studentPlan === 'pro') { courseMaterialFilter.accessType = { $in: ['basic', 'classic', 'pro'] }; }

        const quizFilter = { accessType: studentPlan, status: 'published' }; // Exact match for quiz, assume status field exists? Add if needed.
        const assignmentFilter = { ...courseMaterialFilter }; // Assignments use cascading access
        const timetableFilter = { ...courseMaterialFilter }; // Assume Timetable uses cascading access? Adjust if not.
        const eventFilter = { ...courseMaterialFilter }; // Assume Events use cascading access?
        const internshipFilter = { ...courseMaterialFilter }; // Assume Internships use cascading access?


        // --- Prepare Date Filters ---
        const today = new Date();
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);
        today.setHours(0, 0, 0, 0); // Start of today

        weekLater.setHours(23, 59, 59, 999); // End of 7 days later

        const upcomingAssignmentFilter = { ...assignmentFilter, dueDate: { $gte: today, $lt: weekLater } };
         const upcomingTimetableFilter = TimetableEntry ? { ...timetableFilter, date: { $gte: today } } : null; // Only if model exists


        // --- Fetch ALL data concurrently ---
        const promises = [
            AICourse.find(courseMaterialFilter).select('title thumbnailUrl createdAt modules').sort({ createdAt: -1 }).lean(), // 0: AI Courses
            Assignment.find(assignmentFilter).select('title dueDate').lean(), // 1: All Assignments (for count)
            Quiz.find(quizFilter).select('_id').lean(), // 2: All Quizzes (for count)
            QuizSubmission.countDocuments({ student: studentId }), // 3: Count completed quizzes
            AICourseProgress.find({ student: studentId }).select('course completedLessons').lean(), // 4: All Course Progress
            Assignment.find(upcomingAssignmentFilter).select('title dueDate _id').sort({ dueDate: 1 }).limit(5).lean(), // 5: Upcoming Assignments
        ];

        // Conditionally add fetches for optional models
        if (TimetableEntry && upcomingTimetableFilter) {
            promises.push(TimetableEntry.find(upcomingTimetableFilter).select('title subject date time _id').sort({ date: 1, time: 1 }).limit(3).lean()); // 6: Upcoming Timetable
        } else { promises.push(Promise.resolve([])); } // Placeholder resolved promise

        if (Event) {
            promises.push(Event.find(eventFilter).select('title date _id').sort({ date: -1 }).limit(3).lean()); // 7: Recent Events
        } else { promises.push(Promise.resolve([])); }

        if (Internship) {
            promises.push(Internship.find(internshipFilter).select('title company _id').sort({ createdAt: -1 }).limit(3).lean()); // 8: Recent Internships
        } else { promises.push(Promise.resolve([])); }


        // --- Execute all fetches ---
        const results = await Promise.all(promises);

        // --- Process Results ---
        const aiCourses = results[0] || [];
        const allAssignments = results[1] || [];
        const availableQuizzes = results[2] || [];
        const completedQuizzesCount = results[3] || 0;
        const courseProgressList = results[4] || [];
        const upcomingAssignments = results[5] || [];
        const upcomingTimetable = results[6] || [];
        const recentEvents = results[7] || [];
        const recentInternships = results[8] || [];

        // Calculate Progress Stats
        let completedLessonsTotal = 0;
        courseProgressList.forEach(p => { completedLessonsTotal += p.completedLessons?.length || 0; });

        let totalEnrolledLessons = 0;
        aiCourses.forEach(course => {
             course.modules?.forEach(module => {
                 totalEnrolledLessons += module.lessons?.length || 0;
             });
         });

        // Extract recent courses for display
        const recentAICourses = aiCourses.slice(0, 3).map(c => ({ // Take first 3 (newest)
            _id: c._id, title: c.title, thumbnailUrl: c.thumbnailUrl
        }));

        // --- Construct Final Response Object ---
        const dashboardData = {
            welcomeName: studentName || 'Student',
            plan: studentPlan,
            counts: {
                aiCoursesAvailable: aiCourses.length,
                assignmentsDueTotal: allAssignments.length,
                quizzesAvailable: availableQuizzes.length,
                completedQuizzes: completedQuizzesCount,
                // Add counts for timetable/events/internships if needed
            },
            progress: { // Data for progress chart
                completedLessonsTotal: completedLessonsTotal,
                totalEnrolledLessons: totalEnrolledLessons,
            },
            upcoming: { // Data for upcoming section
                assignments: upcomingAssignments,
                timetable: upcomingTimetable,
            },
            recent: { // Data for recent section
                aiCourses: recentAICourses,
                events: recentEvents,
                internships: recentInternships,
            }
            // Add lastAccessed later if needed
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error(`Server Error fetching dashboard for student ${req.user?.email}:`, error);
        res.status(500).json({ message: 'Server error while retrieving dashboard data.', error: error.message });
    }
}); 


router.get('/course-materials', verifyToken, async (req, res) => { 
    const studentPlan = req.user?.plan?.toLowerCase();
    console.log(`--- Request: GET /api/student/course-materials ---`);
    console.log(`User: ${req.user?.email}, Plan: ${studentPlan}`);
    if (!studentPlan || !['basic', 'classic', 'pro'].includes(studentPlan) ) {
        return res.status(403).json({ message: 'Invalid user data for dashboard.' });
    }
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
}); 

//For Ai Related
//Courses


router.get('/ai-courses', verifyToken, async (req, res) => {
    console.log(">>> HIT: /api/student/ai-courses Handler <<<");
    const studentId = req.user?._id;
    const studentPlan = req.user?.plan?.toLowerCase();
    console.log(`--- Request: GET /api/student/ai-courses ---`);
    console.log(`User: ${req.user?.email}, Plan: ${studentPlan}`);

    // Validate student plan
    if (!studentPlan || !['basic', 'classic', 'pro'].includes(studentPlan)) {
        console.error(`Authorization Error: Invalid or missing plan ('${studentPlan}') for user ${req.user?.email}`);
        return res.status(403).json({ message: 'Cannot determine eligibility: User plan invalid or missing.' });
    }
    if (!studentId) {
       console.error('student Id doesnt exist:401');
    }

    try {
        // --- Filter for AI Courses (Cascading Logic) ---
        let courseAccessFilter = {};
        if (studentPlan === 'basic') {
            courseAccessFilter = { accessType: 'basic' };
        } else if (studentPlan === 'classic') {
            courseAccessFilter = { accessType: { $in: ['basic', 'classic'] } };
        } else if (studentPlan === 'pro') {
            // Pro gets everything
            courseAccessFilter = { accessType: { $in: ['basic', 'classic', 'pro'] } };
        }
        // Add filter to only show 'published' courses
        courseAccessFilter.status = 'published'; // <-- IMPORTANT: Only show published courses
        // --------------------------------------------

        console.log(`AI Course Filter constructed:`, JSON.stringify(courseAccessFilter, null, 2));

        // 1. Find Published AI_Course documents matching the filter for the student's plan
        // Fetch fields needed for display AND the full modules/lessons for counting total lessons
        const availableCourses = await AICourse.find(courseAccessFilter)
            .select('title description accessType thumbnailUrl createdAt modules') // Get modules/lessons needed for count
            .sort({ createdAt: -1 })
            .lean(); // Use lean as we're primarily reading and transforming

        console.log(`Found ${availableCourses.length} published AI courses for student plan ${studentPlan} and lower.`);

        if (availableCourses.length === 0) {
             // No courses available, return empty array
             return res.status(200).json({ courses: [] });
         }

        // 2. Get Course IDs for progress lookup
        const courseIds = availableCourses.map(course => course._id);

        // 3. Fetch Progress Records for this student and these courses
        console.log(`Fetching progress for student ${studentId} for course IDs:`, courseIds);
        const progressRecords = await AICourseProgress.find({
            student: studentId,
            course: { $in: courseIds } // Find progress only for the courses being listed
        })
        .select('course completedLessons') // Select only needed fields
        .lean();

        // Create a Map for easy lookup: { courseIdString => completedLessonCount }
        const progressMap = new Map();
        progressRecords.forEach(record => {
            progressMap.set(record.course.toString(), record.completedLessons?.length || 0);
        });
        console.log("Progress Map created:", progressMap);

        // 4. Combine Course Data with Progress Percentage
        const coursesWithProgress = availableCourses.map(course => {
            // Calculate total lessons for this course
            let totalLessons = 0;
            course.modules?.forEach(module => {
                totalLessons += module.lessons?.length || 0;
            });

            // Get completed count from map
            const completedCount = progressMap.get(course._id.toString()) || 0;

            // Calculate percentage
            const completionPercentage = (totalLessons > 0)
                ? Math.round((completedCount / totalLessons) * 100)
                : 0; // Avoid division by zero if course has no lessons

            console.log(`Course: ${course.title}, Total Lessons: ${totalLessons}, Completed: ${completedCount}, Percentage: ${completionPercentage}%`);

            // Return object for the frontend list
            return {
                _id: course._id,
                title: course.title,
                description: course.description,
                accessType: course.accessType,
                thumbnailUrl: course.thumbnailUrl,
                createdAt: course.createdAt,
                moduleCount: course.modules ? course.modules.length : 0,
                completionPercentage: completionPercentage // <-- Add percentage
            };
        });

        // 5. Send the combined data
        res.status(200).json({ courses: coursesWithProgress });

    } catch (error) {
        console.error(`Server Error fetching AI courses for student ${req.user?.email}:`, error);
        res.status(500).json({ message: 'Server error while retrieving AI courses.', error: error.message });
    }
});
router.get('/:id', verifyToken, async (req, res) => { 
    console.log(`>>> HIT: /api/ai-courses/:id Handler with id=${req.params.id} <<<`);
    const { id } = req.params;
    const userRole = req.user?.role;
    const studentPlan = req.user?.plan?.toLowerCase();

    console.log(`--- Request: GET /api/ai-courses/${id} ---`);
    console.log(`User: ${req.user?.email}, Role: ${userRole}, Plan: ${studentPlan}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Course ID format.' });
    }

    try {
        // Fetch full course
        const course = await Course.findById(id).lean(); // Use lean if just reading

        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // --- Authorization Check ---
        let isAllowed = false;
        if (userRole === 'admin') {
            isAllowed = true; // Admins can see any course
            console.log("Access granted: User is admin.");
        } else if (userRole === 'user' && studentPlan) {
            // Check student plan against course accessType (cascading)
             const courseAccess = course.accessType.toLowerCase();
             if (course.status !== 'published') {
                 console.log("Access denied: Course is not published.");
             } else if (courseAccess === studentPlan) {
                 isAllowed = true;
             } else if (studentPlan === 'classic' && courseAccess === 'basic') {
                 isAllowed = true;
             } else if (studentPlan === 'pro' && (courseAccess === 'basic' || courseAccess === 'classic')) {
                 isAllowed = true;
             }
              console.log(`Access check: Student plan '${studentPlan}', Course access '${courseAccess}', Published: ${course.status === 'published'}, Allowed: ${isAllowed}`);
        } else {
             // Unknown role or student missing plan
             console.log("Access denied: Unknown role or missing plan.");
         }

        if (!isAllowed) {
            return res.status(403).json({ message: 'You are not authorized to access this course.' });
        }
        // --- End Authorization Check ---


        // If allowed, send the full course object
        // For students, we don't need to filter anything out here (no answers like quizzes)
        console.log("Access granted. Sending course details.");
        res.status(200).json(course);

    } catch (error) {
        console.error(`Error fetching course ${id}:`, error);
        res.status(500).json({ message: 'Server error fetching course details.', error: error.message });
    }
});

router.get('/course-progress/:courseId', verifyToken, async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user?._id;

    console.log(`--- Request: GET /api/student/course-progress/${courseId} ---`);
    console.log(`User: ${req.user?.email}`);

    if (!mongoose.Types.ObjectId.isValid(courseId))  return res.status(400).json({ message: 'Invalid Course or Lesson ID format.' });
    if (!studentId) return res.status(401).json({ message: 'Invalid StudentID format.' });
    try {
        // Find progress, select only completed lessons array
        const progress = await AICourseProgress.findOne({ student: studentId, course: courseId })
            .select('completedLessons lastAccessedLesson') // Select relevant fields
            .lean();

        if (progress) {
            console.log("Found course progress:", progress);
            res.status(200).json({ progress: progress });
        } else {
            console.log("No progress found for this course/student.");
            // Return default structure if no progress yet
            res.status(200).json({ progress: { completedLessons: [], lastAccessedLesson: null } });
        }
    } catch (error) {
        console.error(`Server Error fetching course progress for course ${courseId}, student ${studentId}:`, error);
        res.status(500).json({ message: 'Server error fetching course progress.', error: error.message });
    }
});


// --- !!! NEW ROUTE: POST /api/student/courses/progress !!! ---

router.post('/courses/progress', verifyToken, async (req, res) => {
    const studentId = req.user?._id;
    const { courseId, lessonId } = req.body; // Expect courseId and lessonId in body

    console.log(`--- Request: POST /api/student/courses/progress ---`);
    console.log(`User: ${req.user?.email}, Course: ${courseId}, Lesson: ${lessonId}`);

    // Validation
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({ message: 'Invalid Course or Lesson ID format.' });
    }
     if (!studentId)  return res.status(401).json({ message: 'Invalid Student ID format.' });

    try {
        // Optional: Verify the lesson actually belongs to the course? (more robust)
        // const course = await AICourse.findOne({ _id: courseId, "modules.lessons._id": lessonId });
        // if (!course) return res.status(404).json({ message: 'Lesson not found within the specified course.' });

        // Find existing progress or create if not found, then update
        const updatedProgress = await AICourseProgress.findOneAndUpdate(
            { student: studentId, course: courseId }, // Find criteria
            {
                // Update operations
                $addToSet: { completedLessons: lessonId }, // Add lessonId only if not already present
                $set: { lastAccessedLesson: lessonId } // Update last accessed
            },
            {
                new: true,    // Return the updated document
                upsert: true, // Create the document if it doesn't exist
                runValidators: true, // Run schema validation
                setDefaultsOnInsert: true // Apply schema defaults on creation
            }
        ).select('completedLessons lastAccessedLesson').lean(); // Select updated fields

        console.log("Course progress updated/created:", updatedProgress);
        res.status(200).json({
            message: "Progress updated successfully.",
            progress: updatedProgress // Send back updated progress state
        });

    } catch (error) {
         console.error(`Server Error updating course progress for course ${courseId}, lesson ${lessonId}, student ${studentId}:`, error);
         res.status(500).json({ message: 'Server error updating course progress.', error: error.message });
    }
});


module.exports = router;