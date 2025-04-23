// src/component/StudentResultsPage.jsx (New File)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faListCheck, faTrophy, faTimesCircle, faEye } from '@fortawesome/free-solid-svg-icons';
// Removed useUser as we don't strictly need user details here, just the token

// Reusable Badge Component (can be imported if defined centrally)
const AccessTypeBadge = ({ accessType }) => (
    <span className={`
        inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize font-medium leading-none
        ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
          accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
          accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
          'bg-gray-500'}
    `}>
        {accessType || 'N/A'}
    </span>
);

function StudentResultsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For review link navigation

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                 const response = await axios.get(`http://localhost:5000/api/student/submissions`, config);
                 console.log("Student submissions data received:", response.data);
                 setSubmissions(response.data.submissions || []); // Expect { submissions: [...] }
            } catch (err) {
                 console.error("Error fetching student submissions:", err);
                 setError(err.response?.data?.message || "Failed to load submission history.");
                 setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []); // Fetch once on mount

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
        catch (e) { return 'Invalid Date'; }
    };

    const calculatePercentage = (score, total) => {
        if (total === null || total === undefined || total === 0) return '-'; // Avoid division by zero
        if (score === null || score === undefined) return '-';
        return ((score / total) * 100).toFixed(0) + '%';
    };

    if (loading) {
        return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /></div>;
    }

    if (error) {
        return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Quiz Results</h1>

            {submissions.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                    <p className="text-gray-500 italic">You haven't completed any quizzes yet.</p>
                    {/* Optional: Link to available quizzes */}
                    <Link to="/exams/TakeQuiz" className="mt-4 inline-block text-indigo-600 hover:underline">View Available Quizzes?</Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto"> {/* Allow horizontal scroll */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sub.quiz?.title || 'Quiz Title Missing'}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        {sub.quiz?.accessType ? <AccessTypeBadge accessType={sub.quiz.accessType} /> : <span className='text-xs text-gray-400'>N/A</span>}
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-700">
                                        {sub.score} / {sub.totalPossibleScore}
                                        <span className='ml-1 text-gray-500'>({calculatePercentage(sub.score, sub.totalPossibleScore)})</span>
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                                        {sub.passed === true && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FontAwesomeIcon icon={faTrophy} className='mr-1'/> Passed</span>}
                                        {sub.passed === false && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FontAwesomeIcon icon={faTimesCircle} className='mr-1'/> Failed</span>}
                                        {sub.passed === null && <span className="text-gray-400 text-xs italic">Not Graded</span>} {/* If no passing score was set */}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.submittedAt)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                        {/* Link to the review page */}
                                        <button
                                             onClick={() => navigate(`/student/quiz/${sub.quiz?._id}`)} // Use quiz ID from populated data
                                             title="Review Quiz"
                                             disabled={!sub.quiz?._id} // Disable if quiz ID missing
                                             className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                         >
                                             <FontAwesomeIcon icon={faEye} className="mr-1" /> Review
                                         </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default StudentResultsPage;