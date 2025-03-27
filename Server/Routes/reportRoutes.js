const express = require("express");
const { generatePDF, generateCSV } = require("../controllers/reportController");
const router = express.Router();

// Route to Download PDF
router.get("/download/pdf", async (req, res) => {
  try {
    const students = JSON.parse(req.query.students); // Pass student data from frontend
    const pdfBuffer = await generatePDF(students);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Student_Details_Report.pdf",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
});

// Route to Download CSV
router.get("/download/csv", async (req, res) => {
  try {
    const students = JSON.parse(req.query.students);
    const csvBuffer = await generateCSV(students);
    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=Student_Details_Report.csv",
    });
    res.send(csvBuffer);
  } catch (err) {
    console.error("Error generating CSV:", err);
    res.status(500).send("Error generating CSV");
  }
});

module.exports = router;
