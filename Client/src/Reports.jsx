// src/components/Reports.jsx (or wherever it lives)

import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa"; // Keep react-icons
import { saveAs } from "file-saver"; // Keep file-saver
import Papa from "papaparse"; // Keep papaparse
// Remove useNavigate if not used directly in THIS component anymore
// import { useNavigate } from "react-router-dom";

// *** IMPORT THE REUSABLE COMPONENTS ***
import DataTable from './components/Reusble/DataTable';         // Adjust path as needed
import AccessTypeBadge from './components/Reusble/AccessTypeBadge'; // Adjust path as needed

// Base URL for API (Good practice)
const API_BASE_URL = "http://localhost:5000/api";

const Reports = () => {
  const [batches, setBatches] = useState([]); // Holds the original structured data
  const [allStudents, setAllStudents] = useState([]); // Flattened list for easier filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All"); // Renamed for clarity
  // const navigate = useNavigate(); // Keep if needed for other actions, otherwise remove

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE_URL}/reports`)
      .then((res) => {
        // console.log("Fetched Reports Data:", res.data);

        // Keep original structure if needed elsewhere, otherwise just flatten
        setBatches(res.data.batches || []); // Store original structure

        // Create a flattened list of students with necessary info
        const formattedStudents = (res.data.batches || []).flatMap(batch =>
          (batch.students || []).map(student => ({
            // Ensure unique key potential - combine email/rollNo or use student._id if available
            // Using email as a potential key assuming it's unique
            id: student.email || `${student.registrationNumber}-${student.name}`, // Example unique ID generation
            name: student.name || "Unknown",
            rollNo: student.registrationNumber || "N/A",
            email: student.email || "N/A",
            plan: student.plan || "Unknown", // This will be used by the badge
            // Add other fields if needed
          }))
        );

        setAllStudents(formattedStudents);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch report data. Please try again.");
        console.error("Fetch error:", err);
        setBatches([]);
        setAllStudents([]);
        setLoading(false);
      });
  }, []); // Fetch on component mount

  // Filter Students based on selected plan
  const filteredStudentsByPlan =
    selectedPlan === "All"
      ? allStudents
      : allStudents.filter(student =>
          student.plan.toLowerCase() === selectedPlan.toLowerCase()
        );

  // Filter further based on search term
  const searchedStudents = filteredStudentsByPlan.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) // Added email search
  );

  // Download Handler (remains largely the same)
  const downloadFile = async (format, studentsToDownload) => {
      if (!studentsToDownload || studentsToDownload.length === 0) {
        alert("No student data available to download for the current filters!");
        return;
      }

      // Select and format fields for CSV
       const fields = ["rollNo", "name", "email", "plan"]; // Add/remove fields as needed
       const dataForCsv = studentsToDownload.map(student => {
           const row = {
               'Roll No': student.rollNo,
               'Name': student.name,
               'Email': student.email,
               'Plan': student.plan // Keep plan name, badge is for display only
           };
           return row;
       });


      if (format === "csv") {
        const csv = Papa.unparse(dataForCsv);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `student_report_${selectedPlan}_${new Date().toISOString().slice(0,10)}.csv`); // Dynamic filename
      }
  };

  // --- Define Columns for the DataTable ---
  const columns = [
    {
      header: 'S.No',
      id: 'sno', // Unique ID
      // Use cell renderer for index, centering content
      cell: (_, index) => <div className="text-center">{index + 1}</div>,
      headerClassName: 'text-center', // Center header
    },
    {
      header: 'Roll No',
      accessorKey: 'rollNo',
      // Optional: Add centering if needed via classes
      headerClassName: 'text-center',
      cellClassName: 'text-center text-gray-700',
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cellClassName: 'font-medium text-gray-900', // Make name slightly prominent
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cellClassName: 'text-gray-600',
    },
    {
      header: 'Plan',
      accessorKey: 'plan', // Data is still the plan name ('Basic', 'Classic', etc.)
      headerClassName: 'text-center',
      // Use cell renderer to display the AccessTypeBadge
      cell: (row) => (
          <div className="flex justify-center"> {/* Center the badge */}
              <AccessTypeBadge accessType={row.plan} />
          </div>
      ),
    },
    // No 'Action' column in this table based on original code
  ];

  // --- Render Logic ---

  // Show loading indicator
  if (loading) {
      return <div className="p-6 text-center text-gray-600">⏳ Loading report data...</div>;
  }

  // Show error message
  if (error) {
      return <div className="p-6 text-center text-red-600 bg-red-50 rounded-md">{error}</div>;
  }

  // Render the main content
  return (
    // Adjust main container padding/margin as needed
    <div className="p-4 sm:p-6 mt-5 ms-5 lg:p-8">
      {/* Outer card container with animation */}
      <div className="rounded-xl p-4 sm:p-6 bg-white shadow-lg opacity-0 translate-y-10 animate-slideInUp transition-all duration-700">
          {/* Header Section: Title, Filters, Search, Download */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-2">
              {/* Left: Title */}
              <div className="text-lg font-semibold text-indigo-800">
                Student Registration Report
              </div>

              {/* Right: Controls */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4">
                  {/* Plan Dropdown */}
                  <select
                    className="w-full sm:w-auto border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition bg-white"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    aria-label="Filter by plan"
                  >
                    <option value="All">All Plans</option>
                    <option value="Pro">Pro</option>
                    <option value="Classic">Classic</option>
                    <option value="Basic">Basic</option>
                    {/* Add other plans dynamically if needed */}
                  </select>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-60 lg:w-72">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14}/>
                    <input
                      type="text"
                      placeholder="Search Name, Roll No, Email..."
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search students"
                    />
                  </div>

                  {/* Download Button with Tooltip */}
                  <div className="relative group">
                    <button
                      onClick={() => downloadFile("csv", searchedStudents)}
                      disabled={searchedStudents.length === 0} // Disable if no data to download
                      className="flex items-center space-x-2 px-3 py-2 border border-transparent rounded-lg shadow-sm bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                      title="Download filtered data as CSV" // Added title attribute for accessibility
                    >
                      {/* Simple download icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download CSV</span>
                    </button>
              
                    <div className="absolute z-10 -top-9 left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Download filtered students
                    </div> 
                </div>
              </div>
          </div> {/* End of Header Section */}


          {/* --- DataTable Section --- */}
          {/* DataTable will handle its own styling and 'No Data' message */}
          <div className="mt-4">
              <DataTable
                  columns={columns}
                  data={searchedStudents} // Pass the final filtered/searched data
                  isLoading={loading}    // Let DataTable know if parent is loading (optional redundancy)
                  // error={error}       // Error is handled above, no need to pass here
                  keyField="id"           // Use the unique ID we generated
                  // Use default wrapper, or customize:
                  wrapperClassName="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200"
              />
          </div>

      </div> {/* End of outer card container */}
    </div> // End of main container
  );
};

export default Reports;