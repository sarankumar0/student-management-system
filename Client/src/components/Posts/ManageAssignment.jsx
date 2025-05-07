// // src/components/admin/ManageAssignments.jsx
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Link, useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import {
//   faSpinner,
//   faExclamationTriangle,
//   faTrashAlt,
//   faEdit,
//   faPlus,
//   faFileAlt,
//   faCalendarCheck,
//   faTimes,faUsersViewfinder,faFilter
// } from '@fortawesome/free-solid-svg-icons';
// import AssignmentFormModal from './AssignmentFormModal';
// import ConfirmModal from '../ConfirmModal';

// // Badge component
// const AccessTypeBadge = ({ accessType }) => (
//   <span className={`
//     text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
//     ${accessType.toLowerCase() === 'pro' ? 'bg-indigo-600' :
//       accessType.toLowerCase() === 'classic' ? 'bg-purple-500' :
//       accessType.toLowerCase() === 'basic' ? 'bg-teal-500' :
//       'bg-gray-500'
//     }
//   `}>
//     {accessType}
//   </span>
// );

// // Format Date helper
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   try {
//     const options = { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     };
//     return new Date(dateString).toLocaleString(undefined, options);
//   } catch (e) {
//     return 'Invalid Date';
//   }
// };

// function ManageAssignments() {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   // Filter state
//   const [filters, setFilters] = useState({
//     title: '',
//     accessType: 'all',
//     dueDate: ''
//   });

//   // Modal states
//   const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentAssignment, setCurrentAssignment] = useState(null);
//   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
//   const [assignments, setAssignments] = useState([]); // Example state
//   const [filteredAssignments, setFilteredAssignments] = useState([]); // Example state
//   const [filters, setFilters] = useState({ title: '', accessType: 'all', dueDate: '' }); 
//   const [openFilter, setOpenFilter] = useState(null);
//   // Fetch assignments
//   const fetchAssignments = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       console.error("[ManageAssignments] Auth token missing.");
//       setError("Authentication required.");
//       setLoading(false);
//       return;
//     }

//     const config = { headers: { Authorization: `Bearer ${token}` } };

//     try {
//       const response = await axios.get('http://localhost:5000/api/assignments', config);
//       setAssignments(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       console.error("[ManageAssignments] Error fetching assignments:", err);
//       setError(err.response?.data?.message || "Failed to load assignments.");
//       setAssignments([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAssignments();
//   }, [fetchAssignments]);

//   // Filter assignments
//   const filteredAssignments = useMemo(() => {
//     return assignments.filter(assign => {
//       const titleMatch = !filters.title || 
//         assign.title.toLowerCase().includes(filters.title.toLowerCase());
//       const accessTypeMatch = filters.accessType === 'all' || 
//         assign.accessType === filters.accessType;
//       const dueDateMatch = !filters.dueDate || 
//         (assign.dueDate && new Date(assign.dueDate).toISOString().split('T')[0] === filters.dueDate);
      
//       return titleMatch && accessTypeMatch && dueDateMatch;
//     });
//   }, [assignments, filters]);

//   // Filter handlers
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({ title: '', accessType: 'all', dueDate: '' });
//   };

//   // Modal handlers
//   const openCreateModal = () => {
//     setIsEditing(false);
//     setCurrentAssignment(null);
//     setIsAssignmentModalOpen(true);
//   };

//   const openEditModal = (assignment) => {
//     setIsEditing(true);
//     setCurrentAssignment(assignment);
//     setIsAssignmentModalOpen(true);
//   };

//   const openDeleteConfirm = (assignment) => {
//     setCurrentAssignment(assignment);
//     setIsConfirmModalOpen(true);
//   };

//   const closeAssignmentModal = () => setIsAssignmentModalOpen(false);
//   const closeConfirmModal = () => setIsConfirmModalOpen(false);

// const handleFormSubmit = async (formDataPayload) => {
//     setSubmitLoading(true);
//     setError(null);
    
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       toast.error("Authentication required.");
//       setSubmitLoading(false);
//       return;
//     }
  
//     const config = { 
//       headers: { 
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'multipart/form-data'
//       }
//     };
  
//     // Define the URL and method based on whether we're editing
//     const url = isEditing
//       ? `http://localhost:5000/api/assignments/${currentAssignment._id}`
//       : 'http://localhost:5000/api/assignments';
    
//     const method = isEditing ? 'patch' : 'post';
  
//     try {
//       await axios[method](url, formDataPayload, config);
//       toast.success(`Assignment ${isEditing ? 'updated' : 'created'} successfully!`);
//       closeAssignmentModal();
//       fetchAssignments();
//     } catch (err) {
//       console.error(`Error ${isEditing ? 'updating' : 'creating'} assignment:`, err);
//       toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} assignment.`);
//     } finally {
//       setSubmitLoading(false);
//     }
//   };
  
//   const handleDeleteConfirm = async () => {
//     if (!currentAssignment) return;
    
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       toast.error("Authentication required.");
//       return;
//     }
  
//     const config = { headers: { Authorization: `Bearer ${token}` } };
  
//     try {
//       await axios.delete(
//         `http://localhost:5000/api/assignments/${currentAssignment._id}`,
//         config
//       );
//       // Show toast before any state changes that might cause re-render
//       toast.success('Assignment deleted successfully!');
//       // Then update state and fetch new data
//       setCurrentAssignment(null);
//       await fetchAssignments();
//     } catch (err) {
//       console.error(`Error deleting assignment ${currentAssignment._id}:`, err);
//       toast.error(err.response?.data?.message || 'Failed to delete assignment.');
//     } finally {
//       closeConfirmModal();
//     }
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-indigo-600" />
//         <span className="ml-3 text-lg">Loading assignments...</span>
//       </div>
//     );
//   }

//   // Render error state
//   if (error && !isAssignmentModalOpen && !isConfirmModalOpen) {
//     return (
//       <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
//         <div className="flex items-center">
//           <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" />
//           <div>
//             <h3 className="text-sm font-medium text-red-800">Error loading assignments</h3>
//             <p className="text-sm text-red-700 mt-1">{error}</p>
//             <button 
//               onClick={fetchAssignments}
//               className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
//             >
//               Try again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:ms-10  md:p-6">
      
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Assignments</h1>
//         <button
//           onClick={openCreateModal}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
//         >
//           <FontAwesomeIcon icon={faPlus} className="mr-2" />
//           New Assignment
//         </button>
//       </div>
    

//       {/* Filter status */}
//       {(filters.title || filters.accessType !== 'all' || filters.dueDate) && (
//         <div className="mb-3 text-sm text-gray-600 flex items-center justify-end">
//           <span>Filters Applied</span>
//           <button
//             onClick={clearFilters}
//             className="ml-2 text-indigo-600 hover:text-indigo-800 underline flex items-center text-xs"
//           >
//             <FontAwesomeIcon icon={faTimes} className="mr-1" />
//             Clear Filters
//           </button>
//         </div>
//       )}

//       {/* Assignments table */}
//       {assignments.length === 0 && !loading ? (
//         <div className="bg-white rounded-lg shadow p-8 text-center">
//           <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-3" />
//           <h3 className="text-lg font-medium text-gray-900">No assignments created yet</h3>
//           <p className="mt-1 text-sm text-gray-500">
//             Get started by creating a new assignment.
//           </p>
//           <button
//             onClick={openCreateModal}
//             className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
//           >
//             <FontAwesomeIcon icon={faPlus} className="mr-2" />
//             Create Assignment
//           </button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 {/* Title column */}
//                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   <div className="flex flex-col">
//                     <span>Title</span>
//                     <input
//                       type="text"
//                       name="title"
//                       placeholder="Filter..."
//                       value={filters.title}
//                       onChange={handleFilterChange}
//                       className="mt-1 p-1 border border-gray-300 rounded text-xs w-full"
//                     />
//                   </div>
//                 </th>

//                 {/* Access type column */}
//                 <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   <div className="flex flex-col">
//                     <span>Batch Access</span>
//                     <select
//                       name="accessType"
//                       value={filters.accessType}
//                       onChange={handleFilterChange}
//                       className="mt-1 p-1 border border-gray-300 rounded text-xs w-full bg-white"
//                     >
//                       <option value="all">All</option>
//                       <option value="basic">Basic</option>
//                       <option value="classic">Classic</option>
//                       <option value="pro">Pro</option>
//                     </select>
//                   </div>
//                 </th> 

//                 {/* Due date column */}
//                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   <div className="flex flex-col">
//                     <span>Due Date</span>
//                     <input
//                       type="date"
//                       name="dueDate"
//                       value={filters.dueDate}
//                       onChange={handleFilterChange}
//                       className="mt-1 p-1 border border-gray-300 rounded text-xs w-full"
//                     />
//                   </div>
//                 </th>

//                 {/* File column */}
//                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   File
//                 </th>
//                 <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Submissions
//                 </th>

//                 {/* Actions column */}
//                 <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredAssignments.length > 0 ? (
//                 filteredAssignments.map((assign) => (
//                   <tr key={assign._id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3">
//                       <div className="text-sm font-medium text-gray-900">{assign.title}</div>
//                       {assign.description && (
//                         <div className="text-xs text-gray-500 mt-1">
//                           {assign.description.substring(0, 70)}
//                           {assign.description.length > 70 ? '...' : ''}
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-3 py-3 whitespace-nowrap">
//                       <AccessTypeBadge accessType={assign.accessType} />
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                       <FontAwesomeIcon icon={faCalendarCheck} className="mr-1.5 text-green-600" />
//                       {formatDate(assign.dueDate)}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-800">
//                       {assign.fileUrl ? (
//                         <a href={`http://localhost:5000/api/pdfs/download/${assign.fileUrl.split('/').pop()}`} // <-- Use download route, extract filename
//                         target="_blank" // Keep _blank optional
//                         rel="noopener noreferrer"
//                         title={`Download ${assign.title || 'File'}`} 
//                         >
//                           <FontAwesomeIcon icon={faFileAlt} className="mr-1.5" />
//                           Download File
//                         </a>
//                       ) : (
//                         <span className="text-gray-400">No file</span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-center">
//                     <Link
//                          to={`/assignments/${assign._id}/submissions`} // Link to the new review page route
//                          title="View Submissions"
//                          className="text-blue-600 hover:text-blue-900 hover:underline text-sm inline-flex items-center"
//                     >
//                         <FontAwesomeIcon icon={faUsersViewfinder} className="mr-1.5" />
//                         View
//                      </Link>
//                  </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-3">
//                       <button
//                         onClick={() => openEditModal(assign)}
//                         title="Edit Assignment"
//                         className="text-indigo-600 hover:text-indigo-900"
//                       >
//                         <FontAwesomeIcon icon={faEdit} />
//                       </button>
//                       <button
//                         onClick={() => openDeleteConfirm(assign)}
//                         title="Delete Assignment"
//                         className="text-red-600 hover:text-red-900 ml-3"
//                       >
//                         <FontAwesomeIcon icon={faTrashAlt} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="text-center py-6 text-gray-500 italic">
//                     No assignments match the current filters.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Modals */}
//       <AssignmentFormModal
//         isOpen={isAssignmentModalOpen}
//         onClose={closeAssignmentModal}
//         onSubmit={handleFormSubmit}
//         initialData={currentAssignment}
//         isEditing={isEditing}
//         isLoading={submitLoading}
//       />

//       <ConfirmModal
//         isOpen={isConfirmModalOpen}
//         onClose={closeConfirmModal}
//         onConfirm={handleDeleteConfirm}
//         title="Confirm Deletion"
//         message={`Are you sure you want to delete the assignment "${currentAssignment?.title || ''}"?`}
//       />
//     </div>
//   );
// }

// export default ManageAssignments;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  faSpinner,
  faExclamationTriangle,
  faTrashAlt,
  faEdit,
  faPlus,
  faFileAlt,
  faCalendarCheck,
  faTimes,
  faUsersViewfinder,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import AssignmentFormModal from './AssignmentFormModal'; // Adjust path if needed
import ConfirmModal from '../ConfirmModal'; // Adjust path if needed

// Badge component
const AccessTypeBadge = ({ accessType }) => (
  <span className={`
    text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
    ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
      accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
      accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
      'bg-gray-500'
    }
  `}>
    {accessType || 'N/A'}
  </span>
);

// Format Date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("formatDate: Attempted to format an invalid date string:", dateString);
      return 'Invalid Date';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString('en-CA', options);
  } catch (e) {
    console.warn("Exception in formatDate:", dateString, e);
    return 'Invalid Date';
  }
};


function ManageAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // For modal's submit button state
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ title: '', accessType: 'all', dueDate: '' });
  const [openFilter, setOpenFilter] = useState(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const response = await axios.get('http://localhost:5000/api/assignments', config);
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
      let message = "Failed to load assignments.";
      if (err.response) {
        message = err.response.data?.message || `Server error: ${err.response.status}`;
        if (err.response.status === 401 || err.response.status === 403) {
          message = "Authentication failed. Please log in again.";
        }
      } else if (err.request) {
        message = "Network error. Could not connect to the server.";
      }
      setError(message);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removed navigate from dependency array as it's not directly used here

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assign => {
      const titleMatch = !filters.title ||
        assign.title.toLowerCase().includes(filters.title.toLowerCase());
      const accessTypeMatch = filters.accessType === 'all' ||
        assign.accessType?.toLowerCase() === filters.accessType.toLowerCase();
      let dueDateMatch = true;
      if (filters.dueDate) {
        if (!assign.dueDate) {
          dueDateMatch = false;
        } else {
          try {
            const assignmentDate = new Date(assign.dueDate);
            if (isNaN(assignmentDate.getTime())) {
              dueDateMatch = false;
            } else {
              const assignmentDateString = assignmentDate.toISOString().split('T')[0];
              dueDateMatch = assignmentDateString === filters.dueDate;
            }
          } catch (e) { dueDateMatch = false; }
        }
      }
      return titleMatch && accessTypeMatch && dueDateMatch;
    });
  }, [assignments, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const clearFilters = () => { setFilters({ title: '', accessType: 'all', dueDate: '' }); setOpenFilter(null); };
  const toggleFilter = (filterName) => { setOpenFilter(current => (current === filterName ? null : filterName)); };

  const openCreateModal = () => { setIsEditing(false); setCurrentAssignment(null); setIsAssignmentModalOpen(true); };
  const openEditModal = (assignment) => { setIsEditing(true); setCurrentAssignment(assignment); setIsAssignmentModalOpen(true); };
  const openDeleteConfirm = (assignment) => { setCurrentAssignment(assignment); setIsConfirmModalOpen(true); };
  const closeAssignmentModal = () => setIsAssignmentModalOpen(false);
  const closeConfirmModal = () => { setIsConfirmModalOpen(false); setCurrentAssignment(null); };

  // --- UPDATED handleFormSubmit with loading/success/error toasts ---
  const handleFormSubmit = async (formDataPayload) => {
    // Note: Client-side validation (e.g., checking for empty fields and showing toast.warning)
    // should be handled within the AssignmentFormModal.js component before this function is called.
    // This function assumes formDataPayload is validated and ready for API submission.

    setSubmitLoading(true); // For the modal's submit button UI
    setError(null); // Clear previous errors
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      setSubmitLoading(false);
      return;
    }
    
    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
      // Axios will set 'Content-Type': 'multipart/form-data' automatically for FormData
    };
    const url = isEditing ? `http://localhost:5000/api/assignments/${currentAssignment._id}` : 'http://localhost:5000/api/assignments';
    const method = isEditing ? 'patch' : 'post';

    const toastId = toast.loading(isEditing ? "Updating assignment..." : "Creating assignment...", { theme: "colored" });

    try {
      await axios[method](url, formDataPayload, config);
      
      toast.update(toastId, {
        render: `Assignment ${isEditing ? 'updated' : 'created'} successfully!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        theme: "colored"
      });

      closeAssignmentModal();
      fetchAssignments(); // Refresh the list
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} assignment:`, err);
      let errorMsg = `Failed to ${isEditing ? 'update' : 'create'} the assignment.`;
      if (err.response) {
        errorMsg = err.response.data?.message || `Server error (${err.response.status}). Please check the details and try again.`;
      } else if (err.request) {
        errorMsg = "Network error or server not responding. Please check your connection and try again.";
      } else {
        errorMsg = `An unexpected error occurred: ${err.message}`;
      }
      
      toast.update(toastId, {
        render: errorMsg,
        type: 'error',
        isLoading: false,
        autoClose: 5000, // Keep error messages visible longer
        theme: "colored"
      });
    } finally {
      setSubmitLoading(false); // Reset modal's submit button loading state
    }
  };
  // --- END UPDATED handleFormSubmit ---

  const handleDeleteConfirm = async () => {
    if (!currentAssignment) {
        toast.error("Cannot delete assignment: No assignment selected.");
        closeConfirmModal(); return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) { toast.error("Authentication required."); closeConfirmModal(); return; }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { _id: assignmentIdToDelete, title: assignmentTitleToDelete } = currentAssignment;
    const toastId = toast.loading(`Deleting "${assignmentTitleToDelete || 'assignment'}"...`, { theme: "colored" });

    try {
      await axios.delete(`http://localhost:5000/api/assignments/${assignmentIdToDelete}`, config);
      toast.update(toastId, {
          render: `Assignment "${assignmentTitleToDelete || 'Item'}" deleted!`,
          type: 'success', isLoading: false, autoClose: 3000, theme: "colored"
        });
      setAssignments(prev => prev.filter(a => a._id !== assignmentIdToDelete));
    } catch (err) {
      console.error(`Error deleting assignment ${assignmentIdToDelete}:`, err);
      let errorMsg = `Failed to delete "${assignmentTitleToDelete || 'assignment'}".`;
      if (err.response) errorMsg = err.response.data?.message || `Server error (${err.response.status}).`;
      else if (err.request) errorMsg = "Network error or server unreachable.";
      else errorMsg = `Unexpected error: ${err.message}`;
      toast.update(toastId, {
          render: errorMsg, type: 'error', isLoading: false, autoClose: 5000, theme: "colored"
        });
    } finally {
      setCurrentAssignment(null);
      closeConfirmModal();
    }
  };

  // --- Render Loading / Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" />
        <span className="ml-4 text-xl text-gray-700">Loading assignments...</span>
      </div>
    );
  }
  if (error && !isAssignmentModalOpen && !isConfirmModalOpen) {
    return (
      <div className="container mx-auto mt-10 p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md" role="alert">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3 h-6 w-6" />
            <div><p className="font-bold text-lg">An Error Occurred</p><p className="text-sm">{error}</p></div>
          </div>
          <button onClick={fetchAssignments} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Try Again</button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="p-4 md:ms-10 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" newestOnTop />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Assignments</h1>
        <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm" >
          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" /> New Assignment
        </button>
      </div>

      {(filters.title || filters.accessType !== 'all' || filters.dueDate) && (
        <div className="mb-3 text-sm text-gray-600 flex items-center justify-end">
          <span>Filters Applied</span>
          <button onClick={clearFilters} className="ml-2 text-indigo-600 hover:text-indigo-800 underline flex items-center text-xs" >
            <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear Filters
          </button>
        </div>
      )}

      {!loading && !error && assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FontAwesomeIcon icon={faFileAlt} size="3x" className="text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Assignments Yet</h3>
          <p className="text-gray-500 mb-6">Create your first assignment to get started.</p>
          <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center shadow-sm mx-auto">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" /> Create New Assignment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <div className="flex items-center justify-between"><span>Title</span><button onClick={() => toggleFilter('title')} className={`p-1 rounded ${openFilter === 'title' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><FontAwesomeIcon icon={faFilter} size="xs" /></button></div>
                  {openFilter === 'title' && (<div className="absolute top-full left-0 mt-1 z-10 bg-white p-2 rounded shadow-lg border w-48"><input type="text" name="title" placeholder="Filter by title..." value={filters.title} onChange={handleFilterChange} className="p-1 border border-gray-300 rounded text-xs w-full" autoFocus/></div>)}
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <div className="flex items-center justify-between"><span>Batch Access</span><button onClick={() => toggleFilter('accessType')} className={`p-1 rounded ${openFilter === 'accessType' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><FontAwesomeIcon icon={faFilter} size="xs" /></button></div>
                  {openFilter === 'accessType' && (<div className="absolute top-full left-0 mt-1 z-10 bg-white p-2 rounded shadow-lg border w-40"><select name="accessType" value={filters.accessType} onChange={handleFilterChange} className="p-1 border border-gray-300 rounded text-xs w-full bg-white"><option value="all">All</option><option value="basic">Basic</option><option value="classic">Classic</option><option value="pro">Pro</option></select></div>)}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <div className="flex items-center justify-between"><span>Due Date</span><button onClick={() => toggleFilter('dueDate')} className={`p-1 rounded ${openFilter === 'dueDate' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><FontAwesomeIcon icon={faFilter} size="xs" /></button></div>
                  {openFilter === 'dueDate' && (<div className="absolute top-full left-0 mt-1 z-10 bg-white p-2 rounded shadow-lg border w-44"><input type="date" name="dueDate" value={filters.dueDate} onChange={handleFilterChange} className="p-1 border border-gray-300 rounded text-xs w-full"/></div>)}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assign) => (
                  <tr key={assign._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-medium text-gray-900">{assign.title}</div>
                      {assign.description && ( <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={assign.description}>{assign.description}</div> )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap align-middle"><AccessTypeBadge accessType={assign.accessType} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 align-middle"><FontAwesomeIcon icon={faCalendarCheck} className="mr-1.5 text-green-600" /> {formatDate(assign.dueDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm align-middle">
                      {assign.fileUrl ? (<a href={`http://localhost:5000${assign.fileUrl}`} target="_blank" rel="noopener noreferrer" title={`View ${assign.title || 'File'}`} className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center"><FontAwesomeIcon icon={faFileAlt} className="mr-1.5" /> View File</a>) : ( <span className="text-gray-400 italic">No file</span> )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center align-middle">
                      <Link to={`/admin/assignments/${assign._id}/submissions`} title="View Submissions" className="text-blue-600 hover:text-blue-900 hover:underline text-sm inline-flex items-center"><FontAwesomeIcon icon={faUsersViewfinder} className="mr-1.5" /> View</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-3 align-middle">
                      <button onClick={() => openEditModal(assign)} title="Edit Assignment" className="text-indigo-600 hover:text-indigo-900 p-1"><FontAwesomeIcon icon={faEdit} /></button>
                      <button onClick={() => openDeleteConfirm(assign)} title="Delete Assignment" className="text-red-600 hover:text-red-900 p-1"><FontAwesomeIcon icon={faTrashAlt} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-6 text-gray-500 italic">{assignments.length > 0 ? 'No assignments match filters.' : (error ? 'Error loading. Try again.' : 'No assignments.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AssignmentFormModal isOpen={isAssignmentModalOpen} onClose={closeAssignmentModal} onSubmit={handleFormSubmit} initialData={currentAssignment} isEditing={isEditing} isLoading={submitLoading}/>
      <ConfirmModal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} onConfirm={handleDeleteConfirm} title="Confirm Deletion" message={`Delete assignment "${currentAssignment?.title || ''}"? This cannot be undone.`}/>
    </div>
  );
}

export default ManageAssignments;

// export default ManageAssignments;

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Link, useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import {
//   faSpinner,
//   faExclamationTriangle,
//   faTrashAlt,
//   faEdit,
//   faPlus,
//   faFileAlt,
//   faCalendarCheck,
//   faTimes,
//   faUsersViewfinder,
//   faFilter
// } from '@fortawesome/free-solid-svg-icons';
// import AssignmentFormModal from './AssignmentFormModal'; // Adjust path if needed
// import ConfirmModal from '../ConfirmModal'; // Adjust path if needed

// // Badge component (Keep as is)
// const AccessTypeBadge = ({ accessType }) => (
//   <span className={`
//     text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
//     ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
//       accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
//       accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
//       'bg-gray-500' // Default fallback
//     }
//   `}>
//     {accessType || 'N/A'}
//   </span>
// );

// // --- UPDATED Format Date helper ---
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   try {
//     const date = new Date(dateString);

//     if (isNaN(date.getTime())) {
//       console.warn("formatDate: Attempted to format an invalid date string:", dateString);
//       return 'Invalid Date';
//     }

//     const options = {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       timeZone: 'UTC' 
//     };
//     return date.toLocaleDateString('en-CA', options); 
//   } catch (e) {
//     console.warn("Exception in formatDate:", dateString, e);
//     return 'Invalid Date';
//   }
// };
// // --- END UPDATED Format Date helper ---


// function ManageAssignments() {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const [filters, setFilters] = useState({
//     title: '',
//     accessType: 'all',
//     dueDate: ''
//   });
//   const [openFilter, setOpenFilter] = useState(null);

//   const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentAssignment, setCurrentAssignment] = useState(null);
//   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

//   const fetchAssignments = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       setError("Authentication token not found. Please log in.");
//       setLoading(false);
//       // navigate('/login'); // Optional: redirect to login
//       return;
//     }
//     const config = { headers: { Authorization: `Bearer ${token}` } };
//     try {
//       const response = await axios.get('http://localhost:5000/api/assignments', config);
//       setAssignments(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       console.error("Failed to load assignments:", err);
//       let message = "Failed to load assignments.";
//       if (err.response) {
//         message = err.response.data?.message || `Server error: ${err.response.status}`;
//         if (err.response.status === 401 || err.response.status === 403) {
//           message = "Authentication failed. Please log in again.";
//           // navigate('/login'); // Optional: redirect if you have a login route
//         }
//       } else if (err.request) {
//         message = "Network error. Could not connect to the server.";
//       }
//       setError(message);
//       setAssignments([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   useEffect(() => {
//     fetchAssignments();
//   }, [fetchAssignments]);

//   // --- UPDATED Filter assignments ---
//   const filteredAssignments = useMemo(() => {
//     return assignments.filter(assign => {
//       const titleMatch = !filters.title ||
//         assign.title.toLowerCase().includes(filters.title.toLowerCase());
//       const accessTypeMatch = filters.accessType === 'all' ||
//         assign.accessType?.toLowerCase() === filters.accessType.toLowerCase();

//       let dueDateMatch = true; 
//       if (filters.dueDate) { 
//         if (!assign.dueDate) {
//           dueDateMatch = false; 
//         } else {
//           try {
//             const assignmentDate = new Date(assign.dueDate);
//             if (isNaN(assignmentDate.getTime())) {
//               console.warn("Filtering: Invalid dueDate in assignment data:", assign.title, assign.dueDate);
//               dueDateMatch = false; 
//             } else {
//               const assignmentDateString = assignmentDate.toISOString().split('T')[0];
//               dueDateMatch = assignmentDateString === filters.dueDate;
//             }
//           } catch (e) {
//             console.warn("Error processing dueDate for filtering assignment:", assign.title, assign.dueDate, e);
//             dueDateMatch = false; 
//           }
//         }
//       }
//       return titleMatch && accessTypeMatch && dueDateMatch;
//     });
//   }, [assignments, filters]);
//   // --- END UPDATED Filter assignments ---

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({ title: '', accessType: 'all', dueDate: '' });
//     setOpenFilter(null);
//   };

//   const toggleFilter = (filterName) => {
//     setOpenFilter(current => (current === filterName ? null : filterName));
//   };

//   const openCreateModal = () => { setIsEditing(false); setCurrentAssignment(null); setIsAssignmentModalOpen(true); };
//   const openEditModal = (assignment) => { setIsEditing(true); setCurrentAssignment(assignment); setIsAssignmentModalOpen(true); };
//   const openDeleteConfirm = (assignment) => { setCurrentAssignment(assignment); setIsConfirmModalOpen(true); };
//   const closeAssignmentModal = () => setIsAssignmentModalOpen(false);
//   const closeConfirmModal = () => { setIsConfirmModalOpen(false); setCurrentAssignment(null); };

//   const handleFormSubmit = async (formDataPayload) => {
//     setSubmitLoading(true);
//     setError(null);
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       toast.error("Authentication required.");
//       setSubmitLoading(false);
//       return;
//     }
    
//     const config = {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       }
//     };
//     const url = isEditing ? `http://localhost:5000/api/assignments/${currentAssignment._id}` : 'http://localhost:5000/api/assignments';
//     const method = isEditing ? 'patch' : 'post';

//     try {
//       await axios[method](url, formDataPayload, config);
//       toast.success(`Assignment ${isEditing ? 'updated' : 'created'} successfully!`);
//       closeAssignmentModal();
//       fetchAssignments(); 
//     } catch (err) {
//       console.error(`Error ${isEditing ? 'updating' : 'creating'} assignment:`, err);
//       let errorMsg = `Failed to ${isEditing ? 'update' : 'create'} the assignment.`;
//       if (err.response) {
//         errorMsg = err.response.data?.message || `Server error (${err.response.status}). Please check the details and try again.`;
//       } else if (err.request) {
//         errorMsg = "Network error or server not responding. Please check your connection and try again.";
//       } else {
//         errorMsg = `An unexpected error occurred: ${err.message}`;
//       }
//       toast.error(errorMsg, {
//         autoClose: 5000,
//         theme: "colored",
//       });
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     if (!currentAssignment) {
//         console.error("Attempted to delete but currentAssignment is null.");
//         toast.error("Cannot delete assignment: No assignment selected.");
//         closeConfirmModal();
//         return;
//     }

//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       toast.error("Authentication required.");
//       closeConfirmModal();
//       return;
//     }

//     const config = { headers: { Authorization: `Bearer ${token}` } };
//     const assignmentIdToDelete = currentAssignment._id;
//     const assignmentTitleToDelete = currentAssignment.title;

//     const toastId = toast.loading(`Deleting assignment "${assignmentTitleToDelete || 'this assignment'}"...`, { theme: "colored" });

//     try {
//       await axios.delete(`http://localhost:5000/api/assignments/${assignmentIdToDelete}`, config);
//       toast.update(toastId, {
//           render: `Assignment "${assignmentTitleToDelete || 'Item'}" deleted successfully!`,
//           type: 'success',
//           isLoading: false,
//           autoClose: 3000,
//           theme: "colored"
//         });
//       setAssignments(prev => prev.filter(a => a._id !== assignmentIdToDelete));
//     } catch (err) {
//       console.error(`Error deleting assignment ${assignmentIdToDelete}:`, err);
//       let errorMsg = `Failed to delete assignment "${assignmentTitleToDelete || 'this assignment'}".`;
//       if (err.response) {
//         errorMsg = err.response.data?.message || `Server error (${err.response.status}) while deleting.`;
//       } else if (err.request) {
//         errorMsg = "Network error or server unreachable during deletion.";
//       } else {
//         errorMsg = `An unexpected error occurred before sending delete request: ${err.message}`;
//       }
//       toast.update(toastId, {
//           render: errorMsg,
//           type: 'error',
//           isLoading: false,
//           autoClose: 5000,
//           theme: "colored"
//         });
//     } finally {
//       setCurrentAssignment(null); 
//       closeConfirmModal();
//     }
//   };


//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" />
//         <span className="ml-4 text-xl text-gray-700">Loading assignments...</span>
//       </div>
//     );
//   }

//   if (error && !isAssignmentModalOpen && !isConfirmModalOpen) {
//     return (
//       <div className="container mx-auto mt-10 p-4">
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md" role="alert">
//           <div className="flex items-center">
//             <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3 h-6 w-6" />
//             <div>
//               <p className="font-bold text-lg">An Error Occurred</p>
//               <p className="text-sm">{error}</p>
//             </div>
//           </div>
//           <button
//             onClick={fetchAssignments} 
//             className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:ms-10 md:p-6">
//       <ToastContainer position="top-right" autoClose={3000} theme="colored" />

//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Assignments</h1>
//         <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm" >
//           <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" /> New Assignment
//         </button>
//       </div>

//       {(filters.title || filters.accessType !== 'all' || filters.dueDate) && (
//         <div className="mb-3 text-sm text-gray-600 flex items-center justify-end">
//           <span>Filters Applied</span>
//           <button onClick={clearFilters} className="ml-2 text-indigo-600 hover:text-indigo-800 underline flex items-center text-xs" >
//             <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear Filters
//           </button>
//         </div>
//       )}

//       {!loading && !error && assignments.length === 0 ? (
//         <div className="bg-white rounded-lg shadow p-8 text-center">
//           <FontAwesomeIcon icon={faFileAlt} size="3x" className="text-gray-400 mb-4" />
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">No Assignments Yet</h3>
//           <p className="text-gray-500 mb-6">
//             It looks like there are no assignments created. Get started by adding a new one!
//           </p>
//           <button
//             onClick={openCreateModal}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center shadow-sm mx-auto"
//           >
//             <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />  
//           </button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
//                   <div className="flex items-center justify-between">
//                     <span>Title</span>
//                     <button onClick={() => toggleFilter('title')} className={`p-1 rounded ${openFilter === 'title' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
//                       <FontAwesomeIcon icon={faFilter} size="xs" />
//                     </button>
//                   </div>
//                   {openFilter === 'title' && (
//                     <div className="absolute top-full left-0 mt-1 z-10 bg-white p-2 rounded shadow-lg border w-48">
//                       <input
//                         type="text" name="title" placeholder="Filter by title..."
//                         value={filters.title} onChange={handleFilterChange}
//                         className="p-1 border border-gray-300 rounded text-xs w-full"
//                         autoFocus
//                       />
//                     </div>
//                   )}
//                 </th>
//                 <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
//                   <div className="flex items-center justify-between">
//                     <span>Batch Access</span>
//                      <button onClick={() => toggleFilter('accessType')} className={`p-1 rounded ${openFilter === 'accessType' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
//                        <FontAwesomeIcon icon={faFilter} size="xs" />
//                      </button>
//                   </div>
//                   {openFilter === 'accessType' && (
//                     <div className="absolute top-full left-0 mt-1 z-10 bg-white p-2 rounded shadow-lg border w-40">
//                       <select
//                         name="accessType" value={filters.accessType} onChange={handleFilterChange}
//                         className="p-1 border border-gray-300 rounded text-xs w-full bg-white"
//                       >
//                         <option value="all">All</option>
//                         <option value="basic">Basic</option>
//                         <option value="classic">Classic</option>
//                         <option value="pro">Pro</option>
//                       </select>
//                     </div>
//                   )}
//                 </th>
//                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
//                   <div className="flex items-center justify-between">
//                     <span>Due Date</span>
//                     <button onClick={() => toggleFilter('dueDate')} className={`p-1 rounded ${openFilter === 'dueDate' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
//                       <FontAwesomeIcon icon={faFilter} size="xs" />
//                     </button>
//                   </div>
//                   {openFilter === 'dueDate' && (
//                     <div className="absolute top-full left-0 mt-1 z-10 bg-white p-2 rounded shadow-lg border w-44">
//                       <input
//                         type="date" name="dueDate" value={filters.dueDate} onChange={handleFilterChange}
//                         className="p-1 border border-gray-300 rounded text-xs w-full"
//                       />
//                     </div>
//                   )}
//                 </th>
//                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
//                 <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
//                 <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredAssignments.length > 0 ? (
//                 filteredAssignments.map((assign) => (
//                   <tr key={assign._id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 align-top">
//                       <div className="text-sm font-medium text-gray-900">{assign.title}</div>
//                       {assign.description && ( <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={assign.description}>{assign.description}</div> )}
//                     </td>
//                     <td className="px-3 py-3 whitespace-nowrap align-middle"><AccessTypeBadge accessType={assign.accessType} /></td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 align-middle">
//                       <FontAwesomeIcon icon={faCalendarCheck} className="mr-1.5 text-green-600" /> {formatDate(assign.dueDate)}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm align-middle">
//                       {assign.fileUrl ? (
//                         <a href={`http://localhost:5000${assign.fileUrl}`}
//                            target="_blank" rel="noopener noreferrer"
//                            title={`View ${assign.title || 'File'}`}
//                            className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center"
//                         >
//                           <FontAwesomeIcon icon={faFileAlt} className="mr-1.5" /> View File
//                         </a>
//                       ) : ( <span className="text-gray-400 italic">No file</span> )}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-center align-middle">
//                       <Link
//                         to={`/admin/assignments/${assign._id}/submissions`} 
//                         title="View Submissions"
//                         className="text-blue-600 hover:text-blue-900 hover:underline text-sm inline-flex items-center"
//                       >
//                         <FontAwesomeIcon icon={faUsersViewfinder} className="mr-1.5" /> View
//                       </Link>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-3 align-middle">
//                       <button onClick={() => openEditModal(assign)} title="Edit Assignment" className="text-indigo-600 hover:text-indigo-900 p-1"><FontAwesomeIcon icon={faEdit} /></button>
//                       <button onClick={() => openDeleteConfirm(assign)} title="Delete Assignment" className="text-red-600 hover:text-red-900 p-1"><FontAwesomeIcon icon={faTrashAlt} /></button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center py-6 text-gray-500 italic">
//                     {assignments.length > 0 ? 'No assignments match the current filters.' : (error ? 'Error loading assignments. Please try again.' : 'No assignments available.')}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <AssignmentFormModal isOpen={isAssignmentModalOpen} onClose={closeAssignmentModal} onSubmit={handleFormSubmit} initialData={currentAssignment} isEditing={isEditing} isLoading={submitLoading}/>
//       <ConfirmModal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} onConfirm={handleDeleteConfirm} title="Confirm Deletion" message={`Are you sure you want to delete the assignment "${currentAssignment?.title || ''}"? This action cannot be undone.`}/>

//     </div>
//   );
// }

// export default ManageAssignments;