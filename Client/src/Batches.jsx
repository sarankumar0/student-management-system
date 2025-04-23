import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaArrowUp, FaTrashAlt, FaInfoCircle } from "react-icons/fa";

import { Navigate, useNavigate } from "react-router-dom";
import ConfirmModal from "./components/ConfirmModal";
import { Tooltip } from "react-tooltip";

const BatchTable = ({ students,refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const handleDelete = (student) => {
    console.log("Student to delete:", student);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent || !selectedStudent._id) {
      console.error("No student selected or ID is missing.");
      return;
    }  
    try {
      await axios.delete(`/api/students/${selectedStudent._id}`);
      await axios.post("/api/deletedLogs", {
        studentId: selectedStudent._id,
        name: selectedStudent.name,
        rollNo: selectedStudent.rollNo,
        deletedAt: new Date(),
      });
      refreshData();
      console.log("Student deleted and logged!");
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setIsModalOpen(false);
    }
  };
  return (
    <div className="px-5 overflow-x-auto flex justify-center items-center w-full">
    <div className="w-full overflow-x-auto">
      {students.length > 0 ? (
        <table className="min-w-full border border-gray-300 shadow-lg rounded-xl bg-white text-center">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="p-3 px-5 text-xs sm:text-sm">S.No</th>
              <th className="p-3 px-5 text-xs sm:text-sm">Roll No</th>
              <th className="p-3 px-5 text-xs sm:text-sm">Name</th>
              <th className="p-3 px-5 text-xs sm:text-sm">Email</th>
              <th className="p-3 px-5 text-xs sm:text-sm">Plan</th>
              <th className="p-3 px-5 text-xs sm:text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-200 text-xs sm:text-sm"
              >
                <td className="p-3 px-5">{index + 1}</td>
                <td className="p-3 px-5">{student.rollNo || "N/A"}</td>
                <td className="p-3 px-5">{student.name}</td>
                <td className="p-3 px-5">{student.email || "N/A"}</td>
                <td className="p-3 px-5">{student.plan}</td>
                <td className="p-3 px-5 flex justify-center gap-2 items-center">
  {/* Upgrade Button */}
  <button
    data-tooltip-id="upgrade-tooltip"
    className="bg-blue-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
  >
    <FaArrowUp />
  </button>
  <Tooltip id="upgrade-tooltip" place="top" content="Upgrade Student" />

  {/* Delete Button */}
  <button
    onClick={() => handleDelete(student)}
    data-tooltip-id="delete-tooltip"
    className="bg-red-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
  >
    <FaTrashAlt className="mr-1" />
  </button>
  <Tooltip id="delete-tooltip" place="top" content="Delete Student" />

  {/* Confirm Delete Modal */}
  {isModalOpen && (
        <div className="fixed inset-0 flex items-center h-screen justify-center bg-black bg-opacity-10">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p className="mt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedStudent?.name}</span> from the database?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

  {/* View Button */}
  <button
    data-tooltip-id="view-tooltip"
    className="bg-green-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
  >
    <FaInfoCircle />
  </button>
  <Tooltip id="view-tooltip" place="top" content="View Details" />
</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex justify-center items-center min-h-32">
          <p className="text-gray-500 flex items-center gap-2">
            <span role="img" aria-label="warning">⚠️</span>
            <span>No Students Found</span>
          </p>
        </div>
      )}
    </div>
  </div>
  
  );
};

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const navigate= useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/batches")
      .then((res) => {
        console.log("Fetched Batches:", res.data);

        const formattedBatches = res.data.batches.map((batch) => ({
          name: batch._id || "Unknown Batch",
          students: batch.students
            ? batch.students.map((student) => ({
                name: student.name || "Unknown",
                rollNo: student.registrationNumber || "N/A",
                email: student.email || "N/A",
                plan: student.plan || "Unknown",
              }))
            : [],
        }));

        setBatches(formattedBatches);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch batches. Please try again.");
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-6">⏳ Loading batches...</p>;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;

  // Filter Students Dynamically
  const allStudents = batches.flatMap((batch) => batch.students);
  const filteredStudents =
    selectedBatch === "All"
      ? allStudents
      : allStudents.filter((student) =>
          student.plan.toLowerCase().includes(selectedBatch.toLowerCase())
        );

  // Filtered Search Logic
  const searchedStudents = filteredStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2  ms-4 w-full bg-indigo mt-4 sm:p-8 ">
      <div className="rounded-xl p-4 sm:p-6 mb-8 bg-white translate-y-20 animate-slideInUp transition-all duration-700 ">
      <div className="flex ms-5 flex-col sm:flex-row justify-between items-center mb-4 gap-4">
  {/* Left-aligned Register Students */}
  <div className="text-lg font-semibold text-indigo-700">
    Registered Students
  </div>

  {/* Right-aligned Dropdown and Search */}
  <div className="flex me-5 items-center gap-4">
    <select
      className="w-72 border border-gray-300 rounded-lg pl-3 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition"
      value={selectedBatch}
      onChange={(e) => setSelectedBatch(e.target.value)}
    >
      <option value="All">All</option>
      <option value="Pro">Pro</option>
      <option value="Classic">Classic</option>
      <option value="Basic">Basic</option>
    </select>

    {/* Search Input */}
    <div className="relative w-72">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder="Search Students..."
        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
</div>

        <BatchTable students={searchedStudents} />
      </div>
    </div>
  );
};

export default Batches;



