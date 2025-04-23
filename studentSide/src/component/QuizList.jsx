import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner, faExclamationTriangle,faPlay,faEye,faCheck,faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
// import { useUser } from '../context/UserContext';

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
const formatDate = (dateString) => {
    if (!dateString) return ''; // Return empty string if no date
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [submittedQuizIds, setSubmittedQuizIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component
        const fetchQuizAndSubmissionData = async () => {
            setLoading(true);
            setError(null);
            setQuizzes([]); // Reset
            setSubmittedQuizIds(new Set()); // Reset

            const token = localStorage.getItem('authToken');
            if (!token) {
                if (isMounted) { setError("Authentication required."); setLoading(false); }
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                // Fetch available quizzes AND submission history concurrently
                const [quizResponse, submissionResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/student/quizzes', config), // Get available quizzes
                    axios.get('http://localhost:5000/api/student/submissions', config) // Get all user submissions
                ]);

                if (!isMounted) return; // Check if component is still mounted

                // Process available quizzes
                if (quizResponse.data && quizResponse.data.quizzes) {
                    console.log("Available quizzes received:", quizResponse.data.quizzes);
                    setQuizzes(quizResponse.data.quizzes);
                } else {
                     console.warn("No quizzes data in response");
                     setQuizzes([]);
                 }

                // Process submissions to extract submitted Quiz IDs
                if (submissionResponse.data && submissionResponse.data.submissions) {
                    console.log("Submissions history received:", submissionResponse.data.submissions);
                    // Create a Set of quiz IDs from the submission history
                    const ids = new Set(submissionResponse.data.submissions.map(sub => sub.quiz?._id).filter(id => id)); // Filter out null/undefined IDs
                    console.log("Submitted Quiz IDs Set:", ids);
                    setSubmittedQuizIds(ids);
                } else {
                     console.warn("No submissions data in response");
                     setSubmittedQuizIds(new Set());
                 }

            } catch (err) {
                 if (!isMounted) return;
                 console.error("Error fetching quiz/submission data:", err);
                 setError(err.response?.data?.message || "Failed to load quiz data.");
                 setQuizzes([]);
                 setSubmittedQuizIds(new Set());
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchQuizAndSubmissionData();

        // Cleanup function
        return () => { isMounted = false; };
    }, []); // Fetch only once on mount

    const navigateToQuiz = (quizId) => {
        navigate(`/student/quiz/${quizId}`);
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-indigo-600">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <span className="ml-3">Loading Quizzes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Available Quizzes
            </h1>

            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    <FontAwesomeIcon icon={faEdit} className="mr-2 text-green-600" />
                    Select a Quiz
                </h2>
                {quizzes.length > 0 ? (
                    <ul className="space-y-3">
                        {quizzes.map(quiz => {
                            const isCompleted = submittedQuizIds.has(quiz._id);

                            return (
                                <li key={quiz._id} className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="mb-2 sm:mb-0 flex-1 mr-4">
                                        <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                                        {quiz.description && <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>}
                                        {quiz.createdAt && (<p className="text-xs text-gray-500 mt-2 flex items-center">

                                                 Available since: {formatDate(quiz.createdAt)}
                                            </p>
                                         )}
                                        <div className="text-xs text-gray-500 mt-1 space-x-3">
                                            <span>{quiz.questionCount} Questions</span>
                                            {quiz.timeLimitMinutes && <span> | {quiz.timeLimitMinutes} min limit</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-shrink-0">
                                        <AccessTypeBadge accessType={quiz.accessType} />

                                        {isCompleted ? (
                                            <button
                                                onClick={() => navigateToQuiz(quiz._id)}
                                                title="Review your submission"
                                                className="bg-gray-500 text-white text-sm font-medium px-3 py-1 rounded hover:bg-gray-600 transition-colors whitespace-nowrap inline-flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="mr-1.5" /> Review
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigateToQuiz(quiz._id)}
                                                title="Start this quiz"
                                                className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded hover:bg-indigo-700 transition-colors whitespace-nowrap inline-flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faPlay} className="mr-1.5" /> Start Quiz
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No quizzes currently available for your plan.</p>
                )}
            </section>
        </div>
    );
}

export default QuizList;