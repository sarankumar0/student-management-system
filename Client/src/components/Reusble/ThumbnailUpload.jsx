import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimesCircle, faUpload } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons

// Assuming you have these states in your component:
const [currentThumbnailFile, setCurrentThumbnailFile] = useState(null);
const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');
const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(editableOutline?.thumbnailUrl || ''); // Example

const ThumbnailUpload = ({ existingThumbnailUrl, currentThumbnailFile, onFileChange, onFileRemove }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentThumbnailFile) {
            const objectUrl = URL.createObjectURL(currentThumbnailFile);
            setPreview(objectUrl);
            // Free memory when the component unmounts or file changes
            return () => URL.revokeObjectURL(objectUrl);
        } else if (existingThumbnailUrl) {
            // Construct full URL if existingThumbnailUrl is a relative path
            const fullExistingUrl = existingThumbnailUrl.startsWith('http') ? existingThumbnailUrl : `http://localhost:5000${existingThumbnailUrl}`;
            setPreview(fullExistingUrl);
        } else {
            setPreview(null); // No file, no existing thumbnail
        }
    }, [currentThumbnailFile, existingThumbnailUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileChange(file); // Pass the file up to the parent component's state
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
        onFileRemove(); // Notify parent to clear its state for currentThumbnailFile
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor="thumbnailFile" className="block text-sm font-medium text-gray-700 mb-1">
                Course Thumbnail (Optional)
            </label>
            <div
                className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 
                            ${preview ? 'border-indigo-300' : 'border-gray-300 hover:border-indigo-400'} 
                            border-dashed rounded-md cursor-pointer transition-colors duration-150 ease-in-out relative group`}
                onClick={!preview ? triggerFileInput : undefined} // Trigger file input only if no preview
            >
                <input
                    ref={fileInputRef}
                    id="thumbnailFile"
                    name="thumbnailFile"
                    type="file"
                    accept="image/jpeg, image/png, image/gif, image/webp" // Be specific about accepted types
                    onChange={handleFileChange}
                    className="sr-only" // Screen reader only, visually hidden
                />

                {preview ? (
                    <div className="relative w-full h-48 flex justify-center items-center rounded-md overflow-hidden">
                        <img
                            src={preview}
                            alt="Thumbnail preview"
                            className="object-contain max-h-full max-w-full" // Changed to object-contain
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 leading-none shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                        >
                            <FontAwesomeIcon icon={faTimesCircle} className="h-4 w-4" />
                        </button>
                         {/* "Change Image" button always visible if preview is shown */}
                         <button
                            type="button"
                            onClick={triggerFileInput}
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-all opacity-0 group-hover:opacity-100"
                        >
                            Change Image
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1 text-center">
                        <FontAwesomeIcon icon={faImage} className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500" />
                        <div className="flex text-sm text-gray-600 group-hover:text-indigo-600">
                            <p className="pl-1">
                                <span className="font-semibold">Upload a file</span> or drag and drop
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 2MB</p>
                    </div>
                )}
            </div>
            {/* Display selected file name if a new file is chosen and no preview (optional if preview is good enough) */}
            {currentThumbnailFile && !preview && (
                <p className="mt-1 text-xs text-gray-500">Selected: {currentThumbnailFile.name}</p>
            )}
        </div>
    );
};

export default ThumbnailUpload; // Example component export


// --- How to use it in your form component ---
// In your main form component (e.g., CourseFormModal.jsx or similar):

// const [editableOutline, setEditableOutline] = useState(initialData || { /* ... */ });
// const [currentThumbnailFile, setCurrentThumbnailFile] = useState(null);

// const handleThumbFileChange = (file) => {
//     setCurrentThumbnailFile(file);
//     // Also update formData if you are sending a FormData object
//     // setFormData(prev => ({...prev, thumbnailFile: file}));
// };

// const handleRemoveThumbnail = () => {
//     setCurrentThumbnailFile(null);
//     setEditableOutline(prev => ({ ...prev, thumbnailUrl: null })); // If you want to clear existing too
//     // Also update formData
//     // setFormData(prev => ({...prev, thumbnailFile: null, clearExistingThumbnail: true })); // Flag for backend
// };

// return (
//     <form onSubmit={handleSubmit}>
//         {/* ... other form fields ... */}
//
//         <ThumbnailUpload
//             existingThumbnailUrl={editableOutline?.thumbnailUrl} // Pass existing URL from your data
//             currentThumbnailFile={currentThumbnailFile}      // Pass the currently selected file
//             onFileChange={handleThumbFileChange}             // Callback for when a new file is selected
//             onFileRemove={handleRemoveThumbnail}           // Callback for when user wants to remove image
//         />
//
//         {/* ... submit button ... */}
//     </form>
// );