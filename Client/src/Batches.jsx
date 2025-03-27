// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaArrowUp, FaTrashAlt, FaSearch, FaHome, FaInfoCircle } from "react-icons/fa";

// const BatchTable = ({ batchName, students, color }) => {
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [studentToDelete, setStudentToDelete] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const handleDelete = (student) => {
//     setStudentToDelete(student);
//     setShowDeleteModal(true);
//   };

//   const handleViewDetails = (student) => {
//     setSelectedStudent(student);
//     setShowDetailsModal(true);
//   };

//   const DeleteModal = ({ isOpen, onClose, onConfirm, student }) => {
//     if (!isOpen) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//         <div className="bg-white p-6 rounded-lg">
//           <p>Are you sure you want to delete {student?.name}?</p>
//           <div className="flex justify-center gap-2 mt-4">
//             <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={onClose}>
//               Cancel
//             </button>
//             <button
//               className="bg-red-500 text-white px-4 py-2 rounded-lg"
//               onClick={() => {
//                 onConfirm(student);
//                 onClose();
//               }}
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const DetailsModal = ({ isOpen, onClose, student }) => {
//     if (!isOpen) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//         <div className="bg-white p-6 rounded-lg">
//           {student && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">{student.name} Details</h2>
//               <p>Roll No: {student.rollNo}</p>
//               <p>Email: {student.email}</p>
//               <p>Plan: {student.plan}</p>
//             </div>
//           )}
//           <button className="mt-4 bg-gray-300 px-4 py-2 rounded-lg" onClick={onClose}>
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="mt- mx-4 sm:mx-8  md:mx-16 lg:mx-24 bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8 border border-gray-200">
//       <h2 className={`text-2xl sm:text-2xl font-semibold mb-4 text-${color}-600`}>
//         {batchName} Batch - {students.length} Students
//       </h2>

//       <div className="px-5 overflow-x-auto ustify-center items-center">
//         {students.length > 0 ? (
//           <table className="w-full border border-gray-300 shadow-lg rounded-xl bg-white">
//             <thead>
//               <tr className="bg-indigo-900 text-white text-center">
//                 <th className="p-3 px-5 sm:p-3">S.No</th>
//                 <th className="p-3 px-5 sm:p-3">Roll No</th>
//                 <th className="p-3 px-5 sm:p-3">Name</th>
//                 <th className="p-3 px-5 sm:p-3">Email</th>
//                 <th className="p-3 px-5 sm:p-3">Plan</th>
//                 <th className="p-3 px-5 sm:p-3">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((student, index) => (
//                 <tr key={index} className="border-b hover:bg-gray-200 text-sm sm:text-base">
//                   <td className="p-3 px-5 sm:p-3">{index + 1}</td>
//                   <td className="p-3 px-5 sm:p-3">{student.rollNo || "N/A"}</td>
//                   <td className="p-3 px-5 sm:p-3">{student.name}</td>
//                   <td className="p-3 px-5 sm:p-3">{student.email || "N/A"}</td>
//                   <td className="p-3 px-5 sm:p-3">{student.plan}</td>
//                   <td className="p-3 px-6 flex gap-2 items-center">
//                     <button
//                       className="bg-blue-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
//                     >
//                       <FaArrowUp />
//                     </button>
//                     <button
//                       className="bg-red-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
//                       onClick={() => handleDelete(student)}
//                     >
//                       <FaTrashAlt />
//                     </button>
//                     <button
//                       className="bg-green-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
//                       onClick={() => handleViewDetails(student)}
//                     >
//                       <FaInfoCircle />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//             <div className="flex justify-center items-center min-h-32">
//   <p className="text-center text-gray-500 flex items-center gap-2">
//     <span role="img" aria-label="warning">⚠️</span>
//     <span>Students not yet registered</span>
//   </p>
// </div>

          
//         )}
//       </div>
//       <DeleteModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={(student) => {
//           /* Delete logic here */
//         }}
//         student={studentToDelete}
//       />
//       <DetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} student={selectedStudent} />
//     </div>
//   );
// };

// const Batches = () => {
//   const [batches, setBatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/batches")
//       .then((res) => {
//         console.log("Fetched Batches:", res.data);

//         const formattedBatches = res.data.batches.map((batch) => ({
//           name: batch._id || "Unknown Batch",
//           students: batch.students
//             ? batch.students.map((student) => ({
//                 name: student.name || "Unknown",
//                 rollNo: student.registrationNumber || "N/A",
//                 email: student.email || "N/A",
//                 plan: student.plan || "Unknown",
//               }))
//             : [],
//         }));

//         setBatches(formattedBatches);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError("Failed to fetch batches. Please try again.");
//         console.error(err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p className="text-center mt-6">⏳ Loading batches...</p>;
//   if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;

//   const filteredBatches = batches.map((batch) => ({
//     ...batch,
//     students: batch.students.filter(
//       (student) =>
//         student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
//     ),
//   }));

//   const proBatch = filteredBatches.find((batch) => batch.name.toLowerCase().includes("pro")) || { students: [] };
//   const classicBatch = filteredBatches.find((batch) => batch.name.toLowerCase().includes("classic")) || { students: [] };
//   const basicBatch = filteredBatches.find((batch) => batch.name.toLowerCase().includes("basic")) || { students: [] };

//   return (
//     <div className="p-6 ms-5 w-full bg-indigo-100 mt-4 sm:p-8">
//       <div className="rounded-xl p-4 sm:p-6 mb-8">
//         {/* Search & Button Container */}
//         <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-4">
//           {/* Search Input */}
//           <div className="relative w-72 mx-4">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Search Students..."
//               className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>

//           {/* Move to Dashboard Button */}
//           <button className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition">
//             <FaHome className="text-lg" /> Move to Dashboard
//           </button>
//         </div>
//         <BatchTable batchName="Pro" students={proBatch.students} color="purple" />
//         <BatchTable batchName="Classic" students={classicBatch.students} color="green" />
//         <BatchTable batchName="Basic" students={basicBatch.students} color="blue" />
//       </div>
//     </div>
//   );
// };

// export default Batches;

import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaHome, FaArrowUp, FaTrashAlt, FaInfoCircle } from "react-icons/fa";
import Breadcrumbs from "./components/Breadcrumbs";
import { Navigate, useNavigate } from "react-router-dom";
import ConfirmModal from "./components/ConfirmModal";

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
                  <button className="bg-blue-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm">
                    <FaArrowUp />
                  </button>
                  <button
  onClick={() => handleDelete(student)}
  className="bg-red-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm"
>
  <FaTrashAlt className="mr-1" />
</button>

                  <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedStudent?.name}?`}
      />
                  <button className="bg-green-500 text-white p-2 rounded-lg flex items-center text-xs sm:text-sm">
                    <FaInfoCircle />
                  </button>
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
    <div className="p-6 ms-6 w-full bg-indigo mt-4 sm:p-8 ">
      <div className="rounded-xl p-4 sm:p-6 mb-8 bg-white translate-y-20 animate-slideInUp transition-all duration-700 ">
        {/* Dropdown and Search Container */}
        {/* <Breadcrumbs /> */}
        <div className="flex flex-col sm:flex-row  justify-end items-center mb-4 gap-4 ">
          {/* Dropdown for Batches */}
          <select
            className="w-72 border mx-2 border-gray-300 rounded-lg pl-3 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition"
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

          {/* Move to Dashboard Button */}
          {/* <button onClick={() => navigate("/admin")} className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition">
            <FaHome className="text-lg" /> Move to Dashboard
          </button>
*/}
        </div> 
        {/* Single Batch Table with Filtered Data */}
        <BatchTable students={searchedStudents} />
      </div>
    </div>
  );
};

export default Batches;



