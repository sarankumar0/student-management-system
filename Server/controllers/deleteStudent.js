const Student = require("../models/studentModel");
const DeletedLog = require("../models/deletedLogModel");

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Save deleted student to log
    const deletedLog = new DeletedLog({
      rollNo: student.rollNo,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      course: student.course,
      yearOfStudy: student.yearOfStudy
    });

    await deletedLog.save(); // ✅ Save to logs

    // ✅ Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting student", error: err });
  }
};
