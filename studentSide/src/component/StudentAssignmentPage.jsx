// src/component/StudentAssignmentsPage.jsx (New File)

import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faClipboardList, faFilePdf, faCalendarAlt, faUpload,faEye,faCheckCircle, faClock, faCommentDots, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import AssignmentSubmitModal from './AssignmentSubmitModal';
// Reusable Badge Component (can be imported if defined centrally)
const AccessTypeBadge = ({ accessType }) => (
    <span className={`
        inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize font-medium leading-none ml-2
        ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
          accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
          accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
          'bg-gray-500'}
    `}>
        {accessType || 'N/A'}
    </span>
);

// NEW: Status Badge for student side
const ReviewStatusBadge = ({ isReviewed }) => {
    const status = isReviewed ? 'reviewed' : 'pending';
    let bgColor, textColor, icon, text;
    if (status === 'reviewed') {
        bgColor = 'bg-green-100'; textColor = 'text-green-800'; icon = faCheckCircle; text = 'Reviewed';
    } else {
        bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; icon = faClock; text = 'Pending Review';
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <FontAwesomeIcon icon={icon} className="mr-1 h-3 w-3" />
            {text}
        </span>
    );
};



// Format Date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) { return 'Invalid Date'; }
};

// Helper to check if due date has passed
const isPastDue = (dateString) => {
     if (!dateString) return false;
     try {
        const dueDate = new Date(dateString);
        const today = new Date();
        // Set today to the end of the day for comparison
        today.setHours(23, 59, 59, 999);
        return dueDate < today;
    } catch(e) { return false; }
}


