// src/components/admin/AssignmentSubmissionsReviewPage.jsx (New File)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner,
    faExclamationTriangle,
    faArrowLeft,
    faFilePdf,
    faCheckCircle,
    faTimesCircle,
    faClock,
    faEdit, // For Review button
    faUserGraduate,
    faPaperPlane // Placeholder for 'Not Submitted'
} from '@fortawesome/free-solid-svg-icons';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to format dates (reuse if you have a central helper file)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return new Date(dateString).toLocaleString(undefined, options);
    } catch (e) {
        return 'Invalid Date';
    }
};

// Badge component for status
const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon, text;
    switch (status) {
        case 'reviewed':
            bgColor = 'bg-green-100'; textColor = 'text-green-800'; icon = faCheckCircle; text = 'Reviewed';
            break;
        case 'pending':
            bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; icon = faClock; text = 'Pending Review';
            break;
        case 'not_submitted':
        default:
            bgColor = 'bg-gray-100'; textColor = 'text-gray-600'; icon = faPaperPlane; text = 'Not Submitted';
            break;
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <FontAwesomeIcon icon={icon} className="mr-1.5 h-3 w-3" />
            {text}
        </span>
    );
};


function AssignmentSubmissionsReviewPage() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignmentDetails, setAssignmentDetails] = useState(null);
    const [submissionsData, setSubmissionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Placeholder state for opening a review modal (implement later)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const fetchReviewData = useCallback(async () => {
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
            const response = await axios.get(
                `http://localhost:5000/api/assignments/${assignmentId}/submissions-review`,
                config
            );
            console.log("Review data received:", response.data);
            setAssignmentDetails(response.data.assignmentDetails);
            setSubmissionsData(response.data.submissionsData || []);
        } catch (err) {
            console.error("Error fetching assignment review data:", err);
            setError(err.response?.data?.message || "Failed to load submission data.");
            setSubmissionsData([]);
        } finally {
            setLoading(false);
        }
    }, [assignmentId]); // Re-fetch if assignmentId changes

    useEffect(() => {
        fetchReviewData();
    }, [fetchReviewData]);

    // Sorting logic: Pending Review > Reviewed > Not Submitted
    const sortedSubmissions = useMemo(() => {
        return [...submissionsData].sort((a, b) => {
            const statusA = a.hasSubmitted ? (a.submissionDetails.isReviewed ? 2 : 1) : 3;
            const statusB = b.hasSubmitted ? (b.submissionDetails.isReviewed ? 2 : 1) : 3;

            if (statusA !== statusB) {
                return statusA - statusB; // Sort by status group first
            }

            // Within the same status group, sort by submission time (newest first) if submitted
            if (a.hasSubmitted && b.hasSubmitted) {
                const dateA = new Date(a.submissionDetails.submittedAt);
                const dateB = new Date(b.submissionDetails.submittedAt);
                return dateB - dateA; // Newest submitted first
            }
             // If status is the same and not submitted, sort by student name
            if (!a.hasSubmitted && !b.hasSubmitted) {
                 return (a.studentName || '').localeCompare(b.studentName || '');
            }
            // Keep original order if one submitted and one not within same status (shouldn't happen with above logic)
            return 0;
        });
    }, [submissionsData]);

    // Handler to open review modal (placeholder)
    const handleOpenReviewModal = (submissionDetails,studentName) => {
        console.log("Opening review for:", submissionDetails, "Student:", studentName);
        setSelectedSubmissionForReview(submissionDetails);
        setSelectedStudentName(studentName); // Store student name
        setIsReviewModalOpen(true); // Open the modal
    };

    // Handler to close review modal (placeholder)
    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedSubmissionForReview(null);
        setSelectedStudentName('');
    };

    // Handler after successful review update (placeholder)
    const handleReviewSuccess = () => {
        handleCloseReviewModal(); // Close modal
        fetchReviewData(); // Refresh the data to show updated status/marks
        toast.success("Review updated successfully!"); // Assuming review happened
    };


    if (loading) {
        return <div className="flex justify-center items-center h-64"><FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" /></div>;
    }

    if (error) {
        return (
            <div className="m-4 p-6 bg-red-50 border-l-4 border-red-500">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" size="lg" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button onClick={() => navigate(-1)} className="mt-3 text-sm text-indigo-600 hover:underline">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!assignmentDetails) {
        return <div className="p-6 text-center text-gray-500">Assignment details could not be loaded.</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline mb-2 inline-flex items-center">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-1.5" /> Back to Assignments
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{assignmentDetails.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Due: {formatDate(assignmentDetails.dueDate)} | Access: {assignmentDetails.accessType}
                </p>
                 {assignmentDetails.description && <p className="mt-2 text-gray-700 text-sm">{assignmentDetails.description}</p>}
            </div>

            {/* Submissions Table */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Student Submissions</h2>
            {sortedSubmissions.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 italic">
                    No eligible students found for this assignment, or no submissions yet.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedSubmissions.map((item) => {
                                const status = item.hasSubmitted
                                    ? (item.submissionDetails.isReviewed ? 'reviewed' : 'pending')
                                    : 'not_submitted';

                                return (
                                    <tr key={item.studentId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.studentName}</div>
                                            {/* Optional: Add email if needed */}
                                            {/* <div className="text-xs text-gray-500">{item.studentEmail}</div> */}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 capitalize">{item.studentPlan}</span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <StatusBadge status={status} />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {item.hasSubmitted ? formatDate(item.submissionDetails.submittedAt) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {item.hasSubmitted ? (
                                                <a
                                                    href={`http://localhost:5000${item.submissionDetails.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="View Submitted PDF"
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                >
                                                    <FontAwesomeIcon icon={faFilePdf} size="lg" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-center text-sm font-semibold">
                                            {item.hasSubmitted && item.submissionDetails.isReviewed ? (
                                                <span className={item.submissionDetails.marks >= 0 ? 'text-gray-900' : 'text-gray-500'}>
                                                    {item.submissionDetails.marks ?? 'N/A'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                            {item.hasSubmitted ? (
                                                <button
                                                    onClick={() => handleOpenReviewModal(item.submissionDetails)}
                                                    title={item.submissionDetails.isReviewed ? "Edit Review" : "Review Submission"}
                                                    className={`inline-flex items-center px-2.5 py-1 border border-transparent rounded shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                        item.submissionDetails.isReviewed
                                                        ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
                                                        : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1.5 h-3 w-3" />
                                                    {item.submissionDetails.isReviewed ? "Edit Review" : "Review"}
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">No submission</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Placeholder for Review Modal - Implement this next */}
            {isReviewModalOpen && selectedSubmissionForReview && (
                <ReviewSubmissionModal
                    isOpen={isReviewModalOpen}
                    onClose={handleCloseReviewModal}
                    submission={selectedSubmissionForReview} // Pass submission details
                    assignmentTitle={assignmentDetails.title}
                    onSuccess={handleReviewSuccess} // Callback on successful update
                />
            )}

        </div>
    );
}

export default AssignmentSubmissionsReviewPage;