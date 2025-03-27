const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const studentRoutes = require("./Routes/studentRoutes");
const authRoutes = require("./Routes/authRoutes"); 
const batchRoutes=require("./Routes/batchRoutes");
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const reportRoutes = require("./Routes/reportRoutes"); 
const deletedLogRoutes = require("./Routes/deletedLogRoutes");
const path = require("path");
const uploadRoutes = require("./Routes/uploadRoutes");

connectDB();
const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true, // ✅ Ensures cookies are sent properly
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow important headers
  methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allow all required methods
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes); 
app.use("/api/batches",batchRoutes);
app.use("/api", reportRoutes);
app.use("/api/deletedLogs", deletedLogRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", uploadRoutes);
app.use(uploadRoutes);

const SECRET_KEY = "your_secret_ke  y"; // Replace with process.env.JWT_SECRET if using dotenv

// 🔹 **Verify Token Route (Fixing 403 Error)**
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    res.status(200).json({ user: decoded });
  });
});
// Example route to check if cookies work
app.get("/test-cookie", (req, res) => {
  res.cookie("testCookie", "Hello from Server!", { httpOnly: true });
  res.send("Cookie has been set!");
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
