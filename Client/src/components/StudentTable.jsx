import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const StudentTable = () => {      //({ downloadFile })
  const navigate = useNavigate();
  const location = useLocation(); // Detect current path
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch Student Data
  const fetchData = () => {
    axios
      .get("http://localhost:5000/api/students")
      .then((response) => setStudents(response.data))
      .catch((error) => console.error("Error fetching: ", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete Student Handler
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      alert("Student deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
    setIsModalOpen(false);
  };

  // Edit Student Handler
  const handleEdit = (student) => {
    navigate("/admin/StudentForm", { state: { student } });
  };

  const downloadFile = async (format, students) => {
    if (students.length === 0) {
      alert("No student data available to download!");
      return;
    }
  
    if (format === "csv") {
      const csv = Papa.unparse(students);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "students_data.csv");
    }
  };

  // Determine Page Type Based on URL
  const isAdminPage = location.pathname === "/admin";

  return (
    <>
      {/* Table Container */}
      <div
        className={`bg-white pt-10 rounded-lg shadow-md  opacity-0 translate-y-20 animate-slideInUp transition-all duration-700 ms-12`}
      >
        {/* Top Header: Title & Add Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold ms-6">Student Details</h2>

          {/* Add New Button: Only Visible on Student Page */}
          {!isAdminPage ? (
            <button
              className="bg-indigo-900 text-white px-4 py-2 me-8 rounded-md hover:px-6"
              onClick={() => navigate("/StudentsTable/StudentForm")}
            >
              + Add New
            </button>
          ):(
            <button 
            onClick={() => downloadFile("csv", students)}
            className="flex items-center space-x-2 px-4 py-2 me-5 border border-gray-300 rounded-lg shadow 
                     bg-indigo-900 transition-all duration-150 ease-in-out 
                     hover:-translate-y-1 active:translate-y-1">
            <i className="fas fa-file-excel text-white"></i>
            <span className="text-sm text-white py-1">Download as Excel</span>
          </button>
          )

          }
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto scrollbar-hide hover:scrollbar-default">
        <table className="w-[97%] mx-4 border-collapse border border-gray-200 ">
        <thead>
  <tr className="bg-indigo-900 text-white ">
    <th className="py-1 px-10 border">S.No</th>
    <th className="py-3 px-10 border">Roll No</th>
    <th className="py-3 px-10 border">Name</th>
    <th className="py-3 px-10 border">Department</th>
    <th className="py-3 px-10 border">Email</th>
    <th className="py-3 px-10 border">Phone</th>
    <th className="py-3 px-10 border">Marks (%)</th>
    <th className="py-3 px-10 border">Enrollment Date</th>
    {!isAdminPage && <th className="py-3 px-10 border">Action</th>}
  </tr>
</thead>

{/* Table Body */}
<tbody>
  {students.length > 0 ? (
    students.map((student, index) => (
      <tr
        key={student._id || index}
        className="hover:bg-gray-300 transition"
      >
        <td className="py-1 border text-center">{index + 1}</td>
        <td className="py-3 border text-center">{student.rollNo}</td>
        <td className="py-3 border text-center">{student.name}</td>
        <td className="py-3 border text-center">{student.department}</td>
        <td className="py-3 border text-center">{student.email}</td>
        <td className="py-3 border text-center">{student.phone}</td>
        <td className="py-3 border text-center">{student.marks}%</td>
        <td className="py-3 border text-center">{new Date(student.enrollmentDate).toLocaleDateString()}</td>

        {/* Conditionally Show Action Buttons */}
        {!isAdminPage && (
          <td className="py-3 border text-center flex justify-center space-x-2">
            {/* Edit Button */}
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleEdit(student)}
            >
              <FaEdit size={18} />
            </button>

            {/* Delete Button */}
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => {
                setSelectedStudent(student);
                setIsModalOpen(true);
              }}
            >
              <FaTrash size={18} />
            </button>
          </td>
        )}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="text-center py-4">
        No students found
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
      </div>

      {/* Confirm Modal */}
      {isModalOpen && (
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => handleDelete(selectedStudent._id)}
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${selectedStudent.name}'s record?`}
        />
      )}
    </>
  );
};

export default StudentTable;


