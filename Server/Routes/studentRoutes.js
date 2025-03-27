const express = require("express");
const Student = require("../models/Student");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// 🔹 **POST - Add a New Student**
router.post("/", async (req, res) => {
  try {
    if (req.body.enrollmentDate) {
      req.body.enrollmentDate = new Date(req.body.enrollmentDate).toISOString().split("T")[0];
    }

    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "Student added successfully", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Error adding student", error: error.message });
  }
});

// 🔹 **GET - Fetch All Students**
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
});

// 🔹 **PUT - Update Student (Edit)**
router.put("/:id", async (req, res) => {
  try {
    if (req.body.enrollmentDate) {
      req.body.enrollmentDate = new Date(req.body.enrollmentDate).toISOString().split("T")[0];
    }
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
});

// 🔹 **DELETE - Remove Student**
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 **GET - Fetch Student by Registration Number**

// router.get("/:registrationNumber", async (req, res) => {
//   try {
//       console.log("🔹 Searching for registrationNumber:", req.params.registrationNumber.trim());

//       const student = await Student.findOne({ registrationNumber: req.params.registrationNumber.trim() });

//       if (!student) {
//           console.log("❌ Student Not Found in DB");
//           return res.status(404).json({ message: "Student not found" });
//       }

//       console.log("✅ Student Found:", student);
//       res.status(200).json(student);
//   } catch (error) {
//       console.error("❌ Error Fetching Student:", error.message);
//       res.status(500).json({ message: "Error fetching student", error: error.message });
//   }
// });

router.get("/students/:regNo", async (req, res) => {
  const student = await Student.findOne({ regNo: req.params.regNo });
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
});

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${req.params.registrationNumber}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 🔹 **POST - Upload Profile Image**
router.post("/:registrationNumber/upload", upload.single("profileImg"), async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const profileImgPath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findOneAndUpdate(
      { registrationNumber },
      { profileImg: profileImgPath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile image updated", profileImg: `http://localhost:5000${profileImgPath}` });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
});

// 🔹 UPDATE Student Data (Save Edits)
router.put("/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;  // Get rollNo from URL
    const updatedData = req.body;  // Get updated data from request body

    const updatedStudent = await Student.findOneAndUpdate(
      { rollNo: rollNo },  // Find by rollNo instead of _id
      updatedData, 
      { new: true }  // Return updated document
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
});
// router.get("/:regNo", async (req, res) => {
//   try {
//     const { regNo } = req.params;
//     const user = await User.findOne({ registrationNumber: regNo }).lean();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ✅ Fetch student details (academic, personal info)
//     const student = await Student.findOne({ rollNo: regNo }).lean();
//     if (!student) {
//       return res.status(404).json({ message: "Student record not found" });
//     }

//     // ✅ Merge both data
//     const mergedData = { ...user, ...student };

//     res.status(200).json(mergedData);
//   } catch (error) {
//     console.error("Error fetching student:", error);
//     res.status(500).json({ message: "Error fetching student", error: error.message });
//   }
// });
router.get("/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params; // Extract roll number from URL
    console.log("Requested Roll Number:", rollNo); // Debugging line
    const student = await Student.findOne({ rollNo: rollNo }).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
});


module.exports = router;
