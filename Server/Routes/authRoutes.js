// routes/authRoutes.js (Cleaned Up)
const express = require("express");
const User = require("../models/User"); // Assuming User model holds login details and 'plan'
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require('mongoose');
const Counter = require("../models/Counter"); // Needed for registration helpers
const nodemailer = require("nodemailer"); // Needed for registration helpers
const LoginHistory = require("../models/LoginHistory");
// const { authRouter, verifyToken } = require('./authRoutes');
// Keep your secret key (ideally load from .env)
const SECRET_KEY = process.env.JWT_SECRET || "your_temp_secret_key";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "EDITH";


const getNextAdminId = async () => {
  try {
    let counter = await Counter.findOne({ plan: "admin" });
    if (!counter) {
      counter = new Counter({ plan: "admin", lastId: 0 });
      await counter.save();
    }
    counter.lastId++;
    await counter.save();
    return `Ad${String(counter.lastId).padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating admin ID:", error);
    throw new Error("Failed to generate admin ID");
  }
};
const getNextStudentId = async (plan) => {
  try {
      // Validate plan type and set prefix
      const prefixMap = {
          basic: 'Ba',
          classic: 'Cl',
          pro: 'Pr'
      };
      const prefix = prefixMap[plan.toLowerCase()] || 'Ba'; // Default to 'Pr' if invalid plan

      // Find latest student with transaction-safe query
      const latestStudent = await User.findOne({ plan })
          .sort({ createdAt: -1 }) // More reliable than sorting by studentId
          .select('studentId')
          .lean();

      let sequenceNumber = 1001; // Default starting number

      if (latestStudent?.studentId) {
          console.log(`Latest student ID found: ${latestStudent.studentId}`);
          
          // Extract and validate numeric part
          const numPart = latestStudent.studentId.replace(/^\D+/g, '');
          const currentNum = parseInt(numPart, 10);
          
          if (!isNaN(currentNum) && numPart.length >= 4) {
              sequenceNumber = currentNum + 1;
              console.log(`Next sequence number: ${sequenceNumber}`);
          } else {
              console.warn(`Invalid numeric part in ID: ${latestStudent.studentId}. Using default sequence.`);
          }
      }

      // Format the new ID with leading zeros if needed
      const regNumber = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;
      console.log(`Generated new student ID: ${regNumber}`);
      return { regNumber };

  } catch (error) {
      console.error("Error in getNextStudentId:", error);
      throw new Error(`ID generation failed for plan ${plan}`);
  }
};

const sendWelcomeEmail = async (email, name, plan, studentId) => { 
       const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
          user:"project.oxford001@gmail.com",
          pass:"rlww noaz kxhg qque",
        }
      });
      let planMessage = "";
      if (plan === "basic") {
        planMessage = "You are on the Basic Plan. You have access to limited features.";
      } else if (plan === "classic") {
        planMessage = "You are on the Classic Plan. Enjoy additional features for a better experience!";
      } else if (plan === "pro") {
        planMessage = "Welcome to the Pro Plan! You have access to all premium features!";
      }
      const mailOptions = {
        from:"project.oxford001@gmail.com",
        to: email,
        subject: "🎉 Welcome to Our Platform!",
        html: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #4CAF50; text-align: center;">🎉 Welcome, ${name}!</h2>
        <p>We're thrilled to have you onboard at <strong>Oxford Academy</strong>.</p>
        <p><strong>Your Registration ID:</strong> <span style="color: #4CAF50; font-weight: bold;">${studentId}</span></p>
        <p>${planMessage}</p>
        <p>Enjoy your learning journey with us! If you have any questions, feel free to reach out.</p>
        <p style="text-align: center; margin-top: 20px;">
          Best Regards,<br/>
          <strong>Team Oxford</strong>
        </p>
      </div>`,
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Welcome email sent to ${email}`);
      } catch (error) {
        console.error("🚨 Error sending email:", error);
      }
    }
// Note: getBatchInfo seems unused in the provided routes, remove if not needed by getNextStudentId directly
const getBatchInfo = async (plan) => { /* ... your existing code ... */ };



// --- Register Route (Keep) ---
router.post("/register", async (req, res) => {
  try {
      const { name, email, password, role, plan,adminKey } = req.body;
      if (role === "admin") {
        if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
          return res.status(403).json({ message: "Invalid admin secret key" });
        }
      }
      let registrationNumber = null;

      // Generate student ID if needed
      if (role === "admin") {
        registrationNumber = await getNextAdminId();
      } else if (plan) {
        const idResult = await getNextStudentId(plan);
        if (!idResult?.regNumber) {
          throw new Error("Student ID generation failed");
        }
        registrationNumber = idResult.regNumber;
      }
      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
      }

      // Create and save new user
      const newUser = new User({
          name,
          email,
          password,
          role,
          plan: role === "admin" ? undefined : plan,
          studentId: registrationNumber
      });

      await newUser.save();

      // Send welcome email AFTER successful registration

          sendWelcomeEmail(
              newUser.email, 
              newUser.name, 
              newUser.plan, 
              newUser.studentId
          ).catch(err => console.error("Email sending error:", err));
      

      return res.status(201).json({ 
        success: true,
          message: "Registration successful",
          studentId: registrationNumber 
      });

  } catch (error) {
      console.error("Registration error:", error);
      
      if (error.code === 11000) {
          return res.status(400).json({  success: false,message: "Duplicate key error" });
      }
      if (error.name === 'ValidationError') {
          return res.status(400).json({  success: false,message: "Validation failed" });
      }
      return res.status(500).json({  success: false,message: "Registration failed" });
  }
});
       // **Important**: Ensure password hashing happens here if not done in model pre-save hook
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);



// --- Login Route (Keep) ---
// routes/authRoutes.js -> POST /login

router.post("/login", async (req, res) => {
  console.log("--- Login Request Received ---");
  try {
      const { email, password } = req.body;
      console.log(`[Login] Attempting login for: ${email}`);
      const user = await User.findOne({ email }); 

      // const isMatch = await bcrypt.compare(password, user.password);
      if (!user) {
        console.log("[Login] Failed: User not found.");
        return res.status(400).json({ message: "Invalid credentials" });
      }
      console.log("[Login] User found. Checking password...");
      console.log("[Login] Password from Request Body:", password); // Log password received
      console.log("[Login] Hashed Password from DB:", user.password);
      const isMatch = await bcrypt.compare(password, user.password);
      // --- !!! END CRITICAL PART !!! ---

      console.log(`[Login] bcrypt.compare result (isMatch): ${isMatch}`); // Log the result of the comparison

      // --- !!! CHECK THIS IF CONDITION !!! ---
      if (!isMatch) {
          console.log("[Login] Failed: Password mismatch.");
          // IMPORTANT: Use the SAME generic error message
          return res.status(400).json({ message: "Invalid credentials" });
      }
      // --- !!! END CHECK ---

      console.log("[Login] Password matched.");
      // --- Record Login Event ---
      try {
          console.log(`[Login] Preparing history record. User object found: ${!!user}`); // Confirm user object exists

          // --- DETAILED LOGGING for user._id ---
          const userIdValue = user._id; // Assign to variable for clarity
          console.log(`[Login] Value of user._id: ${userIdValue}`);
          console.log(`[Login] Type of user._id: ${typeof userIdValue} / Is ObjectId?: ${userIdValue instanceof mongoose.Types.ObjectId}`);
          // --- END DETAILED LOGGING ---

          if (!LoginHistory) { throw new Error("LoginHistory model is not loaded."); }
          if (!userIdValue) { throw new Error("userIdValue is null or undefined."); } // Check the variable

          // Create instance using the variable
          const loginRecord = new LoginHistory({ userId: userIdValue });

          // --- Log the created instance BEFORE save ---
          console.log("[Login] >>> LoginHistory object created:", JSON.stringify(loginRecord.toObject(), null, 2));
          // --- END LOG ---

          // Attempt save
          const savedRecord = await loginRecord.save();
          console.log("[Login] ✅ Login event recorded successfully:", savedRecord._id);

      } catch (historyError) {
          console.error("🔥🔥🔥 [Login] CRITICAL FAILURE: Error recording login history:", historyError);
          console.error(historyError);
      }
      // --- End Record Login Event ---

      // Generate token & response...
      console.log("[Login] Generating token...");
      const tokenPayload = { id: user._id, role: user.role, plan: user.plan };
        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1h" });
      console.log("[Login] Sending successful response.");
      res.status(200).json({ message: "Login successful",
        token: token, // Send the generated token
        user: {     // Send necessary non-sensitive user info
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            studentId: user.studentId, // Use correct field name from your schema
            registrationNumber: user.registrationNumber, // Or this if you have both? Check schema.
            profileImg: user.profileImg
        }
    });

  } catch (error) {
      // ... main catch block ...
      console.error("❌ [Login] Main Catch Block Error:", error);
      res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// ... rest of file ...


// --- Verify Token Middleware (Keep and Enhance) ---
// This middleware will be used by protected routes (like student dashboard)
const verifyToken = async (req, res, next) => { // Make it async
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY); // Throws error if invalid/expired

        // --- FETCH Full User from DB ---
        // We need the *current* user data, including the 'plan' field
        const user = await User.findById(decoded.id).select('-password'); // Exclude password

        if (!user) {
             // User associated with token no longer exists
             return res.status(401).json({ message: "Unauthorized: User not found." });
         }

        // --- Attach the full user object to the request ---
        req.user = user;
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error("Token verification error:", error);
        if (error.name === 'JsonWebTokenError') {
             return res.status(401).json({ message: "Unauthorized: Invalid token." });
        }
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: "Unauthorized: Token expired." });
        }
        // Generic server error for other issues
        return res.status(500).json({ message: "Token verification error", error: error.message });
    }
};

const isAdmin = (req, res, next) => {
  // This relies on verifyToken running first and adding req.user
  if (req.user && req.user.role === 'admin') {
       console.log("isAdmin check: PASSED"); // Optional log
       next(); // User is admin, proceed
  } else {
       console.log(`isAdmin check: FAILED (User: ${req.user?.email}, Role: ${req.user?.role})`); // Optional log
       res.status(403).json({ message: 'Forbidden: Admin access required.' }); // Not an admin
  }
};

// --- Verify Route (Keep - useful for frontend checks) ---
// Uses the middleware defined above
router.get("/verify", verifyToken, (req, res) => {
    // If verifyToken middleware passes, req.user is populated
    // Send back non-sensitive user info
     res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            plan: req.user.plan,
            registrationNumber: req.user.registrationNumber
        }
    });
});


// --- Export the router and the middleware ---
module.exports = { authRouter: router, verifyToken, isAdmin }; // Export both