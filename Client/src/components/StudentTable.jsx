import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa"; // Keep using react-icons
import ConfirmModal from "./ConfirmModal"; // Assuming this path is correct
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Keep using axios
import { saveAs } from "file-saver"; // Keep for download
import Papa from "papaparse"; // Keep for CSV generation
import DataTable from '../components/Reusble/DataTable'; // *** IMPORT THE REUSABLE COMPONENT ***

// Base URL for API (Good practice)
const API_BASE_URL = "http://localhost:5000/api";

const StudentTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // ** Add loading state **
  const [error, setError] = useState(null);        // ** Add error state **

  // Determine Page Type Based on URL (Do this earlier)
  const isAdminPage = location.pathname === "/admin"; // Or check more robustly if needed

  // Fetch Student Data
  const fetchData = async () => {
    setIsLoading(true); // Set loading true
    setError(null);     // Clear previous errors
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
    } catch (err) {
      console.error("Error fetching students: ", err);
      setError(err.message || "Failed to fetch student data."); // Set error message
      setStudents([]); // Clear data on error
    } finally {
      setIsLoading(false); // Set loading false
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch data on mount

  // --- Action Handlers (Remain Mostly the Same) ---

  // Edit Student Handler - Navigates to form
  const handleEdit = (student) => {
    navigate("/admin/StudentForm", { state: { student } }); // Adjust route if needed
  };

  // Prepare for Delete - Opens Confirmation Modal
  const handleDeleteClick = (student) => {
      setSelectedStudent(student);
      setIsModalOpen(true);
  };

  // Confirm Delete Handler - Called by Modal
  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      await axios.delete(`${API_BASE_URL}/students/${selectedStudent._id}`);
      // Use a success notification/toast later instead of alert
      // alert("Student deleted successfully!");
      fetchData(); // Re-fetch data after successful delete
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(error.message || "Failed to delete student."); // Show error
      // Use an error notification/toast later instead of alert
      // alert("Failed to delete student. Please try again.");
    } finally {
        setIsModalOpen(false); // Close modal regardless of success/fail
        setSelectedStudent(null); // Clear selection
    }
  };

  // Download Handler
  const downloadFile = async (format, studentsToDownload) => {
    if (studentsToDownload.length === 0) {
      // Use a notification/toast later
      alert("No student data available to download!");
      return;
    }

    // Simple field selection (adjust fields as needed for download)
    const fields = ["rollNo", "name", "department", "email", "phone", "marks", "enrollmentDate"];
    const dataForCsv = studentsToDownload.map(student => {
        const row = {};
        fields.forEach(field => {
            if (field === 'enrollmentDate') {
                row[field] = new Date(student[field]).toLocaleDateString();
            } else {
                row[field] = student[field];
            }
        });
        return row;
    });


    if (format === "csv") {
      // Use PapaParse for robust CSV generation
      const csv = Papa.unparse(dataForCsv);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "students_data.csv");
    }
    // Add 'excel' format later if needed (usually requires a library like 'xlsx')
  };


  // --- Define Columns for the DataTable ---
  const columns = [
    {
      header: 'S.No',
      id: 'sno', // Unique ID for the column
      // Custom cell render for index + 1, adding text-center
      cell: (_, index) => <div className="text-sm text-center">{index + 1}</div>,
      // Add text-center styling to header and cell (using optional classes)
      headerClassName: 'text-center',
    },
    {
      header: 'Roll No',
      accessorKey: 'rollNo',
      headerClassName: 'text-center', // Center header
      cellClassName: 'text-center text-gray-700',   // Center cell content
    },
    {
      header: 'Name',
      accessorKey: 'name',
      // No explicit centering needed if DataTable defaults to left,
      // but keep header centered if desired.
       headerClassName: 'text-center',
       cellClassName: 'font-medium text-gray-900', // Make name stand out
    },
    {
      header: 'Department',
      accessorKey: 'department',
      headerClassName: 'text-center',
      cellClassName: 'text-center text-gray-600',
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cellClassName: 'text-gray-600', // Keep email slightly lighter
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      headerClassName: 'text-center',
      cellClassName: 'text-center text-gray-600',
    },
    {
      header: 'Marks (%)',
      accessorKey: 'marks',
       headerClassName: 'text-center',
       // Format directly in cell function for centering and '%'
       cell: (row) => <div className="text-center font-medium">{row.marks}%</div>
    },
    {
      header: 'Enrollment Date',
      accessorKey: 'enrollmentDate',
       headerClassName: 'text-center',
       cellClassName: 'text-center text-gray-600',
       // Format date within the cell function
       cell: (row) => new Date(row.enrollmentDate).toLocaleDateString(),
    },
    // --- Conditionally add the 'Action' column ---
    ...(!isAdminPage ? [{
      header: 'Action',
      id: 'actions', // Explicit ID is good practice here
      headerClassName: 'text-center', // Center header
      // Custom cell renderer for action buttons
      cell: (row) => (
        <div className="flex justify-center items-center space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 p-1" // Added padding for better click area
            onClick={() => handleEdit(row)} // Use the existing handler
            title="Edit Student"
          >
            <FaEdit size={16} /> {/* Consistent icon size */}
          </button>
          <button
            className="text-red-600 hover:text-red-800 p-1" // Added padding
            onClick={() => handleDeleteClick(row)} // Trigger modal via state update
            title="Delete Student"
          >
            <FaTrash size={16} /> {/* Consistent icon size */}
          </button>
        </div>
      ),
    }] : []) // Add empty array if admin page (no action column)
  ];


  // --- Render the Component ---
  return (
    <>
      {/* Container with background, animation, etc. */}
      <div
        className={`bg-white pt-6 mt-10   pb-4 rounded-lg shadow-md opacity-0 translate-y-10 animate-slideInUp transition-all duration-700 mx-4 md:mx-8 lg:mx-12`} // Adjusted padding/margin
      >
        {/* Top Header: Title & Conditional Button */}
        <div className="flex justify-between items-center mb-4 px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Student Details</h2>

          {/* Conditional Button: Add New or Download */}
          {!isAdminPage ? (
            <button
              className="bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-800 transition duration-150 ease-in-out text-sm font-medium shadow-sm"
              onClick={() => navigate("/admin/studentsTable/studentform")} // Assuming this is the correct path
            >
              + Add New Student
            </button>
          ) : (
            <button
              onClick={() => downloadFile("csv", students)}
              disabled={students.length === 0 || isLoading} // Disable if no data or loading
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {/* Using a generic download icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download CSV</span>
            </button>
          )}
        </div>

        {/* --- Table Section --- */}
        {/* Apply container styles like width/margin HERE, not within DataTable */}
        {/* Let DataTable handle overflow scrolling and styling */}
        <div className="px-4 md:px-6">
          <DataTable
            columns={columns}
            data={students}
            isLoading={isLoading} // Pass loading state
            error={error}        // Pass error state
            keyField="_id"      // Specify the unique key field from data
            // wrapperClassName="overflow-x-auto shadow-none sm:rounded-none" // Optional: Override default wrapper if needed
          />
        </div>

      </div> {/* End of main container div */}


      {/* --- Confirm Modal --- */}
      {isModalOpen && selectedStudent && ( // Ensure selectedStudent exists
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => {
              setIsModalOpen(false);
              setSelectedStudent(null); // Clear selection on close
          }}
          onConfirm={handleDeleteConfirm} // Call the delete confirm handler
          title="Confirm Deletion"
          // Use template literal for dynamic message
          message={`Are you sure you want to delete the record for ${selectedStudent.name} (${selectedStudent.rollNo})? This action cannot be undone.`}
        />
      )}
    </>
  );
};

export default StudentTable;
