const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CourseMaterial = require("../models/courseMaterial");
const Video = require("../models/video");
const mongoose = require("mongoose");
const { verifyToken } = require('./authRoutes');


const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// Setup Multer for File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.mimetype.startsWith("video/")
      ? "uploads/videos"
      : "uploads/pdfs";

    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload PDF
router.post("/pdfs", upload.single("file"), async (req, res) => {
  console.log('Received POST /pdfs'); // Add this
  console.log('File:', req.file); // Add this
  console.log('Body:', req.body); // Add this
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, batch, accessType } = req.body;
    if (!title || !accessType || !["basic", "classic", "pro"].includes(accessType)) {
      return res.status(400).json({ message: "Missing or invalid title, batch, or accessType" });
  }
    console.log('Attempting to save:', { title, batch, accessType, fileUrl: `/uploads/pdfs/${req.file.filename}` });
    const newMaterial = new CourseMaterial({
      title,
      batch,
      accessType,
      fileUrl: `/uploads/pdfs/${req.file.filename}`,
    });

    await newMaterial.save();
    res.json({ message: "PDF uploaded successfully",material: newMaterial });
  } catch (err) {
    console.error("!!! SERVER ERROR in POST /pdfs:", err);
    res.status(500).json({ message: "Error uploading PDF", error: err.message });
  }
});


// Upload Video
router.post("/videos", upload.single("file"), async (req, res) => {
  console.log('Received POST /videos');
  console.log('File:', req.file);
  console.log('Body:', req.body);
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title,accessType } = req.body;

    if (!title || !accessType || !["basic", "classic", "pro"].includes(accessType)) {
      // Clean up uploaded file if validation fails before saving DB record
       if (req.file && req.file.path) {
         fs.unlink(req.file.path, (unlinkErr) => {
           if (unlinkErr) console.error("Error deleting file after validation fail:", unlinkErr);
         });
       }
      return res.status(400).json({ message: "Missing or invalid title or accessType for video" });
    }

    // Ensure filePath uses the correct destination from multer
    const relativeFilePath = `/uploads/videos/${req.file.filename}`;
    console.log('Attempting to save video:', { title, accessType, filePath: relativeFilePath });

    const newVideo = new Video({
      title,
      accessType,
      filePath: relativeFilePath,
      uploadedAt: new Date(),
    });

    await newVideo.save();
    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (err) {
    res.status(500).json({ message: "Error uploading video", error: err.message });
    //clean up uploaded file if DB save fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file after DB error:", unlinkErr);
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error", errors: err.errors });
    }
   res.status(500).json({ message: "Error uploading video", error: err.message });
 }
});

router.patch("/:id", upload.single("file"), async (req, res) => { // <--- Use .patch here
  try {
    const { id } = req.params;
    // Note: For PATCH, you might only receive fields being changed.
    // Check if fields exist in req.body before assigning.
    const { title, batch, accessType } = req.body;
    const material = await CourseMaterial.findById(id);

    if (!material) return res.status(404).json({ message: "Material not found" });

    // Update fields ONLY if they are provided in the request body
    if (title !== undefined) material.title = title;
    if (batch !== undefined) material.batch = batch; // If using batch
    if (accessType !== undefined) material.accessType = accessType;

    // Handle optional file replacement
    if (req.file) {
        console.log("New file received for PATCH:", req.file.filename);
        const newFileUrl = `/uploads/pdfs/${req.file.filename}`; // Adjust path based on multer config

        // Delete old file if it exists and is different
        if (material.fileUrl && material.fileUrl !== newFileUrl) {
             try {
                 const oldFilePath = path.join(__dirname, "..", material.fileUrl); // Adjust '..' as needed
                 if (fs.existsSync(oldFilePath)) { // Check if file exists before unlinking
                    fs.unlinkSync(oldFilePath); // Use sync or handle async callback properly
                    console.log("Deleted old file:", oldFilePath);
                 } else {
                     console.log("Old file not found, skipping delete:", oldFilePath);
                 }
             } catch (unlinkErr) {
                 console.error("Error deleting old file:", unlinkErr);
                 // Decide if this should stop the update process? Maybe not.
             }
        }
        material.fileUrl = newFileUrl; // Update the URL in the document
    }

    const updatedMaterial = await material.save(); // Save the changes
    res.json({ message: "Material updated successfully", material: updatedMaterial });

  } catch (err) {
    console.error("Error updating material via PATCH:", err);
    // If file was uploaded but DB save failed, delete the newly uploaded file
     if (req.file && req.file.path) {
         try {
             if (fs.existsSync(req.file.path)) {
                 fs.unlinkSync(req.file.path);
                 console.log("Deleted newly uploaded file due to DB error:", req.file.path);
             }
         } catch (cleanupErr) {
             console.error("Error cleaning up uploaded file after DB error:", cleanupErr);
         }
     }
    res.status(500).json({ message: "Error updating material", error: err.message });
  }
});



