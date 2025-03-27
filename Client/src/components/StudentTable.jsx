// import { useState, useEffect } from "react";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import ConfirmModal from "./ConfirmModal";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Breadcrumbs from "./Breadcrumbs";
// const StudentTable = ({show,width,pageType,downloadFile}) => {
// const navigate = useNavigate();
// const [students, setStudents] = useState([]);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);


// const fetchData = () => {
//   axios.get("http://localhost:5000/api/students")
//     .then((response)=>setStudents(response.data))
//     .catch((error)=>console.error("Error fetching: ",error))
// }
//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Function to delete student
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/students/${id}`);
  
//       alert("Student deleted successfully!");
//       fetchData();
//     } catch (error) {
//       console.error("Error deleting student:", error);
//       alert("Failed to delete student. Please try again.");
//     }
  
//     setIsModalOpen(false);
//   };
//   const handleEdit = (student) => {
//     navigate("/admin/StudentForm", { state: { student } }); // Pass student data
//   };
  
  
//   return (
//     <>
// <div className={`bg-white pt-10 rounded-lg shadow-md mt-3 opacity-0 translate-y-20 animate-slideInUp transition-all duration-700 ${width ? 'ms-15' : 'ms-16'}`}>
//       <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold ms-6">Student Details</h2>
//           <button
//             className={`bg-indigo-900 text-white px-4 py-2 mr-3 ml-3 rounded-md hover:px-6  ${show ? 'hidden' : 'block'}`}
//             onClick={() => navigate("/admin/StudentForm")}
//           >
//             + Add New
//           </button>
//         </div>

//         <table className="w-[98%] mx-4 border-collapse border border-gray-200">
//           <thead>
//             <tr className="bg-indigo-900 text-white">
//               <th className="py-3 px-10 border">S.No</th>
//               <th className="py-3 px-10 border">Roll No</th>
//               <th className="py-3 px-10 border">Name</th>
//               <th className="py-3 px-10 border">Department</th>
//               <th className="py-3 px-10 border">Email</th>
//               <th className="py-3 px-10 border">Phone</th>
//               <th className="py-3 px-10 border">Marks (%)</th>
//               <th className="py-3 px-10 border">Enrollment Date</th>
//               <th className="py-3 px-10 border">
//               {pageType && pageType  === "AdminPage" ? "Download" : "Action"}
//             </th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.length > 0 ? (
//               students.map((student, index) => (
//                 <tr key={student._id || index } className="hover:bg-gray-300 transition">
//                   <td className="py-3 border text-center">{index + 1}</td>
//                   <td className="py-3 border text-center">{student.rollNo}</td>
//                   <td className="py-3 border text-center">{student.name}</td>
//                   <td className="py-3 border text-center">{student.department}</td>
//                   <td className="py-3 border text-center">{student.email}</td>
//                   <td className="py-3 border text-center">{student.phone}</td>
//                   <td className="py-3 border text-center">{student.marks}%</td>
//                   <td className="py-3 border text-center">{student.enrollmentDate}</td>
//                   <td className="py-7 border text-center flex justify-center space-x-2">
//                      {pageType && pageType === "admin" ? ( 
//                   <>
//                   <button className=" text-gray-700 px-1 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition">
//                   </button>
//                   <div className="flex space-x-2">
//                     <button
//                      onClick={() => downloadFile("csv", students)}
//                   className="flex items-center space-x-2 px-4 py-1 bg-white  border border-gray-300 rounded-lg shadow hover:bg-indigo-300 transition-colors"
//                    >
//            <i className="fas fa-file-excel text-green-500"></i>
//            <span className="text-sm text-gray-700">Excel</span>
//          </button>
//        </div>
//                   </>
//                     ) : (
//                       <>
//                      <button className="text-blue-500 hover:text-blue-700" onClick={() => navigate("/admin/StudentForm", { state: { student } })}>
//                        <FaEdit size={18} />
//                      </button>
//                      <button className="text-red-500 hover:text-red-700" onClick={() => console.log("Delete", student)}>
//                       <FaTrash size={18} />
//                      </button>
//                      </>
//                        )}
//                     </td>
//                   </tr>
//             ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className="text-center py-4">No students found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {isModalOpen && (
//         <ConfirmModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           onConfirm={() => handleDelete(selectedStudent._id)}
//           title="Confirm Deletion"
//           message={`Are you sure you want to delete ${selectedStudent.name}'s record?`}
//         />
//       )}
//     </>
//   );
// };

// export default StudentTable;

import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const StudentTable = ({ downloadFile }) => {
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

  // Determine Page Type Based on URL
  const isAdminPage = location.pathname === "/admin";

  return (
    <>
      {/* Table Container */}
      <div
        className={`bg-white pt-10 rounded-lg shadow-md mt-3 opacity-0 translate-y-20 animate-slideInUp transition-all duration-700 ms-16`}
      >
        {/* Top Header: Title & Add Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold ms-6">Student Details</h2>

          {/* Add New Button: Only Visible on Student Page */}
          {!isAdminPage && (
            <button
              className="bg-indigo-900 text-white px-4 py-2 mr-3 ml-3 rounded-md hover:px-6"
              onClick={() => navigate("/admin/StudentForm")}
            >
              + Add New
            </button>
          )}
        </div>

        {/* Table Section */}
        <table className="w-[98%] mx-4 border-collapse border border-gray-200">
          <thead>
            <tr className="bg-indigo-900 text-white">
              <th className="py-3 px-10 border">S.No</th>
              <th className="py-3 px-10 border">Roll No</th>
              <th className="py-3 px-10 border">Name</th>
              <th className="py-3 px-10 border">Department</th>
              <th className="py-3 px-10 border">Email</th>
              <th className="py-3 px-10 border">Phone</th>
              <th className="py-3 px-10 border">Marks (%)</th>
              <th className="py-3 px-10 border">Enrollment Date</th>
              <th className="py-3 px-10 border">
                {isAdminPage ? "Download" : "Action"}
              </th>
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
                  <td className="py-3 border text-center">{index + 1}</td>
                  <td className="py-3 border text-center">{student.rollNo}</td>
                  <td className="py-3 border text-center">{student.name}</td>
                  <td className="py-3 border text-center">
                    {student.department}
                  </td>
                  <td className="py-3 border text-center">{student.email}</td>
                  <td className="py-3 border text-center">{student.phone}</td>
                  <td className="py-3 border text-center">{student.marks}%</td>
                  <td className="py-3 border text-center">
                    {student.enrollmentDate}
                  </td>

                  {/* Action / Download Section */}
                  <td className="py-3 border text-center flex justify-center space-x-2">
                    {isAdminPage ? (
                      <button
                        onClick={() => downloadFile("csv", students)}
                        className="flex items-center space-x-2 px-4 py-1 bg-white border border-gray-300 rounded-lg shadow hover:bg-indigo-300 transition-colors"
                      >
                        <i className="fas fa-file-excel text-green-500"></i>
                        <span className="text-sm text-gray-700">Excel</span>
                      </button>
                    ) : (
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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


