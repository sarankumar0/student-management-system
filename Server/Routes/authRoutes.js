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

//--- Registration Helper Functions (Keep as they are used by /register) ---
// const getNextStudentId = async (plan) => { /* ... your existing code ... */ };

// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//        next(); // User is admin, proceed
//   } else {
//        res.status(403).json({ message: 'Forbidden: Admin access required.' }); // Not an admin
//   }
// };

const getNextAdminId = async () => {
  let counter = await Counter.findOne({ plan: "admin" });
  if (!counter) {
    counter = new Counter({ plan: "admin", lastId: 0 }); // Start admin IDs from Ad001
  }
  counter.lastId++;
  await counter.save();
  return `Ad${String(counter.lastId).padStart(3, "0")}`; // Format like Ad001, Ad002
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


const getNextStudentId = async (plan) => {
    try { // Add try block for error handling
      // Ensure getBatchInfo call works or handle its errors if needed
      // const { batchNumber, batchName } = await getBatchInfo(plan); // We might not need this immediately
  
      const prefix = plan === "basic" ? "Ba" : plan === "classic" ? "Cl" : "Pr";
      const latestStudent = await User.findOne({ plan })
                                      .sort({ studentId: -1 })
                                      .select('studentId') // Optimize: only select needed field
                                      .lean(); // Use lean for performance if only reading
  
      let sequenceNumber = 1001; // Default start number
      if (latestStudent && latestStudent.studentId) {
        // Safely parse the number part
        const numPart = latestStudent.studentId.substring(prefix.length);
        const currentNum = parseInt(numPart, 10);
        if (!isNaN(currentNum)) { // Check if parsing was successful
          sequenceNumber = currentNum + 1;
        } else {
           console.warn(`Could not parse sequence number from ${latestStudent.studentId}. Using default start.`);
           // Optionally, query the count for this plan as a fallback
           // const count = await User.countDocuments({ plan });
           // sequenceNumber = 1001 + count;
        }
      }
  
      const regNumber = `${prefix}${sequenceNumber}`;
      console.log(`Generated student registration number: ${regNumber}`);
  
      // --- !!! ENSURE THIS RETURN EXISTS !!! ---
      // Return an object with the regNumber key
      return { regNumber /*, batchNumber, batchName */ }; // Add batch info if needed later
  
    } catch (error) {
      console.error("Error within getNextStudentId:", error);
      // Throwing the error signals failure to the caller
      throw new Error(`Failed to generate next student ID for plan ${plan}.`);
      // Alternatively, return null/undefined, but the caller must check for it
      // return undefined;
    }
  };
// --- Register Route (Keep) ---
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, plan } = req.body;

        // Use registrationNumber for studentId field as per your schema example?
        let registrationNumber = null;
        if (role !== "admin" && plan) {
            try { // Inner try specifically for ID generation
              const idResult = await getNextStudentId(plan); // Get the full result object
      
              // --- Check if the helper function succeeded ---
              if (!idResult || !idResult.regNumber) {
                console.error("getNextStudentId did not return a valid result.");
                throw new Error("Student ID generation failed internally.");
              }
              registrationNumber = idResult.regNumber;
            }catch (idError) { // Catch errors specifically from getNextStudentId
                console.error("Failed to get student ID during registration:", idError);
                // Return a specific error to the client
                return res.status(500).json({ message: "Server error generating student ID.", error: idError.message });
              }
            }

        // Generate Admin ID only if role is admin
        // You might not need adminId stored on the User model itself unless required elsewhere
        // let adminId = null;
        // if (role === "admin") { adminId = await getNextAdminId(); }

        // **Important**: Ensure password hashing happens here if not done in model pre-save hook
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`Register Route: Email already exists: ${email}`);
           return res.status(400).json({ message: "Email already exists." });
        }
    
        const newUser = new User({
            name,
            email,
            password, // Ensure this is hashed before saving (either here or via mongoose pre-save)
            role,
            plan: role === "admin" ? undefined : plan, // Admins might not have a plan
            studentId:registrationNumber // Use registrationNumber field based on your model example
            // studentId: registrationNumber, // If your field is named studentId
        });
        console.log(`Register Route: Prepared newUser object (before save):`, newUser.toObject()); // Log the object data

        await newUser.save();

         // Send welcome email after successful save
        if (role !== "admin" && plan && registrationNumber) {
            sendWelcomeEmail(newUser.email, newUser.name, newUser.plan, newUser.studentId)
                .then(() => console.log(`📧 Email sent successfully to ${newUser.email}`))
                .catch((err) => console.error("🚨 Email sending failed:", err));
        }

        res.status(201).json({ message: "Registration successful!" });

    } catch (error) {
        console.error("Register Route Error Caught:", error);
        // Handle duplicate email error (code 11000)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            console.log("Register Route: Duplicate email detected by DB index.");
            return res.status(400).json({ message: "Email already exists." });
        }
        if (error.keyPattern && error.keyPattern.studentId) {
            console.log(`Register Route: Duplicate studentId detected by DB index. Attempted: ${error.keyValue?.studentId}`);
            // This indicates an issue with the ID generation logic *despite* console logs
            return res.status(400).json({ message: "Failed to generate unique student ID. Please try again." });
       }
        // Handle other potential unique indexes
        console.log("Register Route: Duplicate key error on other field:", error.keyValue);
      return res.status(400).json({ message: "Duplicate key error.", details: error.keyValue });
    }
   if (error.name === 'ValidationError') { // Mongoose validation error
       const messages = Object.values(error.errors).map(err => err.message);
       console.log("Register Route: Mongoose validation failed:", messages);
       return res.status(400).json({ message: "Validation failed", errors: messages });
   }
   // --- End Specific Handling ---

   res.status(500).json({ message: "Error registering user", error: error.message });
 }
);



// --- Login Route (Keep) ---
// routes/authRoutes.js -> POST /login

router.post("/login", async (req, res) => {
  console.log("--- Login Request Received ---");
  try {
      const { email, password } = req.body;
      console.log(`[Login] Attempting login for: ${email}`);
      const user = await User.findOne({ email }); // Get the full Mongoose document

      if (!user) { /* ... handle not found ... */ }
      console.log("[Login] User found.");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) { /* ... handle mismatch ... */ }
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
          console.error(historyError); // Log full error object
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