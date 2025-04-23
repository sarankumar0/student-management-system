// src/components/admin/ManageAssignments.jsx
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
  faTimes,faUsersViewfinder
} from '@fortawesome/free-solid-svg-icons';
import AssignmentFormModal from './AssignmentFormModal';
import ConfirmModal from '../ConfirmModal';

// Badge component
const AccessTypeBadge = ({ accessType }) => (
  <span className={`
    text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
    ${accessType.toLowerCase() === 'pro' ? 'bg-indigo-600' :
      accessType.toLowerCase() === 'classic' ? 'bg-purple-500' :
      accessType.toLowerCase() === 'basic' ? 'bg-teal-500' :
      'bg-gray-500'
    }
  `}>
    {accessType}
  </span>
);

// Format Date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  } catch (e) {
    return 'Invalid Date';
  }
};

function ManageAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState({
    title: '',
    accessType: 'all',
    dueDate: ''
  });

  // Modal states
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("[ManageAssignments] Auth token missing.");
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const response = await axios.get('http://localhost:5000/api/assignments', config);
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("[ManageAssignments] Error fetching assignments:", err);
      setError(err.response?.data?.message || "Failed to load assignments.");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assign => {
      const titleMatch = !filters.title || 
        assign.title.toLowerCase().includes(filters.title.toLowerCase());
      const accessTypeMatch = filters.accessType === 'all' || 
        assign.accessType === filters.accessType;
      const dueDateMatch = !filters.dueDate || 
        (assign.dueDate && new Date(assign.dueDate).toISOString().split('T')[0] === filters.dueDate);
      
      return titleMatch && accessTypeMatch && dueDateMatch;
    });
  }, [assignments, filters]);

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ title: '', accessType: 'all', dueDate: '' });
  };

  // Modal handlers
  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setIsEditing(true);
    setCurrentAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  const openDeleteConfirm = (assignment) => {
    setCurrentAssignment(assignment);
    setIsConfirmModalOpen(true);
  };

  const closeAssignmentModal = () => setIsAssignmentModalOpen(false);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  // CRUD operations
//   const handleFormSubmit = async (formDataPayload) => {
//     setSubmitLoading(true);
//     setError(null);
    
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       setError("Authentication required.");
//       setSubmitLoading(false);
//       return;
//     }

//     const config = { 
//       headers: { 
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'multipart/form-data'
//       }
//     };

//     const url = isEditing
//       ? `http://localhost:5000/api/assignments/${currentAssignment._id}`
//       : 'http://localhost:5000/api/assignments';
    
//     const method = isEditing ? 'patch' : 'post';

//     try {
//       const response = await axios[method](url, formDataPayload, config);
//       toast.success(`Assignment ${isEditing ? 'updated' : 'created'} successfully!`);
//       closeAssignmentModal();
//       fetchAssignments();
//     } catch (err) {
//       console.error(`Error ${isEditing ? 'updating' : 'creating'} assignment:`, err);
//       setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} assignment.`);
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     if (!currentAssignment) return;
//     closeConfirmModal();
    
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       setError("Authentication required.");
//       return;
//     }

//     const config = { headers: { Authorization: `Bearer ${token}` } };

//     try {
//       await axios.delete(
//         `http://localhost:5000/api/assignments/${currentAssignment._id}`,
//         config
//       );
//       toast.success('Assignment deleted successfully!');
//       fetchAssignments();
//     } catch (err) {
//       console.error(`Error deleting assignment ${currentAssignment._id}:`, err);
//       setError(err.response?.data?.message || 'Failed to delete assignment.');
//       toast.error(err.response?.data?.message || 'Operation failed');
//     } finally {
//       setCurrentAssignment(null);
//     }
//   };

