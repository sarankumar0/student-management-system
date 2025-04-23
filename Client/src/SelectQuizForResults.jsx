// src/components/admin/SelectQuizForResults.jsx (New File)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faListAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function SelectQuizForResults() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
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
                // Fetch ALL quizzes (similar to AdminQuizList, maybe just title/id needed)
                const response = await axios.get('http://localhost:5000/api/quizzes', config); // Use admin endpoint
                // Extract the relevant array - check response structure from this endpoint
                // Assuming it returns array directly or { quizzes: [...] }
                setQuizzes(response.data.quizzes || response.data || []);
            } catch (err) {
                console.error("Error fetching quizzes for selection:", err);
                setError(err.response?.data?.message || "Failed to load quizzes list.");
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleSelectQuiz = (quizId) => {
        navigate(`/admin/test/results/${quizId}`); // Navigate to the specific results page
    };

    if (loading) {
        return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /></div>;
    }

    if (error) {
        return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                <FontAwesomeIcon icon={faListAlt} className="mr-2 text-blue-600" />
                Select a Quiz to View Results
            </h2>
            {quizzes.length === 0 ? (
                <p className="text-gray-500 italic">No quizzes found.</p>
            ) : (
                <ul className="space-y-2">
                    {quizzes.map(quiz => (
                        <li key={quiz._id}>
                            <button
                                onClick={() => handleSelectQuiz(quiz._id)}
                                className="w-full flex justify-between items-center p-3 text-left bg-gray-50 hover:bg-indigo-100 rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                            >
                                <span className="font-medium text-gray-800">{quiz.title} ({quiz.accessType?.toUpperCase()})</span>
                                <FontAwesomeIcon icon={faChevronRight} className="text-gray-400" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SelectQuizForResults;