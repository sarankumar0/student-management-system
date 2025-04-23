// src/components/admin/ReviewSubmissionModal.jsx (New File)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faFilePdf, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify'; // Use toast for feedback

function ReviewSubmissionModal({ isOpen, onClose, submission, assignmentTitle, studentName, onSuccess }) {
    // submission prop should contain: submissionId, fileUrl, marks, adminComments, submittedAt etc.
    const [marks, setMarks] = useState('');
    const [comments, setComments] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); // For displaying errors within the modal

    // Populate form when modal opens or submission data changes
    useEffect(() => {
        if (submission) {
            // Handle null/undefined for marks and comments safely
            setMarks(submission.marks !== null && submission.marks !== undefined ? String(submission.marks) : '');
            setComments(submission.adminComments || '');
            setError(null); // Clear previous errors when opening
        }
    }, [submission, isOpen]); // Rerun effect if submission or isOpen changes

    const handleMarksChange = (e) => {
        // Allow empty string, or ensure it's a number-like input
        const value = e.target.value;
        if (value === '' || /^-?\d*\.?\d*$/.test(value)) { // Basic check for number input
             setMarks(value);
        }
    };

    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("Authentication token missing.");
            setIsLoading(false);
            return;
        }

        // Convert marks back to number or null
        let marksValue = null;
        if (marks.trim() !== '') {
            const parsedMarks = parseFloat(marks);
            if (isNaN(parsedMarks)) {
                setError("Marks must be a valid number.");
                setIsLoading(false);
                return;
            }
            marksValue = parsedMarks;
        }


        const reviewData = {
            marks: marksValue,
            adminComments: comments.trim() || null // Send null if comments are empty
        };

        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            console.log(`Sending PATCH to /api/assignments/submissions/${submission.submissionId}/review`, reviewData);
            await axios.patch(
                `http://localhost:5000/api/assignments/submissions/${submission.submissionId}/review`,
                reviewData,
                config
            );

            toast.success("Review saved successfully!");
            onSuccess(); // Notify parent to refresh data
            onClose();   // Close the modal

        } catch (err) {
            console.error("Error saving review:", err.response);
            const errorMsg = err.response?.data?.message || "Failed to save review. Please try again.";
            setError(errorMsg); // Show error inside the modal
            toast.error(errorMsg); // Also show toast for visibility
        } finally {
            setIsLoading(false);
        }
    };


    if (!isOpen || !submission) return null; // Don't render if not open or no submission data

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Review Submission</h2>
                        <p className="text-sm text-gray-600">{assignmentTitle}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                            <FontAwesomeIcon icon={faUserGraduate} className="mr-1.5" /> Student: {studentName}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {/* Modal Body with Form */}
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-grow">
                    {/* View Submission Link */}
                    <div className="mb-4">
                         <a
                            href={`http://localhost:5000${submission.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Submitted PDF in new tab"
                            className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> View Submitted File
                        </a>
                         <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>

                    {/* Marks Input */}
                    <div>
                        <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                        <input
                            type="text" // Use text to allow decimals and empty string easily
                            name="marks"
                            id="marks"
                            value={marks}
                            onChange={handleMarksChange}
                            placeholder="Enter numerical marks (e.g., 85, 7.5)"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Comments Textarea */}
                    <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Comments / Feedback</label>
                        <textarea
                            name="comments"
                            id="comments"
                            rows="4"
                            value={comments}
                            onChange={handleCommentsChange}
                            placeholder="Provide feedback for the student (optional)"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                     {/* Error Display Area */}
                    {error && (
                        <div className="my-3 p-3 bg-red-50 border border-red-300 rounded-md text-sm text-red-700">
                            <p><strong>Error:</strong> {error}</p>
                        </div>
                    )}
                </form>

                {/* Modal Footer */}
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit" // Triggers form onSubmit
                        form="review-form" // Link button to form if needed (though onClick on form is used here)
                        onClick={handleSubmit} // Direct call might be simpler if form tag isn't used strictly
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center min-w-[110px]" // Added min-width
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Save Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReviewSubmissionModal;