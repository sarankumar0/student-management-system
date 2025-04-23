// src/component/QuizTakingPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHourglassHalf, faCheckCircle, faTimesCircle, 
    faSpinner, faPaperPlane, faArrowLeft,
    faExclamationTriangle, faListOl,faRedo
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // State management
    const [quizDataForTaking, setQuizDataForTaking] = useState(null);
    const [quizDataForReview, setQuizDataForReview] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previousSubmission, setPreviousSubmission] = useState(null);
    const [viewMode, setViewMode] = useState('loading');
    const timerIntervalRef = useRef(null);

    // Fetch quiz data and check for existing submission
    useEffect(() => {
        let isMounted = true;
        
        const fetchInitialState = async () => {
            if (!isMounted) return;
            setLoading(true);
            setError(null);
            setViewMode('loading');
            setPreviousSubmission(null);
            setQuizDataForTaking(null);
            setQuizDataForReview(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                if (isMounted) {
                    setError("Authentication required. Please log in.");
                    setLoading(false);
                    setViewMode('error');
                }
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                // Check for existing submission and get review data
                const reviewCheckUrl = `http://localhost:5000/api/student/submissions/quiz/${quizId}`;
                const reviewResponse = await axios.get(reviewCheckUrl, config);

                if (!isMounted) return;

                if (reviewResponse.data?.submission && reviewResponse.data?.quiz) {
                    // Submission found - enter review mode
                    setPreviousSubmission(reviewResponse.data.submission);
                    setQuizDataForReview(reviewResponse.data.quiz);
                    setViewMode('review');
                } else {
                    // No submission found - enter take mode
                    const takeQuizResponse = await axios.get(
                        `http://localhost:5000/api/student/quizzes/${quizId}/take`,
                        config
                    );

                    if (!isMounted) return;

                    setQuizDataForTaking(takeQuizResponse.data);
                    setViewMode('take');

                    // Initialize timer and answers
                    if (takeQuizResponse.data.timeLimitMinutes > 0) {
                        setTimeLeft(takeQuizResponse.data.timeLimitMinutes * 60);
                    } else {
                        setTimeLeft(null);
                    }

                    const initialAnswers = {};
                    takeQuizResponse.data.questions.forEach(q => {
                        initialAnswers[q._id] = null;
                    });
                    setStudentAnswers(initialAnswers);
                    setQuizStartTime(Date.now());
                }
            } catch (err) {
                if (!isMounted) return;

                if (err.response?.status === 404 && err.config.url.includes('/submissions/quiz/')) {
                    // Submission not found - try to fetch quiz for taking
                    try {
                        const takeQuizResponse = await axios.get(
                            `http://localhost:5000/api/student/quizzes/${quizId}/take`,
                            config
                        );

                        if (isMounted) {
                            setQuizDataForTaking(takeQuizResponse.data);
                            setViewMode('take');
                            // Initialize timer and answers
                            if (takeQuizResponse.data.timeLimitMinutes > 0) {
                                setTimeLeft(takeQuizResponse.data.timeLimitMinutes * 60);
                            }
                            const initialAnswers = {};
                            takeQuizResponse.data.questions.forEach(q => {
                                initialAnswers[q._id] = null;
                            });
                            setStudentAnswers(initialAnswers);
                            setQuizStartTime(Date.now());
                        }
                    } catch (takeErr) {
                        if (isMounted) {
                            setError(takeErr.response?.data?.message || `Failed to load quiz (${takeErr.message})`);
                            setViewMode('error');
                        }
                    }
                } else {
                    if (isMounted) {
                        setError(err.response?.data?.message || `Failed to load quiz status (${err.message})`);
                        setViewMode('error');
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (quizId) {
            fetchInitialState();
        } else {
            if (isMounted) {
                setError("No Quiz ID specified.");
                setLoading(false);
                setViewMode('error');
            }
        }

        return () => {
            isMounted = false;
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [quizId]);

    // Timer logic
    useEffect(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        if (timeLeft !== null && timeLeft > 0 && viewMode === 'take') {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current);
                        handleSubmitQuiz(true); // Auto-submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [timeLeft, viewMode]);

    const handleAnswerChange = (questionId, selectedOptionIndex) => {
        setStudentAnswers(prev => ({
            ...prev,
            [questionId]: selectedOptionIndex
        }));
    };

    const formatTime = (seconds) => {
        if (seconds === null || seconds < 0) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleSubmitQuiz = useCallback(async (isAutoSubmit = false) => {
        if (viewMode !== 'take' || isSubmitting) return;

        if (!isAutoSubmit) {
            const unanswered = Object.values(studentAnswers).filter(a => a === null).length;
            const confirmMsg = unanswered > 0
                ? `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
                : "Are you sure you want to submit your answers?";
            
            if (!window.confirm(confirmMsg)) return;
        }

        setIsSubmitting(true);
        setError(null);
        
        const timeTaken = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : undefined;
        
        const submissionPayload = {
            answers: Object.entries(studentAnswers).map(([questionId, index]) => ({
                questionId,
                selectedOptionIndex: index
            })),
            timeTakenSeconds: timeTaken
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `http://localhost:5000/api/student/quizzes/${quizId}/submit`,
                submissionPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPreviousSubmission(response.data);
            setQuizDataForReview(quizDataForTaking);
            setViewMode('review');
            toast.success(response.data.message || "Quiz submitted successfully!");
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.message || "Failed to submit quiz");
            toast.error("Failed to submit quiz");
        } finally {
            setIsSubmitting(false);
        }
    }, [quizId, studentAnswers, isSubmitting, quizStartTime, viewMode, quizDataForTaking]);

    // Render loading state
    if (viewMode === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" />
            </div>
        );
    }

    // Render error state
    if (viewMode === 'error') {
        return (
            <div className="m-6 p-6 bg-red-100 text-red-700 border border-red-400 rounded text-center text-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                {error || 'An error occurred while loading the quiz.'}
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <FontAwesomeIcon icon={faRedo} className="mr-2" /> Try Again
                </button>
            </div>
        );
    }

    // Render review mode
    if (viewMode === 'review' && previousSubmission && quizDataForReview) {
        const getStudentAnswerIndex = (questionId) => {
            const answer = previousSubmission.answers?.find(a => a.questionId === questionId);
            return answer ? answer.selectedOptionIndex : null;
        };

        const getCorrectAnswerIndex = (questionId) => {
            const question = quizDataForReview.questions?.find(q => q._id === questionId);
            return (question && typeof question.correctAnswerIndex === 'number') 
                ? question.correctAnswerIndex 
                : null;
        };

        return (
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {/* Review Header */}
                <div className="bg-white p-5 rounded-lg shadow mb-6 text-center border-l-4 border-blue-500">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Quiz Review: {quizDataForReview.title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">You completed this quiz.</p>
                    <p className="text-3xl font-bold mb-2">
                        Your Score: <span className="text-indigo-600">{previousSubmission.score}</span> / {previousSubmission.totalPossibleScore}
                    </p>
                    {previousSubmission.passed !== null && (
                        <p className={`font-semibold text-lg mb-4 ${previousSubmission.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {previousSubmission.passed ? 'Status: Passed' : 'Status: Failed'}
                        </p>
                    )}
                    {previousSubmission.timeTakenSeconds !== undefined && (
                        <p className="text-sm text-gray-500">
                            Time Taken: {Math.floor(previousSubmission.timeTakenSeconds / 60)}m {previousSubmission.timeTakenSeconds % 60}s
                        </p>
                    )}
                    <p className="text-sm text-gray-500">
                        Submitted on: {new Date(previousSubmission.submittedAt).toLocaleString()}
                    </p>
                    <button
                        onClick={() => navigate('/courses/materials')}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Materials
                    </button>
                </div>

                {/* Review Questions */}
                <h2 className="text-xl font-semibold text-gray-700 my-6">Review Your Answers:</h2>
                <div className="space-y-6">
                    {quizDataForReview.questions.map((question, index) => {
                        const studentAnswerIndex = getStudentAnswerIndex(question._id);
                        const correctAnswerIndex = getCorrectAnswerIndex(question._id);

                        return (
                            <div key={question._id} className="bg-white p-5 rounded-lg shadow">
                                <h3 className="text-md font-semibold text-gray-800 mb-4">
                                    <span className='text-indigo-600 mr-2'>Q{index + 1}.</span> 
                                    {question.questionText}
                                </h3>
                                <div className="space-y-3 pl-6">
                                    {question.options.map((option, optionIndex) => {
                                        const isSelected = studentAnswerIndex === optionIndex;
                                        const isCorrect = correctAnswerIndex === optionIndex;
                                        const isStudentCorrect = isSelected && isCorrect;
                                        const isStudentWrong = isSelected && !isCorrect;

                                        let itemClasses = "border-gray-300 bg-gray-50";
                                        if (isStudentCorrect) {
                                            itemClasses = "border-green-500 bg-green-50 ring-1 ring-green-300";
                                        } else if (isStudentWrong) {
                                            itemClasses = "border-red-500 bg-red-50 ring-1 ring-red-300";
                                        } else if (isCorrect) {
                                            itemClasses = "border-green-400 bg-green-50";
                                        }

                                        return (
                                            <div key={optionIndex} className={`flex items-center p-3 border rounded transition duration-150 ${itemClasses}`}>
                                                <div className="w-6 h-5 mr-3 flex items-center justify-center flex-shrink-0">
                                                    {isStudentCorrect && <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" title="Your Correct Answer"/>}
                                                    {isStudentWrong && <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" title="Your Incorrect Answer"/>}
                                                    {isCorrect && !isStudentCorrect && <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 opacity-70" title="Correct Answer"/>}
                                                </div>
                                                <span className={`text-sm ${isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'} ${isStudentWrong ? ' text-red-700' : ''}`}>
                                                    {option}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Render take mode
    if (viewMode === 'take' && quizDataForTaking) {
        return (
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {/* Quiz Header */}
                <div className="bg-white p-5 rounded-lg shadow mb-6 sticky top-0 z-10 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className='mb-3 sm:mb-0'>
                            <h1 className="text-xl md:text-2xl font-bold text-indigo-800">
                                {quizDataForTaking.title}
                            </h1>
                            {quizDataForTaking.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {quizDataForTaking.description}
                                </p>
                            )}
                        </div>
                        {timeLeft !== null && (
                            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg text-lg font-semibold shadow-inner">
                                <FontAwesomeIcon 
                                    icon={faHourglassHalf} 
                                    className={`mr-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} 
                                />
                                Time Left: <span className={`ml-2 ${timeLeft < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                        {quizDataForTaking.questions.length} Questions
                    </p>
                </div>

                {/* Questions */}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(); }}>
                    <div className="space-y-6">
                        {quizDataForTaking.questions.map((question, index) => (
                            <div key={question._id} className="bg-white p-5 rounded-lg shadow">
                                <h3 className="text-md font-semibold text-gray-800 mb-4">
                                    <span className='text-indigo-600 mr-2'>Q{index + 1}.</span> 
                                    {question.questionText}
                                </h3>
                                <div className="space-y-3 pl-6">
                                    {question.options.map((option, optionIndex) => (
                                        <label 
                                            key={optionIndex} 
                                            className="flex items-center p-3 border rounded hover:bg-indigo-50 cursor-pointer transition duration-150 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400"
                                        >
                                            <input
                                                type="radio"
                                                name={question._id}
                                                value={optionIndex}
                                                checked={studentAnswers[question._id] === optionIndex}
                                                onChange={() => handleAnswerChange(question._id, optionIndex)}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-3"
                                            />
                                            <span className="text-sm text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => handleSubmitQuiz()}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150"
                        >
                            {isSubmitting ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Submit Answers
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Fallback render
    return (
        <div className="text-center p-10">
            Unable to determine quiz state. Please try again later.
        </div>
    );
}

export default QuizTakingPage;