function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For potential navigation later
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null); // Store { id, title } for modal

    const fetchAssignments = useCallback(async () => {
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
            // Expect backend to return assignments with 'submission' field populated
            const response = await axios.get('http://localhost:5000/api/student/assignments', config);
            console.log("Student assignments data received:", response.data);
             // *** TEMPORARY LOGGING ***
        console.log("DEBUG: Raw assignments data received by frontend:", JSON.stringify(response.data, null, 2));
        // Find the specific assignment if possible for easier debugging:
        const reviewedAssignment = response.data.assignments?.find(a => a._id === 'THE_ID_OF_THE_ASSIGNMENT_YOU_REVIEWED'); // Replace with actual ID if known
        console.log("DEBUG: Details for specific reviewed assignment:", reviewedAssignment);
            setAssignments(response.data.assignments || []);
        } catch (err) {
            console.error("Error fetching student assignments:", err);
            setError(err.response?.data?.message || "Failed to load assignments.");
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    }, []); // No dependencies needed if it doesn't rely on component state/props

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);
    // --- Placeholder Handler for Submit Button ---
    const handleOpenSubmitModal = (assignmentId, assignmentTitle) => {
        setSelectedAssignment({ id: assignmentId, title: assignmentTitle });
        setIsSubmitModalOpen(true);
    };

    // --- Close Modal Handler ---
    const handleCloseSubmitModal = () => {
        setIsSubmitModalOpen(false);
        setSelectedAssignment(null);
    };

   

    // --- Handler for after successful submission ---
    const handleSubmissionSuccess = () => {
        // Potentially refresh the assignments list to show updated status if needed
        // Or just rely on the fact that next time they visit, submit button will be disabled/changed
         console.log("Submission successful, modal closed.");
          fetchAssignments(); // Optional: uncomment to refresh list immediately
     };


    if (loading) {
        return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /></div>;
    }

    if (error) {
        return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Assignments</h1>
    
            {assignments.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                    <p className="text-gray-500 italic">You currently have no assignments due.</p>
                </div>
            ) : (
                <div className="space-y-4">
             {assignments.map((assign) => {
    const pastDue = isPastDue(assign.dueDate);
    // CORRECTED: Use the 'hasSubmitted' boolean directly from the backend data
    const hasSubmitted = assign.hasSubmitted;
    const submissionDetails = assign.submissionDetails;
    return (
        <div
            key={assign._id}
            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                // Logic using the corrected 'hasSubmitted'
                hasSubmitted? (submissionDetails?.isReviewed ? 'border-green-500' : 'border-yellow-500') // Green if reviewed, Yellow if pending
                : (pastDue ? 'border-red-500 opacity-80' : 'border-blue-500')
            }`}
        > {/* --- Assignment Header --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 md:mb-0">{assign.title}</h2>
                <div className="flex items-center text-sm flex-wrap"> {/* Added flex-wrap */}
                    <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className={`mr-1.5 ${hasSubmitted ? 'text-gray-500' : pastDue ? 'text-red-600' : 'text-green-600'}`}
                    />
                    <span className={hasSubmitted ? 'text-gray-500' : pastDue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {hasSubmitted
                            // CORRECTED: Access submission date via 'submissionDetails'
                            ? `Submitted: ${formatDate(assign.submissionDetails?.submittedAt)}`
                            : `Due: ${formatDate(assign.dueDate)} ${pastDue ? '(Past Due)' : ''}`
                        }
                    </span>
                    <AccessTypeBadge accessType={assign.accessType} />
                </div>
            </div>

            {assign.description && (
                <p className="text-sm text-gray-600 mb-3">{assign.description}</p>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3">
                {/* Link to view original assignment file (remains the same) */}
                <div className="space-y-2">
                    {assign.fileUrl ? (
                        <a
                            href={`http://localhost:5000${assign.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View original assignment details"
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                            <FontAwesomeIcon icon={faFilePdf} className="mr-1.5" /> View Assignment File
                        </a>
                    ) : (
                         <span className="text-sm text-gray-400 italic">No assignment file attached.</span>
                    )}
                </div>

                {/* Conditional Button/Link: View Submission OR Submit */}
                <div> {/* Added div for layout consistency */}
                    {hasSubmitted ? ( // Now uses the correct 'hasSubmitted'
                        <a
                            // CORRECTED: Access submitted file URL via 'submissionDetails.submissionFileUrl'
                            // Use optional chaining (?.) for safety in case details are unexpectedly missing
                            href={`http://localhost:5000${assign.submissionDetails?.submissionFileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View your submitted file"
                            className="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 whitespace-nowrap"
                        >
                            <FontAwesomeIcon icon={faEye} className="mr-2" /> View Submission
                        </a>
                    ) : (
                        <button
                            onClick={() => handleOpenSubmitModal(assign._id, assign.title)}
                            disabled={pastDue}
                            className="inline-flex items-center px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" /> Submit Assignment
                        </button>
                    )}
                </div>
            </div>
            {hasSubmitted && submissionDetails && (
        <div className="mt-4 pt-3 border-t border-dashed border-gray-300 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Submission Status:</span>
                <ReviewStatusBadge isReviewed={submissionDetails.isReviewed} />
            </div>

            {/* Show Marks only if reviewed */}
            {submissionDetails.isReviewed && (
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                         <FontAwesomeIcon icon={faGraduationCap} className="mr-1.5 text-gray-500" /> Marks:
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                        {submissionDetails.marks !== null && submissionDetails.marks !== undefined
                            ? submissionDetails.marks
                            : <span className="italic text-gray-500">Not Graded</span>}
                    </span>
                </div>
            )}

            {/* Show Comments only if reviewed and comments exist */}
            {submissionDetails.isReviewed && submissionDetails.adminComments && (
                <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FontAwesomeIcon icon={faCommentDots} className="mr-1.5 text-gray-500" /> Feedback:
                    </p>
                    <blockquote className="text-sm text-gray-600 bg-gray-50 p-2 border-l-4 border-gray-300 italic">
                        {submissionDetails.adminComments}
                    </blockquote>
                </div>
            )}
        </div>
    )}
            


        </div>
    );
})}

{/* Assignment Submission Modal (remains the same if correctly implemented) */}
{selectedAssignment && (
     <AssignmentSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={handleCloseSubmitModal}
        assignmentId={selectedAssignment.id}
        assignmentTitle={selectedAssignment.title}
        // Refreshing the list on success is good practice
        onSubmissionSuccess={() => { handleSubmissionSuccess(); fetchAssignments(); }}
    />
)}
            </div>
        )}
    </div>
    );
    
}

export default StudentAssignmentsPage;