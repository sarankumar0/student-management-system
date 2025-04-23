import { useState, useEffect,useRef,useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaCloudUploadAlt, } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf, faVideo, faEllipsisV, faTrash, faPencilAlt, faArchive, faExchangeAlt, faSpinner
} from '@fortawesome/free-solid-svg-icons';
const CoursePage = () => {
  const [batch, setBatch] = useState('basic');
  const [pdfMaterials, setPdfMaterials] = useState([]);
  const [videoMaterials, setVideoMaterials] = useState([]);
  const [userBatch, setUserBatch] = useState('basic');
  const [selectedBatch, setSelectedBatch] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [option, setOption] = useState('pdf');
  const [formData, setFormData] = useState({
    title: '',
    file: null,
    batch:'',
    thumbnail: null,
    category: '',
  });
  const summaryData = [
    { level: 'pro', students: 15, completion: 85, recent: 'Advanced React Hooks', upcoming: 'GraphQL Integration (Tomorrow 2 PM)' },
    { level: 'classic', students: 45, completion: 60, recent: 'State Management', upcoming: 'Testing with Jest (Today 4 PM)' },
    { level: 'basic', students: 80, completion: 92, recent: 'Intro to JSX', upcoming: 'Component Lifecycle (Friday 10 AM)' },
  ];
  const fetchMaterials = useCallback(async (batchToFetch) => {
    setLoading(true);
    setError(null);
    setPdfMaterials([]); // Clear previous materials
    setVideoMaterials([]);
    setOpenMenuId(null); // Close any open menus on refetch
    console.log(`Fetching materials for selected batch: ${batchToFetch}`);
  console.log(`Fetching materials for batch: ${batchToFetch}`);
    try {
      const [pdfResponse, videoResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/pdfs/${batchToFetch}`),
        axios.get(`http://localhost:5000/api/videos/${batchToFetch}`)
      ]);

      console.log("PDFs fetched:", pdfResponse.data);
      setPdfMaterials(pdfResponse.data || []); // Ensure it's an array

      console.log("Videos fetched:", videoResponse.data);
      setVideoMaterials(videoResponse.data || []);
    }  catch (err) {
      console.error('Error fetching materials', err);
      let errorMsg = 'Failed to fetch materials.';
       if (err.response) {
         console.error("Server Response:", err.response.data);
         errorMsg += ` Server responded with ${err.response.status}.`;
       }
      alert('Failed to fetch materials. Please refresh or check selection.'); // User feedback
      setError(errorMsg);
      setPdfMaterials([]); // Clear state on error
      setVideoMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []); 
  
  useEffect(() => {
    fetchMaterials(selectedBatch);
  }, [selectedBatch, fetchMaterials]); 

  const handleMenuToggle = (materialId) => {
    setOpenMenuId(prevId => (prevId === materialId ? null : materialId));
  };

  const handleBatchSelect = (batchLevel) => {
    setSelectedBatch(batchLevel); // Update state, which triggers useEffect -> fetchMaterials
  };

   // **TODO**: Implement actual backend calls for these actions
   const handleAction = (action, materialType, materialId) => {
    console.log(`Action triggered: ${action}, Type: ${materialType}, ID: ${materialId}`);
    setOpenMenuId(null); // Close menu immediately

    switch (action) {
      case 'Delete':
        // Call the specific delete handler
        handleDelete(materialId, materialType);
        break;
      case 'Edit':
        // Call the new edit handler (we'll create this next)
        handleEditStart(materialId, materialType);
        break;
      case 'Change Batch':
        // Placeholder - Implement later if needed
        alert(`Action: ${action}\nType: ${materialType}\nID: ${materialId}\n(Implement backend call)`);
        break;
      case 'Archive':
         // Placeholder - Implement later if needed
        alert(`Action: ${action}\nType: ${materialType}\nID: ${materialId}\n(Implement backend call)`);
        break;
      default:
        console.warn("Unhandled action:", action);
    }
  };

 const handleInputChange = (e) => {
  const { name, value, type, files } = e.target;

  if (type === 'file') {
    setFormData(prev => ({ ...prev, file: files[0] }));
  } else {
    // This should handle both text inputs and the select dropdown
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

useEffect(() => {
  const handleClickOutside = (event) => {
    // Check if click is outside menu AND not on a menu toggle button
     if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('[data-menu-button="true"]')) {
       setOpenMenuId(null);
     }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []); // Empty dependency array, runs once

  const handleUpload = async (e) => {
    e.preventDefault();
    const { title, category,  file } = formData;
    console.log("Checking upload data before validation:", { title, category, file });

   if (!title) {
      alert('Please enter a title.');
      return;
    }
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    // Category is required for setting accessType
    if (!category) { 
      alert('Please select a category (access level) from the dropdown.');
      return;
    }
    // Re-evaluating batch - see point 2
    // if (!formBatch) {
    //    alert('Batch information is missing.'); // Check batch specifically
    //    console.error('formData.batch is missing!');
    //    return;
    // }

    const form = new FormData();
    form.append('title', formData.title);
    // form.append('batch', formData.batch); // Ensure correct field name
    form.append('file', formData.file);
    form.append('accessType',formData.category);
    let endpoint = '';
    let uploadType = '';

    if(file.type.startsWith("application/pdf")){
      endpoint=`http://localhost:5000/api/pdfs/pdfs`;
      uploadType='PDF';
    }
    else if(file.type.startsWith("video/")){
      endpoint = `http://localhost:5000/api/videos`; // POST Video
      uploadType = 'Video';
    } else {
      console.error("Unsupported file type:", file.type);
      alert("Unsupported file type. Please upload PDF or Video."); // User feedback
      return;
    }
    console.log(`Uploading ${uploadType} to ${endpoint} with data:`, { title,  category });

    try {
      await axios.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Add withCredentials if needed for cookies/sessions, matching CORS config
        // withCredentials: true,
      });

      console.log(`${uploadType} Upload successful`);
      alert(`${uploadType} uploaded successfully!`); // User feedback
      fetchMaterials(); // Refresh list
      setIsOpen(false); // Close modal
      // Reset form state completely
      setFormData({ title: '', file: null, batch: 'basic', category: '' });
    } catch (err) {
      console.error(`Error uploading ${uploadType}`, err);
      let errorMsg = `Error uploading ${uploadType}. Please try again.`;
      if (err.response && err.response.data && err.response.data.message) {
         errorMsg = `Upload failed: ${err.response.data.message}`;
         console.error("Server Response:", err.response.data);
      } else if (err.request) {
         errorMsg = "Upload failed: No response from server.";
      }
      alert(errorMsg); // Show specific error to user
    }
  };

  const handleDelete = async (id, type) => {
    // Check if type is valid to prevent constructing bad URLs
    if (type !== 'pdf' && type !== 'video') {
        console.error("Invalid type for delete:", type);
        alert("Cannot delete: Invalid item type.");
        return;
    }
    if (!window.confirm(`Are you sure you want to delete this ${type.toUpperCase()}? This action cannot be undone.`)) {
      return;
    }
    console.log(`Attempting to delete ${type} with ID: ${id}`);
    try {
      const endpoint = `http://localhost:5000/api/${type}s/${id}`; // Correctly forms /api/pdfs/:id or /api/videos/:id
      console.log(`Calling DELETE ${endpoint}`);

      await axios.delete(endpoint); // Send DELETE request

      alert(`${type.toUpperCase()} deleted successfully.`);
      fetchMaterials(selectedBatch); // Refresh list for the current batch view
    } catch (err) {
      console.error(`Error deleting ${type} ID ${id}:`, err);
      let errorMsg = `Failed to delete ${type.toUpperCase()}.`;
      if (err.response) {
          console.error("Server Response:", err.response.data);
          errorMsg += ` Server Error: ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
          errorMsg += " No response from server.";
      }
      alert(errorMsg);
    }
  };

   const getBatchStyles = (level) => {
    switch (level.toLowerCase()) {
      case 'pro': return { border: 'border-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50', ring: 'focus:ring-indigo-500', activeRing: 'ring-indigo-500' };
      case 'classic': return { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', ring: 'focus:ring-purple-500', activeRing: 'ring-purple-500' };
      case 'basic': return { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', ring: 'focus:ring-teal-500', activeRing: 'ring-teal-500' };
      default: return { border: 'border-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', ring: 'focus:ring-gray-500', activeRing: 'ring-gray-500' };
    }
  };

  // Inside CourseDashboard component
const handleEditStart = (materialId, materialType) => {
  const materialList = materialType === 'pdf' ? pdfMaterials : videoMaterials;
  const materialToEdit = materialList.find(m => m._id === materialId);

  if (!materialToEdit) {
    console.error("Material not found for editing:", materialId);
    alert("Error: Could not find the item to edit.");
    return;
  }

  console.log("Editing Material:", materialToEdit);
  setEditingMaterial(materialToEdit); // Store the full object
  setIsEditMode(true); // Set mode to edit

  // Pre-populate formData state based on the material to edit
  setFormData({
      title: materialToEdit.title,
      category: materialToEdit.accessType, // Use 'category' for the form's select field
      batch: materialToEdit.batch || '', // Include batch if PDFs have it, default to ''
      file: null, // Cannot pre-fill file input, user must re-select if changing
      thumbnail: null // Reset thumbnail if you have that field
      // Add other fields from your formData state as needed
  });

  setIsOpen(true); // Open the modal
};

// Inside CourseDashboard component
const handleEditSubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission if it's inside a form tag

  if (!editingMaterial) {
      alert("Error: No material selected for editing.");
      return;
  }

  const { _id } = editingMaterial;
  const materialType = editingMaterial.fileUrl ? 'pdf' : 'video'; // Determine type based on field presence
  const { title, category } = formData; // Get data from the form state

  // Basic validation
  if (!title || !category) {
      alert("Please ensure Title and Category are filled.");
      return;
  }

  const endpoint = `http://localhost:5000/api/${materialType}s/${_id}`;
  console.log(`Calling PUT/PATCH ${endpoint}`);

  // **IMPORTANT**: Decide PUT vs PATCH. PATCH is better for partial updates.
  // Construct payload with ONLY updated fields.
  const updatedData = {
      title: title,
      accessType: category, // Map form 'category' back to 'accessType' for backend
      // Add batch if relevant: batch: formData.batch,
  };

  // **Handling File Replacement (Optional but common)**
  // If you want to allow replacing the file during edit:
  let dataPayload;
  let headers = { 'Content-Type': 'application/json' }; // Default for JSON data

  if (formData.file) { // Check if a NEW file was selected in the modal
      console.log("New file selected for edit, sending multipart/form-data");
      dataPayload = new FormData();
      dataPayload.append('title', updatedData.title);
      dataPayload.append('accessType', updatedData.accessType);
      // append batch if needed
      dataPayload.append('file', formData.file); // Append the new file
      headers = { 'Content-Type': 'multipart/form-data' }; // Change header for file upload
  } else {
      console.log("No new file selected, sending JSON data");
      dataPayload = updatedData; // Send only JSON data if no new file
  }


  try {
       // Use PATCH for partial updates usually, or PUT if replacing the whole resource (less common)
      await axios.patch(endpoint, dataPayload, { headers: headers });

      alert(`${materialType.toUpperCase()} updated successfully!`);
      closeModal(); // Close modal and reset state
      fetchMaterials(selectedBatch); // Refresh the list

  } catch (err) {
      console.error(`Error updating ${materialType} ID ${_id}:`, err);
      let errorMsg = `Failed to update ${materialType.toUpperCase()}.`;
      if (err.response) {
          console.error("Server Response:", err.response.data);
           errorMsg += ` Server Error: ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
          errorMsg += " No response from server.";
      }
      alert(errorMsg);
      // Keep modal open on error? Or close? User preference.
  }
};

const closeModal = () => {
  setIsOpen(false);
  setIsEditMode(false);
  setEditingMaterial(null);
  // Reset formData to default values
  setFormData({ title: '', file: null, batch: '', category: '' /*, thumbnail: null */});
};

  return (
    <div className="m-8 ms-20 bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <div className="bg-white shadow-md p-4 flex items-center justify-between w-full">
        

        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        <button
          className="px-6 py-2 bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-indigo-800 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <FaCloudUploadAlt /> Upload
        </button>
          {/* model for file upload */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b font-bold text-lg flex justify-between items-center flex-shrink-0">
              <span>
            {/* Check isEditMode state */}
            {isEditMode ? `Edit ${editingMaterial?.fileUrl ? 'PDF' : 'Video'}` : 'Upload New Material'}
          </span>
                <select name="category"
                 value={formData.category} 
                 onChange={handleInputChange}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required
                >
                  <option value="">Select Category</option>
                  <option value="pro">Pro</option>
                  <option value="classic">Classic</option>
                  <option value="basic">Basic</option>
                </select>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  <button onClick={() => setOption('pdf')}
                    className={`px-4 py-2 rounded-lg
                     ${option === 'pdf'? 'bg-indigo-700 text-white' : 'bg-gray-200'
                    } hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isEditMode}>PDF</button>
                  <button onClick={() => setOption('video')}
                    className={`px-4 py-2 rounded-lg ${
                      option === 'video'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-200'
                    } hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isEditMode}
                  >
                    Video
                  </button>
                </div>
                {option === 'pdf' ? (
                  <div className='space-y-4'>
                     {/* <label htmlFor="pdf-title" className="block mb-1 font-medium text-sm text-gray-700">Title</label> */}
                    <input
                    id="pdf-title" //
                      type="text"
                      name="title"
                      placeholder="Enter PDF Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mb-4 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required
                    />
                     <label className="block mb-2 font-medium">
                 {isEditMode ? 'Replace PDF (Optional)' : 'Upload PDF'}
              </label>
              <label className="mb-4 w-full border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100">
                {/* Display selected new file name, or existing name hint, or default text */}
                {formData.file
                  ? formData.file.name
                  : (isEditMode ? 'Select new PDF to replace' : 'Drop PDF here ')}
                <input
                  type="file"
                  name="file" // Make sure handleInputChange handles this name
                  accept=".pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter Video Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mb-4 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required
                    />

{isEditMode && editingMaterial?.thumbnailUrl && ( // Assuming you might add thumbnailUrl later
                  <p className="text-xs text-gray-600 mb-1">
                      Current thumbnail: <span className='font-medium'>{editingMaterial.thumbnailUrl.split('/').pop()}</span>
                      <br/>Selecting a new thumbnail below will replace it.
                  </p>
               )}
               <label className="block mb-2 font-medium">
                   {isEditMode ? 'Replace Thumbnail (Optional)' : 'Select Thumbnail'}
               </label>
               <label className="mb-4 w-full border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100">
                   {formData.thumbnail
                       ? formData.thumbnail.name
                       : (isEditMode ? 'Select new thumbnail to replace' : 'Drag & Drop Thumbnail or Click')}
                   <input
                       type="file"
                       name="thumbnail" // Ensure handleInputChange handles 'thumbnail'
                       accept="image/*"
                       onChange={handleInputChange}
                       className="hidden"
                    />
               </label>
                    {isEditMode && editingMaterial?.filePath && (
                <p className="text-xs text-gray-600 mb-1">
                    Current video: <span className='font-medium'>{editingMaterial.filePath.split('/').pop()}</span>
                     <br/>Selecting a new video below will replace the current one.
                </p>
              )}

              <label className="block mb-2 font-medium">
                {isEditMode ? 'Replace Video (Optional)' : 'Upload Video'}
              </label>
              <label className="mb-4 w-full border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100">
                {formData.file
                  ? formData.file.name
                  : (isEditMode ? 'Select new video to replace' : 'Drag & Drop Video here or Click to Select')}
                <input
                  type="file"
                  name="file" // Make sure handleInputChange handles this name
                  accept="video/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>

                  </>
                )}
              </div>

              {/* <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="mr-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800"
                  disabled={!formData.title || !formData.file}
                >
                  Upload
                </button>
              </div> */}
              <div className="p-4 border-t flex justify-end flex-shrink-0"> {/* Added flex-shrink-0 */}
          <button
            // Ensure this calls your function that resets state and closes modal
            onClick={closeModal}
            type="button" // Good practice for non-submit buttons
            className="mr-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            // Conditional onClick handler
            onClick={isEditMode ? handleEditSubmit : handleUpload}
            type="button" // Use type="submit" if this button is inside a <form> tag
            className="px-4 py-2 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-60"
            // Adjust disabled logic: Require title and category. In upload mode, also require file.
            disabled={!formData.title || !formData.category || (!isEditMode && !formData.file) }
          >
            {/* Conditional button text */}
            {isEditMode ? 'Save Changes' : 'Upload'}
          </button>
        </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 bg-white min-h-screen ">
    {/* H1 is removed from here */}

    <div className="flex flex-col lg:flex-row gap-6 md:gap-8"> {/* Increased gap slightly for larger screens */}

        {/* --- NEW Sticky Wrapper for the entire left column --- */}
        {/* It takes the width, sticky, top, and self-start properties */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-4 lg:self-start">

            {/* --- H1 Moved INSIDE the sticky wrapper --- */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Course Overview</h1>

            {/* --- Original Left Column Content Div --- */}
            {/* Remove width, sticky, top, self-start from here. Keep only spacing. */}
            <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-600 mb-1">Select Batch View</h2>
                {summaryData.map((summary) => {
                    const styles = getBatchStyles(summary.level);
                    const isActive = selectedBatch === summary.level.toLowerCase();
                    return (
                        <div
                            key={summary.level}
                            onClick={() => handleBatchSelect(summary.level.toLowerCase())}
                            className={`
                                bg-white rounded-lg shadow-md border-l-4 ${styles.border} p-4
                                cursor-pointer transition-all duration-300 ease-in-out
                                hover:shadow-xl hover:scale-[1.02] hover:bg-opacity-90
                                focus:outline-none focus:ring-2 ${styles.ring} focus:ring-offset-1
                                ${isActive ? `ring-2 ${styles.activeRing} ring-offset-1 scale-[1.02] shadow-lg ${styles.bg}` : 'hover:bg-gray-50'}
                             `}
                            role="button"
                            tabIndex={0} // Make it focusable
                            aria-pressed={isActive}
                        >
                            <h3 className={`text-xl font-bold mb-3 ${styles.text}`}>
                                {summary.level} Batch {isActive && <span className="text-xs font-normal ml-2">(Selected)</span>}
                            </h3>
                            <div className="space-y-1.5 text-sm text-gray-600">
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

        {/* --- Right Column (70% on large screens) --- */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
              {selectedBatch} Materials
          </h2>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center p-10 text-indigo-600">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <span className="ml-3 text-lg">Loading Materials...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {/* Content Area (Only shows if not loading and no error) */}
          {!loading && !error && (
            <div className="space-y-6">
               {/* PDF Materials Section */}
               <div>
                   <h3 className="text-lg font-semibold text-gray-600 mb-3 border-b pb-1">PDF Documents ({pdfMaterials.length})</h3>
                   {pdfMaterials.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {pdfMaterials.map((material) => (
                               <MaterialCard
                                   key={material._id}
                                   material={material}
                                   type="pdf"
                                   openMenuId={openMenuId}
                                   menuRef={menuRef}
                                   onMenuToggle={handleMenuToggle}
                                   onAction={handleAction}
                               />
                           ))}
                       </div>
                   ) : (
                       <p className="text-gray-500 italic text-sm">No PDF materials found for '{selectedBatch}'.</p>
                   )}
               </div>

               {/* Video Materials Section */}
               <div>
                   <h3 className="text-lg font-semibold text-gray-600 mb-3 border-b pb-1">Video Lessons ({videoMaterials.length})</h3>
                   {videoMaterials.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {videoMaterials.map((video) => (
                               <MaterialCard
                                   key={video._id}
                                   material={video}
                                   type="video"
                                   openMenuId={openMenuId}
                                   menuRef={menuRef}
                                   onMenuToggle={handleMenuToggle}
                                   onAction={handleAction}
                               />
                           ))}
                       </div>
                   ) : (
                       <p className="text-gray-500 italic text-sm">No video materials found for '{selectedBatch}'.</p>
                   )}
               </div>
            </div>
          )}
        </div>
      </div>

</div>

    </div>
  );
};

function MaterialCard({ material, type, openMenuId, menuRef, onMenuToggle, onAction }) {
  const isMenuOpen = openMenuId === material._id;
  const fileUrl = type === 'pdf' ? material.fileUrl : material.filePath; // Get correct URL field

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out p-4 relative group">
      <div className="flex justify-between items-start gap-2">
        {/* Material Info */}
        <div className="flex items-center gap-2 mb-1 flex-1 min-w-0">
          <FontAwesomeIcon
            icon={type === 'pdf' ? faFilePdf : faVideo}
            className={`w-5 h-5 flex-shrink-0 ${type === 'pdf' ? 'text-red-600' : 'text-blue-600'}`}
          />
          <a
              href={`http://localhost:5000${fileUrl}`} // Construct full URL
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 hover:text-indigo-700 truncate text-sm md:text-base"
              title={material.title}
          >
              {material.title}
          </a>
          <span className={`text-xs text-white px-2 py-0.5 rounded-full ml-auto capitalize flex-shrink-0
                     ${material.accessType.toLowerCase() === 'pro' ? 'bg-indigo-600' :
                     material.accessType.toLowerCase() === 'classic' ? 'bg-purple-500' :
                     material.accessType.toLowerCase() === 'basic' ? 'bg-teal-500' :
                     'bg-gray-500'}`}>{material.accessType}</span>
        </div>

        {/* Three Dot Menu Button */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => onMenuToggle(material._id)}
            data-menu-button="true" // Important for click outside logic
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
             <div
               ref={isMenuOpen ? menuRef : null} // Only attach ref if this menu is open
               className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 py-1"
               role="menu"
               aria-orientation="vertical"
             >
               <MenuItem onClick={() => onAction('Edit', type, material._id)} icon={faPencilAlt}>Edit</MenuItem>
               <MenuItem onClick={() => onAction('Change Batch', type, material._id)} icon={faExchangeAlt}>Change Batch</MenuItem>
               {/* <MenuItem onClick={() => onAction('Archive', type, material._id)} icon={faArchive}>Archive</MenuItem> */}
               <div className="border-t border-gray-100 my-1"></div>
               <MenuItem onClick={() => onAction('Delete', type, material._id)} icon={faTrash} isDestructive={true}>Delete</MenuItem>
             </div>
          )}
        </div>
      </div>
       {/* Optional: Video Preview Placeholder */}
       {type === 'video' && (
           <div className="mt-3 aspect-video bg-gray-100 rounded flex items-center justify-center">
               <FontAwesomeIcon icon={faVideo} className="text-gray-400 text-3xl" />
               {/* Consider adding a thumbnail if available: <img src={material.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover rounded" /> */}
           </div>
       )}
    </div>
  );
}

// --- Reusable Menu Item Component ---
function MenuItem({ onClick, icon, children, isDestructive = false }) {
  const textColor = isDestructive ? 'text-red-600 hover:text-red-800' : 'text-gray-700 hover:text-indigo-800';
  const bgColor = isDestructive ? 'hover:bg-red-100' : 'hover:bg-indigo-100';

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
