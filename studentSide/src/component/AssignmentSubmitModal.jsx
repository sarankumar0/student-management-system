// src/component/AssignmentSubmitModal.jsx (New File)

import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faUpload, faFilePdf, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

// Expects props:
// - isOpen: boolean
// - onClose: function (to close the modal)
// - assignmentId: string
// - assignmentTitle: string
// - onSubmissionSuccess: function (optional callback after successful submission)

function AssignmentSubmitModal({ isOpen, onClose, assignmentId, assignmentTitle, onSubmissionSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null); // State for the chosen PDF file
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setError(null); // Clear previous errors on new file selection
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // Validate file type (optional, but good UX)
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                console.log("PDF file selected:", file.name);
            } else {
                setSelectedFile(null);
                event.target.value = null; // Clear the input
                setError("Invalid file type. Please select a PDF.");
                toast.error("Please select a PDF file.");
            }
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError("Please select a PDF file to submit.");
            toast.warn("No file selected.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("Authentication Error. Please log in again.");
            toast.error("Authentication Error.");
            setIsSubmitting(false);
            return;
        }

        // Create FormData to send file
        const formData = new FormData();
        formData.append('submissionFile', selectedFile); // 'submissionFile' must match multer field name

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const endpoint = `http://localhost:5000/api/student/assignments/${assignmentId}/submit`;

        try {
            console.log(`Submitting to ${endpoint}...`);
            const response = await axios.post(endpoint, formData, config);
            console.log("Submission successful:", response.data);
            toast.success(response.data.message || "Assignment submitted successfully!");

            // Call the success callback if provided (e.g., to refresh the assignment list)
            if (onSubmissionSuccess) {
                onSubmissionSuccess();
            }
            onClose(); // Close the modal

        } catch (err) {
            console.error("Error submitting assignment:", err);
            const errorMsg = err.response?.data?.message || "Failed to submit assignment.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset state when modal is closed/reopened
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);


    if (!isOpen) return null; // Don't render if not open

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
           
           
           
            {/* Modal Content Box */}
            
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Submit Assignment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {/* Modal Body with Form */}
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                    <p className="text-sm text-gray-600">
                        Submitting for: <span className="font-medium">{assignmentTitle}</span>
                    </p>

                    {/* File Input */}
                    <div>
                        <label htmlFor="submissionFile" className="block text-sm font-medium text-gray-700 mb-1">
                            Select PDF File <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            name="submissionFile" // Should match multer field name
                            id="submissionFile"
                            accept=".pdf" // Accept only PDF
                            onChange={handleFileChange}
                            required
                            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {/* Display selected file name */}
                        {selectedFile && (
                            <div className="mt-2 text-xs text-green-700 flex items-center">
                                <FontAwesomeIcon icon={faFilePdf} className="mr-1.5" /> Selected: {selectedFile.name}
                             </div>
                         )}
                    </div>

                    {/* Display Error Messages */}
                    {error && (
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    )}

                

                {/* Modal Footer */}
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit" // Triggers form onSubmit
                        form="assignment-submit-form" // Link button to form if needed (can remove if button is inside form)
                        onClick={handleSubmit} // Can also use onClick here if button type="button"
                        disabled={isSubmitting || !selectedFile} // Disable if submitting or no file selected
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 inline-flex items-center"
                    >
                        {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faUpload} className="mr-2" />}
                        {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
}

export default AssignmentSubmitModal;