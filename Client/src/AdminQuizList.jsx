// src/components/admin/AdminQuizList.jsx (or similar path)

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt, faChalkboardTeacher, faUserGraduate, faStar, faEye, faEdit, faTrashAlt, faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
// Assuming Breadcrumbs is not needed directly in this component now
// import Breadcrumbs from './components/Breadcrumbs';
import { toast } from 'react-toastify'; // Import toast
import ConfirmModal from './components/ConfirmModal'; // Adjust path if needed
import DataTable from './components/Reusble/DataTable'; // *** IMPORT REUSABLE DATATABLE *** Adjust path if needed

// Base URL (Good Practice)
const API_BASE_URL = "http://localhost:5000/api";

function AdminQuizList() {
    const [quizzes, setQuizzes] = useState([]); // Stores the full list from API
    const [selectedBatch, setSelectedBatch] = useState('all'); // 'all', 'pro', 'classic', 'basic'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- STATE for Confirmation Modal ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null); // Stores { id: string, title: string }

    // --- Fetching Data ---
    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/quizzes`);
                setQuizzes(response.data || []);
                console.log("Fetched quizzes:", response.data);
            } catch (err) {
                console.error("Error fetching quizzes:", err);
                setError("Failed to load quizzes. Please try again later.");
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []); // Fetch only once on mount

    // --- Filtering Logic ---
    const filteredQuizzes = useMemo(() => {
        if (selectedBatch === 'all') {
            return quizzes;
        }
        // Ensure accessType comparison is robust (e.g., lowercase)
        return quizzes.filter(quiz => quiz.accessType?.toLowerCase() === selectedBatch.toLowerCase());
    }, [quizzes, selectedBatch]);

    // --- Quiz Counts Logic ---
    const quizCounts = useMemo(() => {
        const counts = { all: quizzes.length, pro: 0, classic: 0, basic: 0 };
        quizzes.forEach(quiz => {
            const accessTypeLower = quiz.accessType?.toLowerCase();
            if (counts.hasOwnProperty(accessTypeLower)) {
                counts[accessTypeLower]++;
            }
        });
        return counts;
    }, [quizzes]);

    // --- Helper Functions (Keep as is) ---
    const getBatchStyles = (level) => { /* ... keep existing ... */
         switch (level.toLowerCase()) {
            case 'all': return { border: 'border-gray-500', text: 'text-gray-700', bg: 'bg-gray-50', ring: 'focus:ring-gray-500', activeRing: 'ring-gray-500', icon: faListAlt };
            case 'pro': return { border: 'border-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50', ring: 'focus:ring-indigo-500', activeRing: 'ring-indigo-500', icon: faStar };
            case 'classic': return { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', ring: 'focus:ring-purple-500', activeRing: 'ring-purple-500', icon: faChalkboardTeacher };
            case 'basic': return { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', ring: 'focus:ring-teal-500', activeRing: 'ring-teal-500', icon: faUserGraduate };
            default: return { border: 'border-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', ring: 'focus:ring-gray-500', activeRing: 'ring-gray-500', icon: faListAlt };
        }
    };
    const formatDate = (dateString) => { /* ... keep existing ... */
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };
    const AccessTypeBadge = ({ accessType }) => ( /* ... keep existing ... */
        <span className={`
             text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
             ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
               accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
               accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
               'bg-gray-500' // Default fallback
             }
         `}>
             {accessType || 'N/A'}
         </span>
    );

    // --- Modal and Edit/Delete Logic ---
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setQuizToDelete(null);
    };

    const handleEditQuiz = (quizId) => {
        console.log(`Navigating to edit quiz: ${quizId}`);
        // Use the correct relative path for edit if needed, or absolute
        // Assuming AddEditTest is at /admin/test/list/Add-Test based on previous context
        navigate('/admin/test/list/Add-Test', { state: { editQuizId: quizId } });
        // OR if you changed routes to /admin/test/edit/:quizId
        // navigate(`/admin/test/edit/${quizId}`);
    };

    const handleDeleteQuizRequest = (quizId, quizTitle) => {
        if (!quizId || !quizTitle) {
            toast.error("Missing quiz information for deletion.");
            return;
        }
        setQuizToDelete({ id: quizId, title: quizTitle });
        setIsConfirmModalOpen(true);
    };

    const handleDeleteQuizConfirm = async () => {
        if (!quizToDelete) return;
        const { id: quizId, title: quizTitle } = quizToDelete;
        closeConfirmModal();

        const toastId = toast.loading(`Deleting quiz "${quizTitle}"...`, { theme: "colored" });
        try {
            const endpoint = `${API_BASE_URL}/quizzes/${quizId}`;
            const response = await axios.delete(endpoint);
            toast.update(toastId, { render: response.data.message || 'Quiz deleted successfully!', type: "success", isLoading: false, autoClose: 3000, theme: "colored" });
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId)); // Update state
        } catch (err) {
            console.error(`Error deleting quiz ${quizId}:`, err);
            let errorMsg = `Failed to delete quiz "${quizTitle}".`;
            if (err.response?.data?.message) {
                errorMsg += ` Server Error: ${err.response.data.message}`;
            } else if (err.request) { errorMsg += " No response from server."; }
            toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 5000, theme: "colored" });
        } finally {
            setQuizToDelete(null);
        }
    };

    // --- Define Columns for DataTable ---
    const columns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            cell: (row) => ( // Assuming cell now receives { row } object from tanstack table v8+ pattern, or just the value if using simple accessor
                <div className="text-sm font-medium text-gray-900 truncate" title={row.title}> {/* Adjust data access based on actual DataTable impl */}
                    {row.title}
                </div>
            ),
            headerClassName: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
            cellClassName: 'px-4 py-3 whitespace-nowrap',
        },
        {
            header: 'Batch',
            accessorKey: 'accessType',
            cell: (row) => <AccessTypeBadge accessType={row.accessType} />,
            headerClassName: 'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
            cellClassName: 'px-3 py-3 whitespace-nowrap',
        },
        {
            header: 'Questions',
            accessorKey: 'questionCount', // Ensure your API provides this count
            cell: (row) => <div className="text-center">{row.questionCount ?? 'N/A'}</div>, // Use nullish coalescing
            headerClassName: 'px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
            cellClassName: 'px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500',
        },
        {
            header: 'Created',
            accessorKey: 'createdAt',
            cell: (row) => formatDate(row.createdAt),
            headerClassName: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
            cellClassName: 'px-4 py-3 whitespace-nowrap text-sm text-gray-500',
        },
        {
            header: 'Actions',
            id: 'actions', // Important to have an id if no accessorKey
             // Custom cell renderer for action buttons
             cell: (row) => (
                <div className="flex justify-center items-center space-x-2">
                   <button
                      onClick={() => navigate(`/admin/test/results/${row._id}`)} // Use row._id
                      title="View Results"
                      className="text-blue-600 hover:text-blue-800 p-1"
                      aria-label={`View results for ${row.title}`} // Use row.title
                   >
                       <FontAwesomeIcon icon={faEye} />
                   </button>
                   <button
                        onClick={() => handleEditQuiz(row._id)} // Use row._id
                        title="Edit Quiz"
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        aria-label={`Edit quiz ${row.title}`} // Use row.title
                   >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                   <button
                       onClick={() => handleDeleteQuizRequest(row._id, row.title)} // Use row._id, row.title
                       title="Delete Quiz"
                       className="text-red-600 hover:text-red-800 p-1"
                       aria-label={`Delete quiz ${row.title}`} // Use row.title
                   >
                        <FontAwesomeIcon icon={faTrashAlt} />
                   </button>
               </div>
           ),
            headerClassName: 'px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
            cellClassName: 'px-4 py-3 whitespace-nowrap text-center text-sm font-medium',
        },
    ], [navigate]); // Include navigate in dependency array if used directly in cell renderers

    // --- Main Render ---
    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            {/* Assuming ToastContainer is in a higher layout component */}

            {/* Layout Structure */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">

                {/* --- Sticky Left Column --- */}
                <div className="w-full lg:w-1/3 lg:sticky lg:top-4 lg:self-start">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quiz List</h1>
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-600 mb-1">Filter by Batch</h2>
                        {['all', 'pro', 'classic', 'basic'].map((batch) => {
                            const styles = getBatchStyles(batch);
                            const isActive = selectedBatch === batch;
                            const count = quizCounts[batch];
                            return (
                                <div
                                    key={batch} onClick={() => setSelectedBatch(batch)}
                                    className={`bg-white rounded-lg shadow-md border-l-4 ${styles.border} p-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 ${styles.ring} focus:ring-offset-1 ${isActive ? `ring-2 ${styles.activeRing} ring-offset-1 scale-[1.01] shadow-md ${styles.bg}` : 'hover:bg-gray-50'} flex justify-between items-center`}
                                    role="button" tabIndex={0} aria-pressed={isActive}
                                >
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={styles.icon} className={`w-5 h-5 ${styles.text}`} />
                                        <span className={`text-lg font-semibold capitalize ${styles.text}`}>{batch}</span>
                                    </div>
                                    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Right Column (Quiz List using DataTable) --- */}
                <div className="w-full lg:w-2/3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 capitalize">
                            {selectedBatch === 'all' ? 'All Quizzes' : `${selectedBatch} Quizzes`}
                        </h2>
                        <button
                            onClick={() => navigate('Add-Test')} // Relative navigation to sibling
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FontAwesomeIcon icon={faPlus} className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Add New Test
                        </button>
                    </div>

                    {/* DataTable integration */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                         {/* Pass filtered data and columns */}
                         {/* Loading and Error states are handled by DataTable internally */}
                         <DataTable
                             columns={columns}
                             data={filteredQuizzes}
                             isLoading={loading}
                             error={error} // Pass error string or null
                             keyField="_id" // Specify the unique key
                             // Optional: Customize wrapper if needed
                             // wrapperClassName="overflow-x-auto shadow-none sm:rounded-lg"
                         />
                    </div>
                    {/* DataTable handles its own 'No data' message if configured */}
                    {/* Remove the manual 'No Quizzes Found' block if DataTable handles it */}
                     {!loading && !error && filteredQuizzes.length === 0 && !quizCounts[selectedBatch] && (
                         <div className="text-center py-10 px-4 bg-white rounded-lg shadow mt-4">
                             <p className="text-gray-500 italic">
                                 No quizzes found matching the '{selectedBatch}' filter.
                             </p>
                         </div>
                     )}
                </div>
            </div>

            {/* --- Confirmation Modal --- */}
            {isConfirmModalOpen && quizToDelete && (
               <ConfirmModal
                   isOpen={isConfirmModalOpen}
                   onClose={closeConfirmModal}
                   onConfirm={handleDeleteQuizConfirm}
                   title="Confirm Deletion"
                   message={`Are you sure you want to delete the quiz "${quizToDelete.title}"? This action cannot be undone.`}
               />
           )}
        </div>
    );
}

export default AdminQuizList;