// src/components/CoursePage.jsx (or wherever it lives)

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaCloudUploadAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf, faVideo, faEllipsisV, faTrash, faPencilAlt, faExchangeAlt, faSpinner
} from '@fortawesome/free-solid-svg-icons';

// *** NEW IMPORTS ***
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import ConfirmModal from './components/ConfirmModal'; // Adjust path if needed

// Base URL (Good practice)
const API_BASE_URL = "http://localhost:5000/api";

const CoursePage = () => {
  // --- Existing State ---
  const [selectedBatch, setSelectedBatch] = useState('pro'); // Default to 'pro' based on summaryData
  const [pdfMaterials, setPdfMaterials] = useState([]);
  const [videoMaterials, setVideoMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Keep error state for main fetch display
  const [isOpen, setIsOpen] = useState(false); // Upload/Edit Modal state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [option, setOption] = useState('pdf'); // For upload modal type selection
  const [formData, setFormData] = useState({
    title: '',
    file: null,
    // batch: '', // Removed batch from form if it's determined by accessType/category
    thumbnail: null, // Keep if handling video thumbnails
    category: '', // This maps to accessType
  });

  // --- NEW STATE for Confirmation Modal ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { id: string, type: 'pdf' | 'video', title: string }

  // --- Mock Data (Keep as is) ---
  const summaryData = [
    { level: 'pro', students: 15, completion: 85, recent: 'Advanced React Hooks', upcoming: 'GraphQL Integration (Tomorrow 2 PM)' },
    { level: 'classic', students: 45, completion: 60, recent: 'State Management', upcoming: 'Testing with Jest (Today 4 PM)' },
    { level: 'basic', students: 80, completion: 92, recent: 'Intro to JSX', upcoming: 'Component Lifecycle (Friday 10 AM)' },
  ];

  // --- Fetch Materials Function (Modified Error Handling) ---
  const fetchMaterials = useCallback(async (batchToFetch) => {
    setLoading(true);
    setError(null);
    setPdfMaterials([]);
    setVideoMaterials([]);
    setOpenMenuId(null);
    console.log(`Fetching materials for selected batch: ${batchToFetch}`);

    try {
      const [pdfResponse, videoResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/pdfs/${batchToFetch}`),
        axios.get(`${API_BASE_URL}/videos/${batchToFetch}`)
      ]);

      setPdfMaterials(pdfResponse.data || []);
      setVideoMaterials(videoResponse.data || []);
    } catch (err) {
      console.error('Error fetching materials', err);
      let errorMsg = 'Failed to fetch materials.';
      if (err.response) {
        console.error("Server Response:", err.response.data);
        errorMsg += ` Server responded with ${err.response.status}.`;
      }
      // Use toast for immediate feedback, keep error state for display area
      // toast.error("Failed to fetch materials. Please refresh.");
      setError(errorMsg); // Set error state to display in the main content area
      setPdfMaterials([]);
      setVideoMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []); // Keep fetchMaterials in useCallback dependencies

  useEffect(() => {
    fetchMaterials(selectedBatch);
  }, [selectedBatch, fetchMaterials]);

  // --- Event Listener for Closing Menu (Keep as is) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('[data-menu-button="true"]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Menu Toggle (Keep as is) ---
  const handleMenuToggle = (materialId) => {
    setOpenMenuId(prevId => (prevId === materialId ? null : materialId));
  };

  // --- Batch Selection (Keep as is) ---
  const handleBatchSelect = (batchLevel) => {
    setSelectedBatch(batchLevel);
  };

  // --- Form Input Change (Keep as is) ---
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] })); // Handle file inputs (file and thumbnail)
    } else {
      setFormData(prev => ({ ...prev, [name]: value })); // Handle text inputs and select
    }
  };

  // --- Modal Close Function (Enhanced Reset) ---
  const closeModal = () => {
    setIsOpen(false);
    setIsEditMode(false);
    setEditingMaterial(null);
    setItemToDelete(null); // Also clear delete item state
    setOption('pdf'); // Reset modal option
    // Reset formData to default values
    setFormData({ title: '', file: null, thumbnail: null, category: '' });
  };

  // --- Close Confirmation Modal ---
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
  };

  // --- Action Handler (Calls specific handlers) ---
  const handleAction = (action, materialType, materialId) => {
    console.log(`Action triggered: ${action}, Type: ${materialType}, ID: ${materialId}`);
    setOpenMenuId(null); // Close menu

    switch (action) {
      case 'Delete':
        // Find the material to get its title for the confirmation message
        const list = materialType === 'pdf' ? pdfMaterials : videoMaterials;
        const material = list.find(m => m._id === materialId);
        if (material) {
            handleDeleteRequest(materialId, materialType, material.title); // Pass title
        } else {
            toast.error("Could not find item details to delete.");
        }
        break;
      case 'Edit':
        handleEditStart(materialId, materialType);
        break;
      case 'Change Batch':
        toast.info(`Action: ${action} - Not yet implemented.`);
        // Implement later if needed
        break;
      // case 'Archive':
      //   toast.info(`Action: ${action} - Not yet implemented.`);
      //   // Implement later if needed
      //   break;
      default:
        console.warn("Unhandled action:", action);
    }
  };

  // --- Upload Handler (Using Toasts) ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const { title, category, file } = formData;

    // Validation with toasts
    if (!title) { toast.warn('Please enter a title.'); return; }
    if (!file) { toast.warn('Please select a file to upload.'); return; }
    if (!category) { toast.warn('Please select a category (access level).'); return; }

    const form = new FormData();
    form.append('title', title);
    form.append('accessType', category); // Map category to accessType
    form.append('file', file);
    if (formData.thumbnail && file.type.startsWith("video/")) { // Append thumbnail only for video
        form.append('thumbnail', formData.thumbnail);
    }

    let endpoint = '';
    let uploadType = '';

    if (file.type.startsWith("application/pdf")) {
      endpoint = `${API_BASE_URL}/pdfs/pdfs`; // Ensure this endpoint matches your backend POST route for PDFs
      uploadType = 'PDF';
    } else if (file.type.startsWith("video/")) {
      endpoint = `${API_BASE_URL}/videos`; // POST Video endpoint
      uploadType = 'Video';
    } else {
      toast.error("Unsupported file type. Please upload PDF or Video.");
      return;
    }

    console.log(`Uploading ${uploadType} to ${endpoint}`);
    const toastId = toast.loading(`Uploading ${uploadType}...`, { theme: "colored" }); // Show loading toast

    try {
      await axios.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.update(toastId, { render: `${uploadType} uploaded successfully!`, type: "success", isLoading: false, autoClose: 3000, theme: "colored" });
      fetchMaterials(selectedBatch); // Refresh list for current view
      closeModal(); // Close upload/edit modal

    } catch (err) {
      console.error(`Error uploading ${uploadType}`, err);
      let errorMsg = `Error uploading ${uploadType}. Please try again.`;
      if (err.response?.data?.message) {
        errorMsg = `Upload failed: ${err.response.data.message}`;
      } else if (err.request) {
        errorMsg = "Upload failed: No response from server.";
      }
      toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 5000, theme: "colored" });
    }
  };

  // --- Delete Handler (Requests Confirmation) ---
  const handleDeleteRequest = (id, type, title) => {
      if (!id || !type || !title) {
          toast.error("Missing information to initiate deletion.");
          return;
      }
      setItemToDelete({ id, type, title });
      setIsConfirmModalOpen(true);
  };

  // --- Delete Confirmation Handler (Performs Actual Deletion) ---
  const handleDeleteConfirm = async () => {
      if (!itemToDelete) return; // Should not happen, but safety check

      const { id, type } = itemToDelete;
      closeConfirmModal(); // Close modal immediately

      // Check type again for safety
      if (type !== 'pdf' && type !== 'video') {
          toast.error("Cannot delete: Invalid item type.");
          return;
      }

      console.log(`Attempting to delete ${type} with ID: ${id}`);
      const toastId = toast.loading(`Deleting ${type.toUpperCase()}...`, { theme: "colored" });

      try {
          const endpoint = `${API_BASE_URL}/${type}s/${id}`; // Correctly forms /api/pdfs/:id or /api/videos/:id
          console.log(`Calling DELETE ${endpoint}`);
          await axios.delete(endpoint);

          toast.update(toastId, { render: `${type.toUpperCase()} deleted successfully.`, type: "success", isLoading: false, autoClose: 3000, theme: "colored" });
          fetchMaterials(selectedBatch); // Refresh list for the current batch view

      } catch (err) {
          console.error(`Error deleting ${type} ID ${id}:`, err);
          let errorMsg = `Failed to delete ${type.toUpperCase()}.`;
          if (err.response?.data?.message) {
              errorMsg += ` Server Error: ${err.response.data.message}`;
          } else if (err.request) {
              errorMsg += " No response from server.";
          }
          toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 5000, theme: "colored" });
      } finally {
          setItemToDelete(null); // Clear item even on error
      }
  };


  // --- Edit Handlers (Using Toasts) ---
  const handleEditStart = (materialId, materialType) => {
    const materialList = materialType === 'pdf' ? pdfMaterials : videoMaterials;
    const materialToEdit = materialList.find(m => m._id === materialId);

    if (!materialToEdit) {
      toast.error("Error: Could not find the item to edit.");
      return;
    }

    setEditingMaterial(materialToEdit);
    setIsEditMode(true);
    setOption(materialType); // Set modal option based on material type

    setFormData({
      title: materialToEdit.title,
      category: materialToEdit.accessType,
      file: null, // User must re-select file to change it
      thumbnail: null, // User must re-select thumbnail to change it
    });

    setIsOpen(true); // Open the modal
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editingMaterial) {
      toast.error("Error: No material selected for editing.");
      return;
    }

    const { _id } = editingMaterial;
    // Determine type based on which list it came from or maybe a field if consistent
    const materialType = pdfMaterials.some(m => m._id === _id) ? 'pdf' : 'video';
    const { title, category, file, thumbnail } = formData;

    if (!title || !category) {
      toast.warn("Please ensure Title and Category are filled.");
      return;
    }

    const endpoint = `${API_BASE_URL}/${materialType}s/${_id}`;
    console.log(`Calling PATCH ${endpoint}`);

    let dataPayload;
    let headers = { 'Content-Type': 'application/json' };

    // Check if a NEW file or NEW thumbnail was selected
    if (file || (thumbnail && materialType === 'video')) {
      console.log("New file/thumbnail selected for edit, sending multipart/form-data");
      dataPayload = new FormData();
      dataPayload.append('title', title);
      dataPayload.append('accessType', category);
      if (file) {
        dataPayload.append('file', file); // Append new file if selected
      }
      if (thumbnail && materialType === 'video') {
        dataPayload.append('thumbnail', thumbnail); // Append new thumbnail if selected (only for videos)
      }
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      console.log("No new file/thumbnail selected, sending JSON data");
      // Send only fields that can be updated via JSON
      dataPayload = { title, accessType: category };
    }

    const toastId = toast.loading(`Updating ${materialType.toUpperCase()}...`, { theme: "colored" });

    try {
      await axios.patch(endpoint, dataPayload, { headers: headers }); // Use PATCH

      toast.update(toastId, { render: `${materialType.toUpperCase()} updated successfully!`, type: "success", isLoading: false, autoClose: 3000, theme: "colored" });
      closeModal();
      fetchMaterials(selectedBatch);

    } catch (err) {
      console.error(`Error updating ${materialType} ID ${_id}:`, err);
      let errorMsg = `Failed to update ${materialType.toUpperCase()}.`;
      if (err.response?.data?.message) {
        errorMsg += ` Server Error: ${err.response.data.message}`;
      } else if (err.request) {
        errorMsg += " No response from server.";
      }
      toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 5000, theme: "colored" });
      // Keep modal open on error for correction
    }
  };

  // --- Batch Styles (Keep as is) ---
  const getBatchStyles = (level) => {
    // ... (keep existing implementation)
    switch (level.toLowerCase()) {
      case 'pro': return { border: 'border-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50', ring: 'focus:ring-indigo-500', activeRing: 'ring-indigo-500' };
      case 'classic': return { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', ring: 'focus:ring-purple-500', activeRing: 'ring-purple-500' };
      case 'basic': return { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', ring: 'focus:ring-teal-500', activeRing: 'ring-teal-500' };
      default: return { border: 'border-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', ring: 'focus:ring-gray-500', activeRing: 'ring-gray-500' };
    }
  };

  // --- JSX Rendering ---
  return (
    // Add ToastContainer at the top level of the returned JSX
    <div className="mx-16 my-12 md:m-8 lg:ms-20 min-h-screen">
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" // Use colored theme for better distinction
      />

      {/* --- Header Bar --- */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between w-full mb-6 rounded-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search materials..." // Updated placeholder
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
            // Add state and onChange for search functionality later
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Upload Button */}
        <button
          className="px-5 py-2 bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-indigo-800 transition-all text-sm shadow-sm"
           // Ensure this opens the modal in 'upload' mode
           onClick={() => {
             setIsEditMode(false);
             setEditingMaterial(null);
             // Reset form specifically for upload
             setFormData({ title: '', file: null, thumbnail: null, category: '' });
             setOption('pdf'); // Default to PDF for new uploads
             setIsOpen(true);
            }}
        >
          <FaCloudUploadAlt /> Upload
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <div className="p-4 md:p-6 bg-transparent"> {/* Changed background to transparent */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">

          {/* --- Left Sticky Column --- */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-6 lg:self-start">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Course Overview</h1>
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-600 mb-1">Select Batch View</h2>
              {summaryData.map((summary) => {
                const styles = getBatchStyles(summary.level);
                const isActive = selectedBatch === summary.level.toLowerCase();
                return (
                  <div
                    key={summary.level}
                    onClick={() => handleBatchSelect(summary.level.toLowerCase())}
                    className={`bg-white rounded-lg shadow-md border-l-4 ${styles.border} p-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:bg-opacity-90 focus:outline-none focus:ring-2 ${styles.ring} focus:ring-offset-1 ${isActive ? `ring-2 ${styles.activeRing} ring-offset-1 scale-[1.02] shadow-lg ${styles.bg}` : 'hover:bg-gray-50'}`}
                    role="button" tabIndex={0} aria-pressed={isActive}
                  >
                    <h3 className={`text-xl font-bold mb-3 ${styles.text}`}>
                      {summary.level} Batch {isActive && <span className="text-xs font-normal ml-2">(Selected)</span>}
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-600">
                       {/* ... (summary details) */}
                       <p><span className="font-semibold text-gray-700">Total Students:</span> {summary.students}</p>
                       <p><span className="font-semibold text-gray-700">Completion Rate:</span> {summary.completion}%</p>
                       <p><span className="font-semibold text-gray-700">Recent Class:</span> {summary.recent}</p>
                       <p><span className="font-semibold text-gray-700">Upcoming Class:</span> {summary.upcoming}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Right Content Column --- */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
              {selectedBatch} Materials
            </h2>

            {loading && ( <div className="flex justify-center items-center p-10 text-indigo-600"><FontAwesomeIcon icon={faSpinner} spin size="2x" /><span className="ml-3 text-lg">Loading Materials...</span></div> )}
            {error && !loading && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error!</strong><span className="block sm:inline ml-2">{error}</span></div> )}

            {!loading && !error && (
              <div className="space-y-6">
                {/* PDF Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-3 border-b pb-1">PDF Documents ({pdfMaterials.length})</h3>
                  {pdfMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pdfMaterials.map((material) => (<MaterialCard key={material._id} material={material} type="pdf" openMenuId={openMenuId} menuRef={menuRef} onMenuToggle={handleMenuToggle} onAction={handleAction} />))}
                    </div>
                  ) : ( <p className="text-gray-500 italic text-sm">No PDF materials found for '{selectedBatch}'.</p> )}
                </div>
                {/* Video Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-3 border-b pb-1">Video Lessons ({videoMaterials.length})</h3>
                  {videoMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoMaterials.map((video) => (<MaterialCard key={video._id} material={video} type="video" openMenuId={openMenuId} menuRef={menuRef} onMenuToggle={handleMenuToggle} onAction={handleAction} />))}
                    </div>
                  ) : ( <p className="text-gray-500 italic text-sm">No video materials found for '{selectedBatch}'.</p> )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Upload/Edit Modal --- */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full sm:w-3/4 md:w-1/2 max-w-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b font-bold text-lg flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-t-lg">
              <span>{isEditMode ? `Edit ${editingMaterial?.fileUrl ? 'PDF' : 'Video'}` : 'Upload New Material'}</span>
              <select name="category" value={formData.category} onChange={handleInputChange} className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required >
                <option value="">Select Category</option>
                <option value="pro">Pro</option>
                <option value="classic">Classic</option>
                <option value="basic">Basic</option>
              </select>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow">
               {/* Type Selector (Only for Upload mode) */}
              {!isEditMode && (
                  <div className="flex gap-4 mb-6">
                    <button onClick={() => setOption('pdf')} className={`px-4 py-2 rounded-lg text-sm font-medium ${option === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} disabled={isEditMode}>Upload PDF</button>
                    <button onClick={() => setOption('video')} className={`px-4 py-2 rounded-lg text-sm font-medium ${option === 'video' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} disabled={isEditMode}>Upload Video</button>
                  </div>
              )}

              {/* Common Title Input */}
              <div className="mb-4">
                  <label htmlFor="material-title" className="block mb-1 font-medium text-sm text-gray-700">Title <span className="text-red-500">*</span></label>
                  <input id="material-title" type="text" name="title" placeholder={`Enter ${option === 'pdf' ? 'PDF' : 'Video'} Title`} value={formData.title} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>

              {/* Conditional Fields */}
              {option === 'pdf' ? (
                  // PDF File Input
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-sm text-gray-700">{isEditMode ? 'Replace PDF (Optional)' : 'Upload PDF File'} <span className="text-red-500">*</span></label>
                    <label className="w-full border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 block text-sm text-gray-500">
                      {formData.file ? <span className="text-indigo-700 font-medium">{formData.file.name}</span> : (isEditMode ? 'Select new PDF to replace' : 'Click or Drag & Drop PDF here')}
                      <input type="file" name="file" accept=".pdf" onChange={handleInputChange} className="hidden" />
                    </label>
                     {isEditMode && editingMaterial?.fileUrl && <p className="text-xs text-gray-500 mt-1">Current file: {editingMaterial.fileUrl.split('/').pop()}</p>}
                  </div>
              ) : (
                  // Video Fields
                  <>
                    {/* Video Thumbnail Input */}
                    <div className="mb-4">
                       <label className="block mb-1 font-medium text-sm text-gray-700">{isEditMode ? 'Replace Thumbnail (Optional)' : 'Select Thumbnail'}</label>
                       <label className="w-full border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 block text-sm text-gray-500">
                           {formData.thumbnail ? <span className="text-indigo-700 font-medium">{formData.thumbnail.name}</span> : (isEditMode ? 'Select new thumbnail to replace' : 'Click or Drag & Drop Image')}
                           <input type="file" name="thumbnail" accept="image/*" onChange={handleInputChange} className="hidden" />
                       </label>
                       {isEditMode && editingMaterial?.thumbnailUrl && <p className="text-xs text-gray-500 mt-1">Current thumbnail: {editingMaterial.thumbnailUrl.split('/').pop()}</p>}
                   </div>
                   {/* Video File Input */}
                    <div className="mb-4">
                       <label className="block mb-1 font-medium text-sm text-gray-700">{isEditMode ? 'Replace Video (Optional)' : 'Upload Video File'} <span className="text-red-500">*</span></label>
                       <label className="w-full border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 block text-sm text-gray-500">
                           {formData.file ? <span className="text-indigo-700 font-medium">{formData.file.name}</span> : (isEditMode ? 'Select new video to replace' : 'Click or Drag & Drop Video')}
                           <input type="file" name="file" accept="video/*" onChange={handleInputChange} className="hidden" />
                       </label>
                       {isEditMode && editingMaterial?.filePath && <p className="text-xs text-gray-500 mt-1">Current video: {editingMaterial.filePath.split('/').pop()}</p>}
                   </div>
                  </>
              )}
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end flex-shrink-0 bg-gray-50 rounded-b-lg space-x-3">
              <button onClick={closeModal} type="button" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium transition duration-150" > Cancel </button>
              <button onClick={isEditMode ? handleEditSubmit : handleUpload} type="button" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition duration-150 disabled:opacity-60 shadow-sm" disabled={!formData.title || !formData.category || (!isEditMode && !formData.file)} >
                {isEditMode ? 'Save Changes' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && itemToDelete && (
          <ConfirmModal
              isOpen={isConfirmModalOpen}
              onClose={closeConfirmModal}
              onConfirm={handleDeleteConfirm}
              title={`Confirm Deletion`}
              message={`Are you sure you want to delete the ${itemToDelete.type.toUpperCase()} "${itemToDelete.title}"? This action cannot be undone.`}
          />
      )}

    </div> // End of main container
  );
};


// --- Material Card Component (Minor URL fix) ---
function MaterialCard({ material, type, openMenuId, menuRef, onMenuToggle, onAction }) {
    const isMenuOpen = openMenuId === material._id;
    // Determine the correct URL field based on type
    const fileUrlField = type === 'pdf' ? 'fileUrl' : 'filePath';
    const url = material[fileUrlField];
    const fullUrl = url ? `${API_BASE_URL}${url}` : '#'; // Construct full URL if path exists

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 ease-in-out p-4 relative group border border-gray-200">
            <div className="flex justify-between items-start gap-3">
                {/* Left side: Icon, Title, Badge */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <FontAwesomeIcon
                        icon={type === 'pdf' ? faFilePdf : faVideo}
                        className={`w-5 h-5 flex-shrink-0 ${type === 'pdf' ? 'text-red-500' : 'text-blue-500'}`}
                    />
                    {/* Title (Link) */}
                     <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-700 hover:text-indigo-600 truncate text-sm md:text-base flex-grow"
                        title={material.title}
                    >
                        {material.title}
                    </a>
                    {/* Access Type Badge */}
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
                         ${material.accessType.toLowerCase() === 'pro' ? 'bg-indigo-500' :
                           material.accessType.toLowerCase() === 'classic' ? 'bg-purple-500' :
                           material.accessType.toLowerCase() === 'basic' ? 'bg-teal-500' :
                           'bg-gray-400'}`}>
                         {material.accessType}
                    </span>
                </div>

                {/* Right side: Menu Button */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => onMenuToggle(material._id)}
                        data-menu-button="true"
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-400 transition duration-150"
                        aria-haspopup="true" aria-expanded={isMenuOpen}
                    >
                        <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4" />
                    </button>
                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div ref={isMenuOpen ? menuRef : null} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 py-1" role="menu" aria-orientation="vertical" >
                            <MenuItem onClick={() => onAction('Edit', type, material._id)} icon={faPencilAlt}>Edit Details</MenuItem>
                            <MenuItem onClick={() => onAction('Change Batch', type, material._id)} icon={faExchangeAlt}>Change Batch</MenuItem>
                            <div className="border-t border-gray-100 my-1"></div>
                            <MenuItem onClick={() => onAction('Delete', type, material._id)} icon={faTrash} isDestructive={true}>Delete {type}</MenuItem>
                        </div>
                    )}
                </div>
            </div>
            {/* Optional: Video Preview */}
            {type === 'video' && (
                 <div className="mt-3 aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                     {/* If you have thumbnails later */}
                     {/* material.thumbnailUrl ? <img src={`${API_BASE_URL}${material.thumbnailUrl}`} alt="thumbnail" className="w-full h-full object-cover"/> : */}
                     <FontAwesomeIcon icon={faVideo} className="text-gray-300 text-3xl" />
                 </div>
             )}
        </div>
    );
}

// --- Reusable Menu Item Component (Keep as is) ---
function MenuItem({ onClick, icon, children, isDestructive = false }) {
    // ... (keep existing implementation)
    const textColor = isDestructive ? 'text-red-600 hover:text-red-800' : 'text-gray-700 hover:text-indigo-800';
    const bgColor = isDestructive ? 'hover:bg-red-50' : 'hover:bg-indigo-50';

    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${textColor} ${bgColor} transition duration-150 ease-in-out`}
            role="menuitem"
        >
            <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2.5" />
            {children}
        </button>
    );
}


export default CoursePage;