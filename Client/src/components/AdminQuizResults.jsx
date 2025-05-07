// src/components/admin/AdminQuizResults.jsx (New File)

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Use useParams to get quizId from route
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faArrowLeft, faTrophy, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function AdminQuizResults() {
    const { quizId } = useParams(); // Get quizId from the URL parameter
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [quizTitle, setQuizTitle] = useState(''); // Store quiz title for display
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                 // Fetch submissions for this quiz
                 const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}/submissions`, config);
                 console.log("Submissions data received:", response.data);
                 setSubmissions(response.data || []);

                 // Optional: Fetch quiz title separately if needed (or get from first submission if backend doesn't provide it easily)
                 // We might need quiz title if the submissions array could be empty
                 // For simplicity, let's assume we don't *need* the title right now,
                 // but ideally the backend might return {quizTitle: '...', submissions: [...]}
                 // Or we can make another call:
                 const quizInfo = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`, config);
                 setQuizTitle(quizInfo.data.title);

            } catch (err) {
                 console.error("Error fetching submissions:", err);
                 setError(err.response?.data?.message || "Failed to load submissions.");
                 setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
             fetchSubmissions();
        } else {
             setError("No Quiz ID specified.");
             setLoading(false);
        }
    }, [quizId]);

    const formatDate = (dateString) => {
        // ... (your formatDate helper) ...
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleString(); } // Example format
        catch (e) { return 'Invalid Date'; }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /></div>;
    }

    if (error) {
        return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <button
                onClick={() => navigate('/admin/test/list')} // Go back to quiz list
                className="mb-4 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Quizzes
            </button>

            {/* TODO: Display Quiz Title Here */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                 Submissions for Quiz "{quizTitle || quizId}"
            </h1>


            {submissions.length === 0 ? (
                <p className="text-gray-500 italic">No submissions found for this quiz yet.</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto"> {/* Allow horizontal scroll on small screens */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                {/* Add Time Taken if needed */}
                                {/* <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th> */}
                                {/* Add actions column if needed (e.g., view details) */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sub.student?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sub.student?.email || 'N/A'}</td>
                                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sub.student?.studentId || sub.student?.registrationNumber || 'N/A'}</td>
                                     <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-700">
                                         {sub.score} / {sub.totalPossibleScore}
                                         <span className='ml-1'>({sub.totalPossibleScore > 0 ? ((sub.score / sub.totalPossibleScore) * 100).toFixed(0) : 0}%)</span>
                                     </td>
                                     <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                                         {sub.passed === true && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FontAwesomeIcon icon={faTrophy} className='mr-1'/> Passed</span>}
                                         {sub.passed === false && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FontAwesomeIcon icon={faTimesCircle} className='mr-1'/> Failed</span>}
                                         {sub.passed === null && <span className="text-gray-500">-</span>} {/* If no passing score was set */}
                                     </td>
                                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.submittedAt)}</td>
                                     {/* Add Time Taken cell if needed */}
                                     {/* <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">{sub.timeTakenSeconds ? `${Math.floor(sub.timeTakenSeconds/60)}m ${sub.timeTakenSeconds%60}s` : '-'}</td> */}
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminQuizResults;