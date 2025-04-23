// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz'); // Import the Quiz model
const mongoose = require('mongoose');
const { verifyToken,isAdmin } = require('./authRoutes');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');
// const { isAdmin } = require('./statsRoute');
// --- Placeholder for Authentication Middleware ---
// You'll need to add middleware here later to ensure only admins can access these routes.
// const { isAdmin, protect } = require('../middleware/authMiddleware');
// Example usage: router.post('/', protect, isAdmin, async (req, res) => { ... });
// For now, we'll proceed without explicit auth checks.

router.post('/', async (req, res) => {
    // Destructure expected fields from the request body
    const { title, description, accessType, questions, timeLimitMinutes, passingScorePercentage } = req.body;

    // Basic validation (Mongoose schema handles more detailed validation)
    if (!title || !accessType || !questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Missing required fields: title, accessType, and at least one question are required.' });
    }

    try {
        // Create a new quiz instance
        const newQuiz = new Quiz({
            title,
            description,
            accessType,
            questions, // Expecting an array of question objects [{questionText, options, correctAnswerIndex, points?}]
            timeLimitMinutes,
            passingScorePercentage,
            // createdBy: req.user.id // Add this once auth middleware provides req.user
        });
        const savedQuiz = await newQuiz.save();
        res.status(201).json(savedQuiz);

    } catch (error) {
        console.error("Error creating quiz:", error);

        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            // Extract user-friendly error messages
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }

        // Generic server error
        res.status(500).json({ message: 'Server error while creating quiz.', error: error.message });
    }
});



router.get('/', async (req, res) => {
  const { accessType } = req.query; // Check for accessType query parameter

  try {
      const filter = {};
      // If accessType query param exists and is valid, add it to the filter
      if (accessType && ['basic', 'classic', 'pro'].includes(accessType.toLowerCase())) {
          filter.accessType = accessType.toLowerCase();
      }
      // Else, the empty filter {} gets all quizzes

      console.log("Fetching quizzes with filter:", filter);

      // Find quizzes based on the filter
      // Select fields useful for the list view - excluding the full questions array initially for performance
      const quizzes = await Quiz.find(filter)
          .select('title description accessType createdAt questions') // Include questions to get length later if needed, or count documents
          .sort({ createdAt: -1 }); // Sort by newest first

      // You could transform the data here to add question count if needed,
      // or let the frontend calculate it from questions.length
      const quizzesWithCount = quizzes.map(quiz => ({
           _id: quiz._id,
           title: quiz.title,
           description: quiz.description,
           accessType: quiz.accessType,
           createdAt: quiz.createdAt,
           questionCount: quiz.questions ? quiz.questions.length : 0 // Add question count
       }));


      res.json(quizzesWithCount); // Send the list back

  } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: 'Server error while fetching quizzes.', error: error.message });
  }
});




// Inside routes/quizRoutes.js -> router.get('/:quizId', ...)
router.get('/:quizId', async (req, res) => {
    const { quizId } = req.params;

    // Keep the validation check
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        console.log(`Validation failed for ID: ${quizId}`); // Optional: Keep a log for failures
        return res.status(400).json({ message: 'Invalid Quiz ID format.' });
    }

    try {
        // Find the quiz by its ID
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        res.json(quiz);

    } catch (error) {
        console.error(`Error fetching quiz ${quizId}:`, error);
        res.status(500).json({ message: 'Server error while fetching quiz details.', error: error.message });
    }
});

router.delete('/:quizId', async (req, res) => {
    const { quizId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ message: 'Invalid Quiz ID format.' });
    }

    try {
        // Find the quiz by ID and remove it
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

        // If quiz wasn't found
        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // **Decision Point: What about submissions?**
        // Option A (Recommended): Keep submissions. They provide historical data.
        // Option B (If required): Delete related submissions (more complex).
        // await QuizSubmission.deleteMany({ quiz: quizId });
        // console.log(`Deleted submissions for quiz ${quizId}`);

        console.log(`Quiz deleted successfully: ${quizId}`);
        res.json({ message: `Quiz "${deletedQuiz.title}" deleted successfully.` }); // Send success message

    } catch (error) {
        console.error(`Error deleting quiz ${quizId}:`, error);
        res.status(500).json({ message: 'Server error while deleting quiz.', error: error.message });
    }
});
router.patch('/:quizId', async (req, res) => { // Using PATCH
    const { quizId } = req.params;
    // Only destructure fields allowed for update in this simple version
    const { title, description, accessType, timeLimitMinutes, passingScorePercentage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ message: 'Invalid Quiz ID format.' });
    }

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Update allowed fields if they exist in the request body
        if (title !== undefined) quiz.title = title;
        if (description !== undefined) quiz.description = description;
        if (accessType !== undefined) quiz.accessType = accessType;
        if (timeLimitMinutes !== undefined) quiz.timeLimitMinutes = timeLimitMinutes;
        if (passingScorePercentage !== undefined) quiz.passingScorePercentage = passingScorePercentage;
        // *** We are IGNORING req.body.questions here ***

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);

    } catch (error) {
        console.error(`Error updating quiz ${quizId}:`, error);
         if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: 'Server error while updating quiz.', error: error.message });
    }
});

router.get('/:quizId/submissions', verifyToken, isAdmin, async (req, res) => {
    const { quizId } = req.params;

    console.log(`--- Request: GET /api/quizzes/${quizId}/submissions ---`);
    console.log(`Admin User: ${req.user?.email}`); // Assuming verifyToken adds req.user

    // 1. Validate Quiz ID
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ message: 'Invalid Quiz ID format.' });
    }

    try {
        // 2. Optional: Check if the quiz actually exists first
        const quizExists = await Quiz.findById(quizId).select('_id'); // Lightweight check
        if (!quizExists) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // 3. Find all submissions for this quiz ID
        // Populate student details (e.g., name, email, studentId/registrationNumber)
        const submissions = await QuizSubmission.find({ quiz: quizId })
            .populate({
                path: 'student', // Field name in QuizSubmission schema linking to User
                model: User,   // The name the User model was registered with
                select: 'name email studentId registrationNumber' // Fields to include from User model (adjust as needed)
            })
            .select('student score totalPossibleScore passed submittedAt timeTakenSeconds') // Select fields from submission
            .sort({ submittedAt: -1 }); // Show most recent submissions first

        console.log(`Found ${submissions.length} submissions for quiz ${quizId}`);

        // 4. Send the results
        res.status(200).json(submissions); // Send array of submission documents

    } catch (error) {
        console.error(`Error fetching submissions for quiz ${quizId}:`, error);
        res.status(500).json({ message: 'Server error while fetching quiz submissions.', error: error.message });
    }
});



// --- Add other quiz routes later (GET, PATCH, DELETE) ---
// GET /api/quizzes
// GET /api/quizzes/:id
// PATCH /api/quizzes/:id
// DELETE /api/quizzes/:id
// GET /api/quizzes/:id/submissions

module.exports = router;