router.delete('/:id', async (req, res) => {
  try {
      const material = await CourseMaterial.findByIdAndDelete(req.params.id);
      if (!material) {
          return res.status(404).json({ message: 'PDF Material not found' });
      }
      // Optional: Delete the associated file from storage (using fs.unlink)
      // Be careful with paths! material.fileUrl might be '/uploads/pdfs/filename.pdf'
      if (material.fileUrl) {
           const filePath = path.join(__dirname, '..', material.fileUrl); // Adjust path as needed
           fs.unlink(filePath, (err) => {
               if (err) console.error(`Error deleting file ${filePath}:`, err);
               else console.log(`Deleted file: ${filePath}`);
           });
       }
      res.status(200).json({ message: 'PDF Material deleted successfully' });
  } catch (err) {
      console.error("Error deleting PDF:", err);
      res.status(500).json({ message: 'Error deleting PDF material', error: err.message });
  }
});

// Delete Video Material
router.delete('/:id', async (req, res) => {
  try {
      const video = await Video.findByIdAndDelete(req.params.id);
      if (!video) {
          return res.status(404).json({ message: 'Video not found' });
      }
       // Optional: Delete the associated file from storage
       if (video.filePath) {
           const filePath = path.join(__dirname, '..', video.filePath); // Adjust path as needed
           fs.unlink(filePath, (err) => {
               if (err) console.error(`Error deleting file ${filePath}:`, err);
               else console.log(`Deleted file: ${filePath}`);
           });
       }
      res.status(200).json({ message: 'Video deleted successfully' });
  } catch (err) {
      console.error("Error deleting Video:", err);
      res.status(500).json({ message: 'Error deleting video', error: err.message });
  }
});

router.get("/:batch", async (req, res) => { // Path changed
  console.log(`GET /api/pdfs/${req.params.batch} route hit!`);
  try {
    const { batch } = req.params;
    if (!batch) {
       return res.status(400).json({ message: "Batch parameter is required." });
    }
    let filter = {};
    const batchLower = batch.toLowerCase();

    // Corrected filtering logic using accessType
    if (batchLower === "basic") {
      filter = { accessType: "basic" };
    } else if (batchLower === "classic") { // Use batchLower
      filter = { accessType: { $in: ["basic", "classic"] } };
    } else if (batchLower === "pro") {
      filter = { accessType: { $in: ["basic", "classic", "pro"] } };
    } else {
       console.warn(`Invalid batch parameter received for PDFs: ${batch}`);
       return res.json([]); // Return empty for invalid batch
    }

    console.log(`Fetching PDFs with filter:`, filter);
    // Find materials matching the filter, sort by newest first
    const materials = await CourseMaterial.find(filter).sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (err) {
    console.error("Error fetching PDF materials:", err);
    res.status(500).json({ message: "Error fetching PDF materials", error: err.message });
  }
});

router.get('/download/:filename', verifyToken, async (req, res) => { 
  try {
      const filename = req.params.filename;
      if (filename.includes('..')) {
          return res.status(400).send('Invalid filename.');
      }

      // Construct the full path to the file
      // IMPORTANT: Adjust the base path according to your project structure
      // Assuming 'uploads/pdfs' is relative to the project root where server runs
      const filePath = path.join(__dirname, '..', 'uploads', 'pdfs', filename); // Adjust '..' if routes folder is deeper

      console.log(`Attempting to download file: ${filePath}`);

      // Check if file exists
      if (fs.existsSync(filePath)) {
          // Set headers to trigger download
          // 'attachment' forces download, 'inline' suggests display
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // Use the original filename
          res.setHeader('Content-Type', 'application/pdf');

          // Stream the file to the response
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);

      } else {
          console.log(`File not found for download: ${filePath}`);
          res.status(404).send('File not found.');
      }
  } catch (error) {
      console.error("Error during file download:", error);
      res.status(500).send('Server error during file download.');
  }
});

router.get('/preview/:filename', verifyToken, async (req, res) => {
  try {
    const token = req.query.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const filename = req.params.filename;
    if (filename.includes('..')) {
      return res.status(400).send('Invalid filename.');
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'pdfs', filename);
    console.log(`Attempting to preview file: ${filePath}`);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      console.log(`File not found for preview: ${filePath}`);
      res.status(404).send('File not found.');
    }
  } catch (error) {
    console.error("Error during file preview:", error);
    res.status(500).send('Server error during file preview.');
  }
});

module.exports = router;
