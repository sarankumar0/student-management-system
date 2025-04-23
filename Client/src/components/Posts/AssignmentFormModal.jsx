// src/components/admin/posts/AssignmentFormModal.jsx (New File)

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Expects props:
// - isOpen: boolean
// - onClose: function
// - onSubmit: function (receives FormData)
// - initialData: object (assignment data for editing, null for creating)
// - isEditing: boolean
// - isLoading: boolean (optional, for submit button state)

function AssignmentFormModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, isLoading = false }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '', // YYYY-MM-DD format
        accessType: 'basic',
        assignmentFile: null, // Holds the File object OR filename if just displaying
    });
    const [fileName, setFileName] = useState(''); // To display selected/existing file name

    // Effect to populate form when initialData changes (for editing)
    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                // Format date from ISO string to YYYY-MM-DD for input type="date"
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
                accessType: initialData.accessType || 'basic',
                assignmentFile: null, // Reset file input on edit load
            });
            // Display existing file name (cannot pre-fill input)
            setFileName(initialData.fileUrl ? initialData.fileUrl.split('/').pop() : '');
        } else {
            // Reset form for creation mode or if initialData clears
            setFormData({ title: '', description: '', dueDate: '', accessType: 'basic', assignmentFile: null });
            setFileName('');
        }
    }, [initialData, isEditing, isOpen]); // Rerun if modal opens or edit data changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, assignmentFile: e.target.files[0] }));
            setFileName(e.target.files[0].name);
            console.log("File selected:", e.target.files[0].name);
        } else {
            // If user cancels file selection, keep existing file info for edit mode
            if (!isEditing || !initialData?.fileUrl) {
                 setFormData(prev => ({ ...prev, assignmentFile: null }));
                 setFileName('');
             }
        }
    };

    // Internal submit handler prepares FormData
    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Simple validation
        if (!formData.title || !formData.dueDate || !formData.accessType) {
            toast.warning("Title, Due Date, and Access Type are required.");
            return;
        }

        const dataToSubmit = new FormData();
        dataToSubmit.append('title', formData.title);
        dataToSubmit.append('description', formData.description);
        dataToSubmit.append('dueDate', formData.dueDate);
        dataToSubmit.append('accessType', formData.accessType);
        // Only append file if a *new* one was selected
        if (formData.assignmentFile instanceof File) {
             dataToSubmit.append('assignmentFile', formData.assignmentFile);
         }
        // Add other fields if needed

        onSubmit(dataToSubmit); // Pass FormData to the onSubmit prop handler
    };


    if (!isOpen) return null; // Don't render if not open

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
             <ToastContainer  toastClassName="border border-gray-200 font-medium rounded-md shadow-sm"
              progressClassName="bg-indigo-600"
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">{isEditing ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {/* Modal Body with Form */}
                <form id="assignment-form" onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {/* Due Date */}
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                        <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleInputChange} required
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {/* Access Type */}
                    <div>
                        <label htmlFor="accessType" className="block text-sm font-medium text-gray-700 mb-1">Batch Access <span className="text-red-500">*</span></label>
                        <select name="accessType" id="accessType" value={formData.accessType} onChange={handleInputChange} required
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                            <option value="basic">Basic</option>
                            <option value="classic">Classic</option>
                            <option value="pro">Pro</option>
                        </select>
                    </div>
                    {/* File Upload */}
                    <div>
                        <label htmlFor="assignmentFile" className="block text-sm font-medium text-gray-700 mb-1">
                            {isEditing ? 'Replace File (Optional)' : 'Attach File (Optional)'}
                        </label>
                        {/* Display existing filename when editing */}
                        {isEditing && fileName && !formData.assignmentFile && (
                             <p className="text-xs text-gray-500 mb-1">Current file: {fileName}</p>
                         )}
                        <input type="file" name="assignmentFile" id="assignmentFile" onChange={handleFileChange}
                            accept=".pdf,.doc,.docx" // Match backend filter
                            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {/* Show newly selected file name */}
                        {formData.assignmentFile instanceof File && <p className="mt-1 text-xs text-gray-600">Selected: {formData.assignmentFile.name}</p>}
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
                    <button type="button" onClick={onClose} className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium">
                        Cancel
                    </button>
                    <button
                        type="submit" // This triggers the form's onSubmit
                        form="assignment-form" // Link button to form ID
                        disabled={isLoading} // Use isLoading prop from parent
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : null}
                        {isEditing ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssignmentFormModal;