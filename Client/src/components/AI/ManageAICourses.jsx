// src/components/admin/ManageAICourses.jsx (New File)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faTrashAlt, faEdit, faPlus, faEye, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../ConfirmModal'; // Import confirmation modal
// Import the Badge if needed/defined elsewhere
// import AccessTypeBadge from './AccessTypeBadge';

// Reusable Badge Component (if not imported)
const AccessTypeBadge = ({ accessType }) => (
     <span className={`inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize font-medium leading-none ${ accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' : accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' : accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' : 'bg-gray-500' }`}>
        {accessType || 'N/A'}
    </span>
);

// Format Date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'}); }
    catch (e) { return 'Invalid Date'; }
};

function ManageAICourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // State for confirmation modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null); // Store { id, title }

    // --- Fetch Courses ---
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) { setError("Authentication required."); setLoading(false); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            // Use the correct endpoint for listing AI courses
            const response = await axios.get('http://localhost:5000/api/ai-courses', config);
            console.log("Fetched AI courses:", response.data);
            // Expect response like { courses: [...] } or just [...] - adjust accordingly
            setCourses(response.data.courses || response.data || []);
        } catch (err) {
            console.error("Error fetching AI courses:", err);
            setError(err.response?.data?.message || "Failed to load courses.");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // --- Delete Handlers ---
    const openDeleteConfirm = (id, title) => {
        setCourseToDelete({ id, title });
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setCourseToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!courseToDelete) return;
        closeConfirmModal(); // Close first
        // Optionally set a specific deleting state if needed
        const token = localStorage.getItem('authToken');
        if (!token) { alert("Authentication error."); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const response = await axios.delete(`http://localhost:5000/api/ai-courses/${courseToDelete.id}`, config);
            alert(response.data.message || 'Course deleted successfully!');
            fetchCourses(); // Refresh list
        } catch (err) {
            console.error(`Error deleting course ${courseToDelete.id}:`, err);
            alert(err.response?.data?.message || 'Failed to delete course.');
        } finally {
             setCourseToDelete(null); // Clear selection
         }
    };

    // --- Edit Handler (Navigate to Generator in Edit Mode) ---
    const handleEditCourse = (courseId) => {
        console.log(`Navigate to edit AI course: ${courseId}`);
        // Navigate to the generator/editor component, passing the ID in state
        // Assuming the generator route is '/admin/settings/ai-generator'
        navigate('/admin/ai-tools/course-generator', { state: { editCourseId: courseId } });
        // **IMPORTANT**: The AICourseOutlineGenerator component needs to be updated
        // to check location.state for 'editCourseId', fetch the course data using
        // GET /api/ai-courses/:id, and pre-fill the editor state.
    };

    // --- Toggle Status Handler (Placeholder for PATCH call) ---
     const handleToggleStatus = async (courseId, currentStatus) => {
         const newStatus = currentStatus === 'published' ? 'draft' : 'published';
         // alert(`TODO: Update course ${courseId} status to ${newStatus} via PATCH /api/ai-courses/${courseId}`);

         const token = localStorage.getItem('authToken');
         if (!token) { alert("Auth error"); return; }
         const config = { headers: { Authorization: `Bearer ${token}` } };
         const payload = { status: newStatus }; // Only send the status field

         try {
             await axios.patch(`http://localhost:5000/api/ai-courses/${courseId}`, payload, config);
             // Update local state immediately for better UX
             setCourses(prev => prev.map(c => c._id === courseId ? { ...c, status: newStatus } : c));
             alert(`Course status changed to ${newStatus}`);
         } catch (err) {
              console.error(`Error updating status for course ${courseId}:`, err);
              alert(err.response?.data?.message || 'Failed to update status.');
          }
      };


    // --- Render Logic ---
    if (loading) { return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /> Loading Courses...</div>; }
    if (error) { return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>; }

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                     Manage AI-Generated Courses
                 </h1>
                 {/* Link/Button back to the generator page */}
                 <button
                     onClick={() => navigate('/admin/ai-tools/course-generator')} // Navigate to generator
                     className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 >
                     <FontAwesomeIcon icon={faPlus} className="-ml-1 mr-2 h-5 w-5" />
                     Create New AI Course
                 </button>
             </div>

             {/* TODO: Add Filters maybe? (By Status, AccessType) */}

             {/* Courses List/Table */}
             {courses.length === 0 ? (
                 <p className="text-gray-500 italic text-center py-6">No AI-generated courses found.</p>
             ) : (
                 <div className="bg-white rounded-lg shadow overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-100">
                       <tr>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Access</th>
                            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                           <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                           <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                       {courses.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 whitespace-nowrap">
                                <img
                                    src={`http://localhost:5000${course.thumbnailUrl || '/uploads/course_thumbnails/default_course.png'}`}
                                    alt="Thumbnail"
                                    className="h-10 w-16 object-cover rounded"
                                    onError={(e) => { e.target.onerror = null; e.target.src='/uploads/course_thumbnails/default_course.png'; }}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                {course.description && <div className="text-xs text-gray-500 mt-1">{course.description.substring(0, 70)}{course.description.length > 70 ? '...' : ''}</div>}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                                <AccessTypeBadge accessType={course.accessType} />
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                <button onClick={() => handleToggleStatus(course._id, course.status)} title={`Click to toggle status (Currently: ${course.status})`}>
                                    <FontAwesomeIcon
                                        icon={course.status === 'published' ? faToggleOn : faToggleOff}
                                        className={`w-6 h-6 ${course.status === 'published' ? 'text-green-500' : 'text-gray-400'}`}
                                    />
                                </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(course.createdAt)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                <button onClick={() => handleEditCourse(course._id)} title="Edit Course" className="text-indigo-600 hover:text-indigo-900">
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button onClick={() => openDeleteConfirm(course._id, course.title)} title="Delete Course" className="text-red-600 hover:text-red-900">
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </td>
                        </tr>
                   ))}
                </tbody>
                     </table>
                 </div>
             )}

             {/* Render Confirmation Modal */}
             <ConfirmModal
                  isOpen={isConfirmModalOpen}
                  onClose={closeConfirmModal}
                  onConfirm={handleDeleteConfirm}
                  title="Confirm Deletion"
                  message={`Are you sure you want to delete the course "${courseToDelete?.title || ''}"?`}
              />
        </div>
    );
}

export default ManageAICourses;