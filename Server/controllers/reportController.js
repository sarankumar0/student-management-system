const PDFDocument = require("pdfkit");
const { parse } = require("json2csv");

// Generate Detailed PDF
const generatePDF = async (students) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    students.forEach((student, index) => {
      doc.fontSize(18).text(`Student Profile - ${student.name}`, { align: "center" });
      doc.moveDown();

      // Personal Information
      doc.fontSize(14).text("Personal Information", { underline: true });
      doc.fontSize(12).text(`Roll No: ${student.rollNo}`);
      doc.text(`Name: ${student.name}`);
      doc.text(`Email: ${student.email}`);
      doc.text(`Phone: ${student.phone}`);
      doc.text(`Department: ${student.department}`);
      doc.text(`Course: ${student.course}`);
      doc.text(`Year of Study: ${student.yearOfStudy}`);
      doc.text(`Category: ${student.category}`);
      doc.text(`Medical Condition: ${student.medicalCondition}`);
      doc.moveDown(1);

      // Address
      doc.fontSize(14).text("Address Information", { underline: true });
      doc.fontSize(12).text(`Permanent Address: ${student.permAddress}`);
      doc.text(`Current Address: ${student.currAddress}`);
      doc.text(`City: ${student.city}`);
      doc.text(`State: ${student.state}`);
      doc.text(`Zip: ${student.zip}`);
      doc.text(`Country: ${student.country}`);
      doc.moveDown(1);

      // Parent/Guardian Information
      doc.fontSize(14).text("Parent/Guardian Information", { underline: true });
      doc.fontSize(12).text(`Father's Name: ${student.fatherName}`);
      doc.text(`Mother's Name: ${student.motherName}`);
      doc.text(`Guardian Contact: ${student.guardianContact}`);
      doc.text(`Parent Occupation: ${student.parentOccupation}`);
      doc.moveDown(1);

      // Academic Details
      doc.fontSize(14).text("Academic Information", { underline: true });
      doc.fontSize(12).text(`Previous Qualification: ${student.prevQualification}`);
      doc.text(`Previous Marks: ${student.prevMarks}`);
      doc.text(`Current Marks: ${student.marks}`);
      doc.text(`Enrollment Date: ${new Date(student.enrollmentDate).toLocaleDateString()}`);
      doc.moveDown(2);

      // Add Page Break if Multiple Profiles
      if (index !== students.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  });
};


// Generate Detailed CSV
const generateCSV = async (students) => {
  const csvFields = [
    "Roll No",
    "Name",
    "Email",
    "Phone",
    "Department",
    "Course",
    "Year of Study",
    "Marks",
    "Previous Qualification",
    "Previous Marks",
    "Perm Address",
    "Curr Address",
    "City",
    "State",
    "Zip",
    "Country",
    "Father's Name",
    "Mother's Name",
    "Guardian Contact",
    "Parent Occupation",
    "Aadhar Number",
    "Category",
    "Medical Condition",
    "Enrollment Date",
  ];

  const csvData = students.map((student) => ({
    "Roll No": student.rollNo,
    Name: student.name,
    Email: student.email,
    Phone: student.phone,
    Department: student.department,
    Course: student.course,
    "Year of Study": student.yearOfStudy,
    Marks: student.marks,
    "Previous Qualification": student.prevQualification,
    "Previous Marks": student.prevMarks,
    "Perm Address": student.permAddress,
    "Curr Address": student.currAddress,
    City: student.city,
    State: student.state,
    Zip: student.zip,
    Country: student.country,
    "Father's Name": student.fatherName,
    "Mother's Name": student.motherName,
    "Guardian Contact": student.guardianContact,
    "Parent Occupation": student.parentOccupation,
    "Aadhar Number": student.aadharNumber,
    Category: student.category,
    "Medical Condition": student.medicalCondition,
    "Enrollment Date": new Date(student.enrollmentDate).toLocaleDateString(),
  }));

  const csv = parse(csvData, { fields: csvFields });
  return csv;
};

module.exports = { generatePDF, generateCSV };
