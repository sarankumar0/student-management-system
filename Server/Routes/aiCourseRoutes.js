// routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// --- Models & Middleware ---
const Course = require('../models/AI_courses'); // Using your existing model name
const { verifyToken, isAdmin } = require('./authRoutes'); // Using your existing auth path

// --- Multer Setup for Course Thumbnails ---
const thumbnailStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'course_thumbnails');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images allowed for thumbnail.'), false);
    }
};

const uploadThumbnail = multer({
    storage: thumbnailStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

router.post('/',verifyToken,isAdmin,uploadThumbnail.single('thumbnailFile'),
    async (req, res) => {
        console.log("--- Request: POST /api/courses ---");
        console.log("Request Body:", req.body);
        console.log("Request File (Thumbnail):", req.file);

        // Parse course data (handles both FormData and regular JSON)
        let courseData;
        try {
            if (req.body.courseData) {
                courseData = JSON.parse(req.body.courseData);
            } else {
                courseData = req.body;
            }
        } catch (parseError) {
            console.error("Error parsing course data:", parseError);
            if (req.file) fs.unlink(req.file.path, err => {});
            return res.status(400).json({ message: "Invalid format for course data." });
        }

        const {
            title, // courseTitle from frontend
            description, // courseDescription from frontend
            accessType,
            status = 'published',
            modules
        } = courseData;

        // Basic Validation (keep your existing validation)
        if (!title || !accessType || !modules || !Array.isArray(modules)) {
            if (req.file) fs.unlink(req.file.path, err => {});
            return res.status(400).json({ message: 'Missing required fields: title, accessType, and modules are required.' });
        }

        try {
            // Create new course with thumbnail if provided
            const newCourseData = {
                title,
                description,
                accessType,
                status,
                modules,
                createdBy: req.user._id
            };

            // Add thumbnail URL if file was uploaded
            if (req.file) {
                newCourseData.thumbnailUrl = `/uploads/course_thumbnails/${req.file.filename}`;
                console.log("Thumbnail uploaded:", newCourseData.thumbnailUrl);
            }

            const newCourse = new Course(newCourseData);
            const savedCourse = await newCourse.save();

            console.log("Course saved successfully:", savedCourse._id);
            res.status(201).json(savedCourse);

        } catch (error) {
            console.error("Error saving course:", error);
            // Clean up uploaded file if error occurs
            if (req.file) {
                fs.unlink(req.file.path, err => {
                    if (err) console.error("Error deleting uploaded thumbnail:", err);
                });
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: "Validation failed", errors: messages });
            }
            res.status(500).json({ message: 'Server error saving course.', error: error.message });
        }
    }
);
router.get('/', verifyToken, isAdmin, async (req, res) => {
    console.log("--- Request: GET /api/ai-courses ---");
    try {
        const courses = await Course.find({ createdBy: req.user._id }) // Optional: Filter by creator admin? Or show all?
            .select('title description accessType status thumbnailUrl createdAt') // Select fields for list
            .sort({ createdAt: -1 }); 

        res.status(200).json({ courses: courses || [] });

    } catch (error) {
        console.error("Error fetching AI courses:", error);
        res.status(500).json({ message: 'Server error fetching courses.', error: error.message });
    }
});
router.get('/:id', verifyToken,  async (req, res) => {
    const { id } = req.params;
    console.log(`--- Request: GET /api/ai-courses/${id} ---`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Course ID format.' });
    }
    try {
        // Fetch full course including modules/lessons for editing
        const course = await Course.findById(id);
        // Optional: Check if req.user._id matches course.createdBy if needed

        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.status(200).json(course); // Send full course object

    } catch (error) {
        console.error(`Error fetching course ${id}:`, error);
        res.status(500).json({ message: 'Server error fetching course details.', error: error.message });
    }
});
router.patch(
    '/:id',
    verifyToken,
    isAdmin,
    uploadThumbnail.single('thumbnailFile'), // Handle optional thumbnail replacement
    async (req, res) => {
        const { id } = req.params;
        console.log(`--- Request: PATCH /api/ai-courses/${id} ---`);
        console.log("Request Body:", req.body);
        console.log("Request File (Thumbnail):", req.file);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            if (req.file) fs.unlink(req.file.path, err => {}); // Clean up if ID invalid
            return res.status(400).json({ message: 'Invalid Course ID format.' });
        }

        // --- Parse data (might be FormData if file included) ---
         let courseUpdateData;
         try {
             if (req.body.courseData) { // Check if JSON string was sent in 'courseData' field
                 courseUpdateData = JSON.parse(req.body.courseData);
             } else { // Assume JSON body if no file potentially
                 courseUpdateData = req.body;
              }
         } catch (parseError) {
             console.error("Error parsing course data from PATCH request body:", parseError);
             if (req.file) fs.unlink(req.file.path, err => {});
             return res.status(400).json({ message: "Invalid format for course update data." });
         }

        // --- Extract fields allowed for update ---
        const { title, description, accessType, status, modules } = courseUpdateData;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (accessType !== undefined) updateData.accessType = accessType;
        if (status !== undefined) updateData.status = status;
        // Updating nested modules/lessons via PATCH requires careful handling
        // Simplest PATCH: only update top-level fields + thumbnail
        // More Complex: If 'modules' is sent, replace the entire array
        if (modules !== undefined) updateData.modules = modules; // CAUTION: Replaces entire modules array

        try {
            const courseToUpdate = await Course.findById(id);
            if (!courseToUpdate) {
                if (req.file) fs.unlink(req.file.path, err => {});
                return res.status(404).json({ message: 'Course not found.' });
            }
            // Optional: Check ownership courseToUpdate.createdBy === req.user._id

            // Handle thumbnail replacement
            let oldThumbnailPath = null;
            if (req.file) {
                 updateData.thumbnailUrl = `/uploads/course_thumbnails/${req.file.filename}`;
                 oldThumbnailPath = courseToUpdate.thumbnailUrl && !courseToUpdate.thumbnailUrl.endsWith('default_course.png')
                                    ? path.join(__dirname, '..', courseToUpdate.thumbnailUrl)
                                    : null;
                 console.log("New thumbnail uploaded for update, will replace:", courseToUpdate.thumbnailUrl);
            }

            // Apply updates
            const updatedCourse = await Course.findByIdAndUpdate(
                 id,
                 { $set: updateData },
                 { new: true, runValidators: true, context: 'query' }
             );

             // Delete old thumbnail *after* successful update
             if (updatedCourse && oldThumbnailPath) {
                 if (fs.existsSync(oldThumbnailPath)) {
                     fs.unlink(oldThumbnailPath, (err) => {
                         if (err) console.error("Error deleting old course thumbnail:", err);
                         else console.log("Old course thumbnail deleted:", oldThumbnailPath);
                     });
                 }
             }

            console.log("Course updated successfully:", updatedCourse._id);
            res.status(200).json(updatedCourse);

        } catch (error) {
             console.error(`Error updating course ${id}:`, error);
             if (req.file) fs.unlink(req.file.path, err => {}); // Clean up new file if update fails
             if (error.name === 'ValidationError') { /* ... validation error handling ... */ }
             res.status(500).json({ message: 'Server error updating course.', error: error.message });
        }
    }
);
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`--- Request: DELETE /api/ai-courses/${id} ---`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Course ID format.' });
    }

    try {
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Delete associated thumbnail file if it exists and isn't the default
        if (deletedCourse.thumbnailUrl && !deletedCourse.thumbnailUrl.endsWith('default_course.png')) {
            const filePath = path.join(__dirname, '..', deletedCourse.thumbnailUrl);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting course thumbnail file:", err);
                    else console.log("Deleted course thumbnail file:", filePath);
                });
            }
        }

        console.log("Course deleted successfully:", id);
        res.status(200).json({ message: `Course "${deletedCourse.title}" deleted successfully.` });

    } catch (error) {
        console.error(`Error deleting course ${id}:`, error);
        res.status(500).json({ message: 'Server error deleting course.', error: error.message });
    }
});


module.exports = router;