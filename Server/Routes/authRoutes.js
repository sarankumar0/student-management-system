const express = require("express");
const User = require("../models/User");
const Counter = require("../models/Counter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const SECRET_KEY = "your_secret_key";
const SECRET_ADMIN_KEY = "EDITH"; 
const nodemailer = require("nodemailer");
const Student = require("../models/Student");
const DeletedLog = require("../models/DeletedLog");

// Helper Function: Get the next student ID
const getNextStudentId = async (plan) => {
  const { batchNumber, batchName, } = await getBatchInfo(plan);
  const prefix = plan === "basic" ? "Ba" : plan === "classic" ? "Cl" : "Pr";
  const latestStudent = await User.findOne({ plan }).sort({ registrationNumber: -1 }).lean();
  let newId = latestStudent ? parseInt(latestStudent.registrationNumber.substring(2)) + 1 : 1001;
  return { regNumber: `${prefix}${newId}`, batchNumber, batchName };
};


//Helper Function: Get the next Admin ID
const getNextAdminId = async () => {
  let counter = await Counter.findOne({ plan: "admin" });
  if (!counter) {
    counter = new Counter({ plan: "admin", lastId: 0 }); // Start admin IDs from Ad001
  }
  counter.lastId++;
  await counter.save();
  return `Ad${String(counter.lastId).padStart(3, "0")}`; // Format like Ad001, Ad002
  };

  const getBatchInfo = async (plan) => {
    const latestBatch = await User.findOne({ plan })
      .sort({ batchNumber: -1 })
      .select("batchNumber")
      .lean();
    let batchNumber = latestBatch ? latestBatch.batchNumber : 1;
    const studentCount = await User.countDocuments({ plan, batchNumber });
    if (studentCount >= 50) {
      batchNumber += 1; // Create a new batch
    }
    const batchName = `${plan.charAt(0).toUpperCase() + plan.slice(1)}-${batchNumber}`;
    return { batchNumber, batchName };
  };
  
  router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role, plan, adminKey } = req.body;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required and must be a string" });
    }
    if (role === "admin" && adminKey !== SECRET_ADMIN_KEY) {
      return res.status(403).json({ message: "Invalid Admin Key" });
    }
    console.log("Raw Password Before Hashing:", `"${password}"`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "umm.. you are not new.. Try to Login.." });
    }
    console.log("📌 Raw Password Before Hashing:", `"${password}"`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔒 Hashed Password Before Saving:", `"${hashedPassword}"`);
    let registrationNumber = "";
    let batchNumber = null;
    let batchName = null;
    if (role === "admin") {
      registrationNumber = await getNextAdminId();
    } else {
      const batchInfo = await getNextStudentId(plan || "basic");
      registrationNumber = batchInfo.regNumber;
      batchNumber = batchInfo.batchNumber;
      batchName = batchInfo.batchName;
    }
    const newUser = new User({
      name,
      email,
      password,
      role,
      plan: role === "user" ? plan : null,
      registrationNumber,
      batchNumber,
      batchName,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!", registrationNumber,batchName, });

    sendWelcomeEmail(newUser.email, newUser.name, newUser.plan,newUser.registrationNumber)
      .then(() => console.log(`📧 Email sent successfully to ${newUser.email}`))
      .catch((err) => console.error("🚨 Email sending failed:", err));
      
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

                                
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;
//     if (!password || typeof password !== "string") {
//       return res.status(400).json({ message: "Invalid password format" });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "umm.. We Think You are New to our Academy.. Try to Register First..!" });
//     }
//     console.log("Entered Password:", `"${password}"`);
//     console.log("Stored Hashed Password:", `"${user.password}"`);
//     password = password.trim();
//     //Compare with stored hash
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("🔄 Password Match Status:", isMatch);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials (Wrong password)" });
//     }
//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       "your_secret_key",
//       { expiresIn: "1h" }
//     );
//     res.cookie("token", token, { httpOnly: false, secure: false, sameSite: "Lax",path: "/",axAge: 60 * 60 * 1000, });
//     res.cookie("user", JSON.stringify(user), { httpOnly: false, secure: false, sameSite: "Lax",path: "/",});
//     res.cookie("registrationNumber", user.registrationNumber, { httpOnly: false, secure: false, sameSite: "Lax",domain: "localhost", });
//     res.status(200).json({ message: "Login successful", token, user });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// });

// DELETE student

// router.post("/login", async (req, res) => {
//   try {
//       const { email, password } = req.body;
//       const user = await User.findOne({ email });
//       if (!user) return res.status(400).json({ message: "User not found. Please register first." });

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

//       // Generate JWT Token
//       const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

//       // Store JWT in HTTP-only cookie
//       res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 60 * 60 * 1000 });
//       console.log("🔹 Login API hit for:", email);
//       res.status(200).json({ message: "Login successful" });
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// 🔹 PROFILE API (Fetch user details after login)
// router.get("/user-profile", async (req, res) => {
//   try {
//       const token = req.cookies.token;
//       if (!token) return res.status(401).json({ message: "Unauthorized" });

//       // Verify JWT and get user ID
//       const decoded = jwt.verify(token, SECRET_KEY);
//       const user = await User.findById(decoded.id).select("-password"); // Exclude password
//       if (!user) return res.status(404).json({ message: "User not found" });

//       res.status(200).json(user);
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      // ✅ Save last login time
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 60 * 60 * 1000 });

      res.status(200).json({ message: "Login successful" });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.get("/user-profile", async (req, res) => {
  console.log("🔹 User profile API hit");

  const token = req.cookies.token; // ✅ Check if token exists
  console.log("🔹 Extracted Token:", token);

  if (!token) return res.status(401).json({ message: "Unauthorized, no token" });

  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log("🔹 Decoded Token:", decoded);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      console.log("✅ User found:", user);
      res.status(200).json(user);
  } catch (error) {
      console.error("❌ Error in user-profile:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});





router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// POST deleted log
router.post("/", async (req, res) => {
  try {
    const log = new DeletedLog(req.body);
    await log.save();
    res.status(201).json({ message: "Log saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Middleware to Verify Token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      req.user = decoded; // Now includes id, email, and role
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Token verification error", error: error.message });
  }
};

//Verify Token API for Frontend
router.get("/verify", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

//Example Protected Route
router.get("/protected-data", verifyToken, (req, res) => {
  res.json({ message: "This is protected data", user: req.user });
});

const sendWelcomeEmail=async(email,name,plan,registrationNumber)=>{
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
    <p><strong>Your Registration ID:</strong> <span style="color: #4CAF50; font-weight: bold;">${registrationNumber}</span></p>
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
};

// 🔹 API: Get User Count by Plan (For Pie Chart)
router.get("/count-by-plan", async (req, res) => {
  try {
      const plans = ["basic", "classic", "pro"];
      const counts = await User.aggregate([
          { $match: { role: "user", plan: { $in: plans } } },
          { $group: { _id: "$plan", count: { $sum: 1 } } }
      ]);

      const result = { basic: 0, classic: 0, pro: 0 };
      counts.forEach(plan => { result[plan._id] = plan.count });

      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ message: "Error fetching user count", error: error.message });
  }
});


// 🔹 API: Get Daily Login Stats (For Bar Chart)
router.get("/login-stats", async (req, res) => {
  try {
      const loginCounts = await User.aggregate([
          { $match: { lastLogin: { $exists: true } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
      ]);

      const formattedData = loginCounts.reduce((acc, entry) => {
          acc[entry._id] = entry.count;
          return acc;
      }, {});

      res.status(200).json(formattedData);
  } catch (error) {
      res.status(500).json({ message: "Error fetching login stats", error: error.message });
  }
});


module.exports = router;