const handleFormSubmit = async (formDataPayload) => {
    setSubmitLoading(true);
    setError(null);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication required.");
      setSubmitLoading(false);
      return;
    }
  
    const config = { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };
  
    // Define the URL and method based on whether we're editing
    const url = isEditing
      ? `http://localhost:5000/api/assignments/${currentAssignment._id}`
      : 'http://localhost:5000/api/assignments';
    
    const method = isEditing ? 'patch' : 'post';
  
    try {
      await axios[method](url, formDataPayload, config);
      toast.success(`Assignment ${isEditing ? 'updated' : 'created'} successfully!`);
      closeAssignmentModal();
      fetchAssignments();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} assignment:`, err);
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} assignment.`);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentAssignment) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication required.");
      return;
    }
  
    const config = { headers: { Authorization: `Bearer ${token}` } };
  
    try {
      await axios.delete(
        `http://localhost:5000/api/assignments/${currentAssignment._id}`,
        config
      );
      // Show toast before any state changes that might cause re-render
      toast.success('Assignment deleted successfully!');
      // Then update state and fetch new data
      setCurrentAssignment(null);
      await fetchAssignments();
    } catch (err) {
      console.error(`Error deleting assignment ${currentAssignment._id}:`, err);
      toast.error(err.response?.data?.message || 'Failed to delete assignment.');
    } finally {
      closeConfirmModal();
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-indigo-600" />
        <span className="ml-3 text-lg">Loading assignments...</span>
      </div>
    );
  }

  // Render error state
  if (error && !isAssignmentModalOpen && !isConfirmModalOpen) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading assignments</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchAssignments}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:ms-10  md:p-6">
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Assignments</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          New Assignment
        </button>
      </div>
      <button 
  onClick={() => toast.success("Test toast!")}
  className="bg-blue-500 text-white p-2 rounded"
>
  Test Toast
</button>

      {/* Filter status */}
      {(filters.title || filters.accessType !== 'all' || filters.dueDate) && (
        <div className="mb-3 text-sm text-gray-600 flex items-center justify-end">
          <span>Filters Applied</span>
          <button
            onClick={clearFilters}
            className="ml-2 text-indigo-600 hover:text-indigo-800 underline flex items-center text-xs"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-1" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Assignments table */}
      {assignments.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No assignments created yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new assignment.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {/* Title column */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <span>Title</span>
                    <input
                      type="text"
                      name="title"
                      placeholder="Filter..."
                      value={filters.title}
                      onChange={handleFilterChange}
                      className="mt-1 p-1 border border-gray-300 rounded text-xs w-full"
                    />
                  </div>
                </th>

                {/* Access type column */}
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <span>Batch Access</span>
                    <select
                      name="accessType"
                      value={filters.accessType}
                      onChange={handleFilterChange}
                      className="mt-1 p-1 border border-gray-300 rounded text-xs w-full bg-white"
                    >
                      <option value="all">All</option>
                      <option value="basic">Basic</option>
                      <option value="classic">Classic</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                </th> 

                {/* Due date column */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <span>Due Date</span>
                    <input
                      type="date"
                      name="dueDate"
                      value={filters.dueDate}
                      onChange={handleFilterChange}
                      className="mt-1 p-1 border border-gray-300 rounded text-xs w-full"
                    />
                  </div>
                </th>

                {/* File column */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>

                {/* Actions column */}
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assign) => (
                  <tr key={assign._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{assign.title}</div>
                      {assign.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {assign.description.substring(0, 70)}
                          {assign.description.length > 70 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <AccessTypeBadge accessType={assign.accessType} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <FontAwesomeIcon icon={faCalendarCheck} className="mr-1.5 text-green-600" />
                      {formatDate(assign.dueDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-800">
                      {assign.fileUrl ? (
                        <a
                          href={`http://localhost:5000${assign.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                           title="View/Download File"
                          className="flex items-center"
                        >
                          <FontAwesomeIcon icon={faFileAlt} className="mr-1.5" />
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Link
                         to={`/assignments/${assign._id}/submissions`} // Link to the new review page route
                         title="View Submissions"
                         className="text-blue-600 hover:text-blue-900 hover:underline text-sm inline-flex items-center"
                    >
                        <FontAwesomeIcon icon={faUsersViewfinder} className="mr-1.5" />
                        View
                     </Link>
                 </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-3">
                      <button
                        onClick={() => openEditModal(assign)}
                        title="Edit Assignment"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(assign)}
                        title="Delete Assignment"
                        className="text-red-600 hover:text-red-900 ml-3"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                    No assignments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AssignmentFormModal
        isOpen={isAssignmentModalOpen}
        onClose={closeAssignmentModal}
        onSubmit={handleFormSubmit}
        initialData={currentAssignment}
        isEditing={isEditing}
        isLoading={submitLoading}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the assignment "${currentAssignment?.title || ''}"?`}
      />
    </div>
  );
}

export default ManageAssignments;