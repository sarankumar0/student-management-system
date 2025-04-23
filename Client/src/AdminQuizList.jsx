// src/components/admin/AdminQuizList.jsx (or similar path)

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt, faChalkboardTeacher, faUserGraduate, faStar, faEye, faEdit, faTrashAlt, faSpinner,faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link,useNavigate } from 'react-router-dom'; // If needed for links later
import Breadcrumbs from './components/Breadcrumbs';

// Placeholder for Quiz Details/Edit/Results pages
const PlaceholderAction = ({ action, quizId }) => {
    alert(`Action: ${action} for Quiz ID: ${quizId} (Not Implemented Yet)`);
};

function AdminQuizList() {
    const [quizzes, setQuizzes] = useState([]); // Stores the full list from API
    const [selectedBatch, setSelectedBatch] = useState('all'); // 'all', 'pro', 'classic', 'basic'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    // --- Fetching Data ---
    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch ALL quizzes initially
                const response = await axios.get('http://localhost:5000/api/quizzes');
                setQuizzes(response.data || []); // Ensure it's an array
                console.log("Fetched quizzes:", response.data);
            } catch (err) {
                console.error("Error fetching quizzes:", err);
                setError("Failed to load quizzes. Please try again later.");
                 if (err.response) {
                    console.error("Server Response:", err.response.data);
                }
                setQuizzes([]); // Clear quizzes on error
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []); // Empty dependency array runs once on mount

    // --- Filtering Logic ---
    // useMemo recalculates only when quizzes or selectedBatch changes
    const filteredQuizzes = useMemo(() => {
        if (selectedBatch === 'all') {
            return quizzes;
        }
        return quizzes.filter(quiz => quiz.accessType === selectedBatch);
    }, [quizzes, selectedBatch]);

    // --- Calculate Counts ---
    // useMemo recalculates only when quizzes changes
    const quizCounts = useMemo(() => {
        const counts = { all: 0, pro: 0, classic: 0, basic: 0 };
        counts.all = quizzes.length;
        quizzes.forEach(quiz => {
            if (counts.hasOwnProperty(quiz.accessType)) {
                counts[quiz.accessType]++;
            }
        });
        return counts;
    }, [quizzes]);


    // --- Batch Styles (Similar to CourseDashboard, adjust colors if needed) ---
    const getBatchStyles = (level) => {
        switch (level.toLowerCase()) {
            case 'all': return { border: 'border-gray-500', text: 'text-gray-700', bg: 'bg-gray-50', ring: 'focus:ring-gray-500', activeRing: 'ring-gray-500', icon: faListAlt };
            case 'pro': return { border: 'border-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50', ring: 'focus:ring-indigo-500', activeRing: 'ring-indigo-500', icon: faStar };
            case 'classic': return { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', ring: 'focus:ring-purple-500', activeRing: 'ring-purple-500', icon: faChalkboardTeacher };
            case 'basic': return { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', ring: 'focus:ring-teal-500', activeRing: 'ring-teal-500', icon: faUserGraduate };
            default: return { border: 'border-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', ring: 'focus:ring-gray-500', activeRing: 'ring-gray-500', icon: faListAlt };
        }
    };

    // --- Format Date Helper ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // --- Dynamic Badge Component (same as before) ---
    const AccessTypeBadge = ({ accessType }) => (
         <span className={`
             text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
             ${accessType.toLowerCase() === 'pro' ? 'bg-indigo-600' :
               accessType.toLowerCase() === 'classic' ? 'bg-purple-500' :
               accessType.toLowerCase() === 'basic' ? 'bg-teal-500' :
               'bg-gray-500' // Default fallback
             }
         `}>
             {accessType}
         </span>
     );

     const handleDeleteQuiz = async (quizId, quizTitle) => {
        // Confirmation dialog
        if (!window.confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) {
            return; // Abort if user cancels
        }
    
        console.log(`Attempting to delete quiz: ${quizId}`);
        // Consider setting a specific loading state for the row/button if needed
    
        try {
            const endpoint = `http://localhost:5000/api/quizzes/${quizId}`;
            const response = await axios.delete(endpoint);
    
            console.log("Delete response:", response.data);
            alert(response.data.message || 'Quiz deleted successfully!'); // Show success feedback
    
            // Update the frontend state to remove the deleted quiz
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));
    
        } catch (err) {
            console.error(`Error deleting quiz ${quizId}:`, err);
            let errorMsg = `Failed to delete quiz "${quizTitle}".`;
            if (err.response) {
                console.error("Server Response:", err.response.data);
                errorMsg += ` Server Error: ${err.response.data?.message || err.response.statusText}`;
            } else if (err.request) {
                errorMsg += " No response from server.";
            }
            alert(errorMsg); // Show error feedback
             // Reset any specific loading state if used
        }
    };
    const handleEditQuiz = (quizId) => {
        console.log(`Navigating to edit quiz: ${quizId}`);
        // Navigate to the form route ('/admin/test/add-test' based on previous setup)
        // Pass the quizId in the navigation state object
        navigate('/test/add-test', { state: { editQuizId: quizId } });
    };

    // --- Main Render ---
    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen"> {/* Slightly different bg for contrast? */}

            {/* Using the two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">

                {/* --- Sticky Left Column Wrapper --- */}
                <div className="w-full lg:w-1/3 lg:sticky lg:top-4 lg:self-start">

                    {/* Main Heading for this section */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quiz List</h1>

                    {/* Filter Cards */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-600 mb-1">Filter by Batch</h2>
                        {['all', 'pro', 'classic', 'basic'].map((batch) => {
                            const styles = getBatchStyles(batch);
                            const isActive = selectedBatch === batch;
                            const count = quizCounts[batch];

                            return (
                                <div
                                    key={batch}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`
                                        bg-white rounded-lg shadow-md border-l-4 ${styles.border} p-4
                                        cursor-pointer transition-all duration-300 ease-in-out
                                        hover:shadow-lg hover:scale-[1.01]
                                        focus:outline-none focus:ring-2 ${styles.ring} focus:ring-offset-1
                                        ${isActive ? `ring-2 ${styles.activeRing} ring-offset-1 scale-[1.01] shadow-md ${styles.bg}` : 'hover:bg-gray-50'}
                                        flex justify-between items-center
                                    `}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                >
                                    <div className="flex items-center gap-3">
                                         <FontAwesomeIcon icon={styles.icon} className={`w-5 h-5 ${styles.text}`} />
                                         <span className={`text-lg font-semibold capitalize ${styles.text}`}>
                                             {batch}
                                         </span>
                                    </div>
                                    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* --- End Sticky Left Column Wrapper --- */}


                {/* --- Right Column (Quiz List) --- */}
                <div className="w-full lg:w-2/3">
               
                <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 capitalize">
                            {selectedBatch === 'all' ? 'All Quizzes' : `${selectedBatch} Quizzes`} 
                            {/* ({filteredQuizzes.length}) */}
                        </h2>
                        {/* --- ADD THIS BUTTON --- */}
                        <button
                             onClick={() => navigate('Add-Test')} // Navigate to the form route
                             className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                         >
                             <FontAwesomeIcon icon={faPlus} className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                             Add New Test
                         </button>
                         {/* --- END ADD --- */}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center p-10 text-indigo-600">
                           <FontAwesomeIcon icon={faSpinner} spin size="2x" /> <span className="ml-3">Loading...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    {/* Quiz List Table / Cards */}
                    {!loading && !error && filteredQuizzes.length > 0 && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                           <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredQuizzes.map((quiz) => (
                                        <tr key={quiz._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900" title={quiz.title}>{quiz.title}</div>
                                                {/* Optional: show description snippet */}
                                                {/* <div className="text-xs text-gray-500 truncate max-w-xs" title={quiz.description}>{quiz.description}</div> */}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <AccessTypeBadge accessType={quiz.accessType} />
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                                                {quiz.questionCount}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(quiz.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                                {/* Action Buttons - Link to details/edit pages or trigger modals later */}
                                                <button
                                                   onClick={() => navigate(`/admin/test/results/${quiz._id}`)}  // <-- Use navigate
                                                   title="View Results"
                                                   className="text-blue-600 hover:text-blue-800">
                                                       <FontAwesomeIcon icon={faEye} />
                                               </button>
                                                <button
                                             onClick={() => handleEditQuiz(quiz._id)} // <-- Use the new handler
                                             title="Edit Quiz"
                                             className="text-indigo-600 hover:text-indigo-800">
                                                <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                // Change onClick to call the new handler
                                                onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                                                title="Delete Quiz"
                                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                // disabled={/* Add condition if needed, e.g., based on user permissions */}
                                            >
                                             <FontAwesomeIcon icon={faTrashAlt} />
                                         </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                     {/* No Quizzes Found State */}
                     {!loading && !error && filteredQuizzes.length === 0 && (
                         <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                             <p className="text-gray-500 italic">
                                 No quizzes found matching the '{selectedBatch}' filter.
                             </p>
                              {/* Optional: Link back to create quiz */}
                             {/* <Link to="/admin/test/add-test" className="mt-4 inline-block text-indigo-600 hover:underline">Create a new quiz?</Link> */}
                         </div>
                     )}

                </div>
                 {/* --- End Right Column --- */}
            </div>
        </div>
    );
}

export default AdminQuizList;