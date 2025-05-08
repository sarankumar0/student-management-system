// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");

// const studentRoutes = require("./Routes/studentRoutes");
// const connectDB = require("./db");
// const cookieParser = require("cookie-parser");
// // const authRoutes = require("./Routes/authRoutes"); 
// const { authRouter, verifyToken } = require('./Routes/authRoutes');
// const stdRoutes = require('./Routes/stdRoutes');
// const batchRoutes = require("./Routes/batchRoutes");
// const reportRoutes = require("./Routes/reportRoutes"); 
// const deletedLogRoutes = require("./Routes/deletedLogRoutes");
// // const uploadRoutes = require("./Routes/uploadRoutes");
// const path = require("path");
// const CourseMaterial = require("./models/courseMaterial"); 
// const Video = require("./models/video");
// const adminStatsRoutes = require('./Routes/statsRoute');
// const pdfRoutes = require("./Routes/uploadRoutes"); 
// const videoRoutes = require("./Routes/videoRoutes"); 
// const quizRoutes = require('./Routes/quizRoutes');


// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:5174"],
//   credentials: true, 
//   allowedHeaders: ["Content-Type", "Authorization"],
//   methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
// }));

// app.use(express.json());
// app.use(cookieParser());
// // Routes
// // app.use("/api/auth", authRoutes);
// app.use("/api/students", studentRoutes); 
// app.use("/api/reports", batchRoutes);
// app.use("/api", reportRoutes);
// app.use("/api/deletedLogs", deletedLogRoutes);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/api/pdfs",pdfRoutes);
// app.use("/api/videos",videoRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/auth', authRouter); // Mount auth routes
// app.use('/api/student', stdRoutes);
// app.use('/api/stats', adminStatsRoutes);
// const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // ✅ Use env variable

// // 🔹 **Verify Token Route**
// app.get("/api/auth/verify", (req, res) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(403).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "Invalid token" });
//     }
//     res.status(200).json({ user: decoded });
//   });
// });
// // 🔹 **Test Cookie Route**
// app.get("/test-cookie", (req, res) => {
//   res.cookie("testCookie", "Hello from Server!", { httpOnly: true });
//   res.send("Cookie has been set!");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js (Your version + Model Loading Fix)

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Keep if used by direct routes below
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");

// --- Database Connection ---
dotenv.config();
connectDB(); // Connect to DB first

// --- Load Mongoose Models (AFTER connectDB, BEFORE Routes) ---
console.log("Loading Mongoose models...");
require('./models/User');
require('./models/Quiz');
require('./models/QuizSubmission');
require('./models/LoginHistory');
require('./models/courseMaterial');
require('./models/video');
require('./models/Counter');
require('./models/Student'); // Assuming you have this and studentRoutes uses it
//require('./models/Batch'); // Assuming you have this and batchRoutes uses it
require('./models/DeletedLog'); // Assuming you have this and deletedLogRoutes uses it
// Add require('./models/Report') if reportRoutes uses it
require('./models/Assignment');
require("./models/AI_courses");
// require("./models/AI_courses");
console.log("Mongoose models registered.");
// --- End Model Loading ---


// --- Require Route Files (Keep ALL your requires) ---
const studentRoutes = require("./Routes/studentRoutes"); // Keep
const { authRouter, verifyToken } = require('./Routes/authRoutes'); // Keep
const stdRoutes = require('./Routes/stdRoutes'); // Keep
const batchRoutes = require("./Routes/batchRoutes"); // Keep
const reportRoutes = require("./Routes/reportRoutes"); // Keep
const deletedLogRoutes = require("./Routes/deletedLogRoutes"); // Keep
const adminStatsRoutes = require('./Routes/statsRoute'); // Keep
const pdfRoutes = require("./Routes/uploadRoutes"); // Keep
const videoRoutes = require("./Routes/videoRoutes"); // Keep
const quizRoutes = require('./Routes/quizRoutes'); // Keep
const assignmentRoutes = require('./Routes/assignmentRoutes'); 
const aiGenerationRoutes = require('./Routes/aiGenerationRoutes'); // <-- Import new routes
const courseAdminRoutes = require('./Routes/courseRoutes');
const  aiCourseRoutes=require('./Routes/aiCourseRoutes');

// --- Keep requires that might be used directly in THIS file (less common) ---
const CourseMaterial = require("./models/courseMaterial"); // Keep if used below
const Video = require("./models/video"); // Keep if used below
const authRoutes = require("./Routes/authRoutes");
const n8nHelperRoutes = require('./Routes/n8nHelperRoutes');

// --- Initialize Express App ---
const app = express();

// --- Core Middleware ---
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", 'https://saran10.app.n8n.cloud'],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Static files


// --- Mount ALL Your Routes ---
console.log("Mounting API routes...");
app.use('/api/student', stdRoutes);         // Student specific data routes
app.use('/api/auth',authRouter);           // Authentication routes
app.use('/api/quizzes', quizRoutes);        // Quiz admin routes (Needs protection)
app.use('/api/stats', adminStatsRoutes);      // Admin statistics routes (Needs protection)
app.use("/api/pdfs", pdfRoutes);            // PDF/Material routes (Needs protection)
app.use("/api/videos", videoRoutes);          // Video routes (Needs protection)
// Keep ALL your other route mountings
app.use("/api/students", studentRoutes);    // Keep
app.use("/api/reports", batchRoutes);       // Keep (Needs protection?)
app.use("/api", reportRoutes);              // Keep (Needs protection?) - Be cautious with broad '/'
app.use("/api/deletedLogs", deletedLogRoutes); // Keep (Needs protection?)
app.use('/api/assignments', assignmentRoutes); 
app.use('/api/ai', aiGenerationRoutes); // <-- Mount AI generation routes
app.use('/api/courses', courseAdminRoutes); // <-- Mount course admin routes
app.use('/api/ai-courses', aiCourseRoutes);
app.use('/api/internal', n8nHelperRoutes);
// --- Keep Your Direct Route Definitions ---
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Keep

// Keep this if you still use it somewhere, even though authRouter has one
app.get("/api/auth/verify", (req, res) => {
  console.warn("Direct /api/auth/verify in server.js hit - consider removing if handled by authRouter");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    // Careful: This only returns token payload, not full user from DB like middleware does
    res.status(200).json({ user: decoded });
  });
});

// Keep this if used
app.get("/test-cookie", (req, res) => {
  res.cookie("testCookie", "Hello from Server!", { httpOnly: true });
  res.send("Cookie has been set!");
});
// --- End Direct Routes ---


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));