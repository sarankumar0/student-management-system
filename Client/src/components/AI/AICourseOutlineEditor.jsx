// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faSave, 
//   faSpinner, 
//   faFileAlt, 
//   faVideo, 
//   faPlus, 
//   faTrashAlt,
//   faArrowUp,
//   faArrowDown,
//   faExclamationTriangle,
//   faLightbulb
// } from '@fortawesome/free-solid-svg-icons';

// function CourseOutlineEditor({ outlineData, onSave, isSaving = false, currentThumbnailFile, onThumbnailChange, isEditing }) {
//     const [editableOutline, setEditableOutline] = useState(null);
//     const [validationError, setValidationError] = useState(null);
//     const [fileName, setFileName] = useState('');
//     // Add state for expanded modules if you want that feature
//     const [expandedModules, setExpandedModules] = useState({});
//     const [currentThumbnailFile, setCurrentThumbnailFile] = useState(null);
// const [editableOutline, setEditableOutline] = useState(initialData || { /* thumbnailFile: null, thumbnailUrl: 'some/path.jpg' or null */ });
// const fileInputRef = useRef(null); // Add a ref for the file input

// const handleThumbFileChange = (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     setCurrentThumbnailFile(file);
//     // If you're directly updating a FormData object, do it here:
//     setFormDataInstance(prev => {
//       const newFormData = new FormData();
//       // Append other fields...
//       newFormData.append('thumbnailFile', file);
//       return newFormData;
//     });
//   }
// };

// const handleRemoveThumbnail = () => {
//   setCurrentThumbnailFile(null);
//   if (fileInputRef.current) {
//     fileInputRef.current.value = ""; // Reset the file input
//   }
//   // If you want to signal to backend to remove existing thumbnail:
//   setEditableOutline(prev => ({ ...prev, thumbnailUrl: null, removeExistingThumbnail: true }));
//   //Or update FormData:
//   setFormDataInstance(prev => {
//     const newFormData = new FormData();
//     // Append other fields...
//     newFormData.append('removeExistingThumbnail', 'true'); // Or however your backend expects it
//     return newFormData;
//   });
// };

// const triggerFileInput = () => {
//   if (fileInputRef.current) {
//     fileInputRef.current.click();
//   }
// };


// // Let's generate a preview URL for the locally selected file or use the existing one
// const [thumbnailPreview, setThumbnailPreview] = useState(null);

// useEffect(() => {
//     if (currentThumbnailFile) {
//         const objectUrl = URL.createObjectURL(currentThumbnailFile);
//         setThumbnailPreview(objectUrl);
//         // Cleanup function to revoke the object URL
//         return () => URL.revokeObjectURL(objectUrl);
//     } else if (editableOutline?.thumbnailUrl) {
//         // Construct full URL if thumbnailUrl is a relative path
//         const fullExistingUrl = editableOutline.thumbnailUrl.startsWith('http')
//             ? editableOutline.thumbnailUrl
//             : `http://localhost:5000${editableOutline.thumbnailUrl}`;
//         setThumbnailPreview(fullExistingUrl);
//     } else {
//         setThumbnailPreview(null); // No new file and no existing thumbnail
//     }
// }, [currentThumbnailFile, editableOutline?.thumbnailUrl]);

//     // Effect to initialize/update local state when outlineData prop changes OR isEditing changes
//     useEffect(() => {
//         console.log("[Editor useEffect] Running. isEditing:", isEditing, "Has outlineData:", !!outlineData);

//         if (outlineData) {
//             // Process the incoming outlineData first
//             const outlineWithOrder = {
//                 // Start with a copy of the received outline
//                 ...outlineData,
//                 // Ensure top-level fields expected by the form exist
//                 courseTitle: outlineData.title || outlineData.courseTitle || '', // Handle both possible input names
//                 courseDescription: outlineData.description || outlineData.courseDescription || '',
//                 accessType: outlineData.accessType || 'basic',
//                 thumbnailUrl: outlineData.thumbnailUrl, // Keep existing URL if present
//                 // Process modules and lessons to ensure order and temp IDs (for keys)
//                 modules: (outlineData.modules || []).map((mod, modIndex) => ({
//                     ...mod,
//                     _id: mod._id || `temp_mod_${Date.now()}_${modIndex}`, // Ensure temp ID
//                     moduleTitle: mod.title || mod.moduleTitle || '',
//                     order: mod.order ?? modIndex,       // Assign order if missing
//                     lessons: (mod.lessons || []).map((lesson, lessonIndex) => ({
//                         ...lesson,
//                         _id: lesson._id || `temp_lesson_${Date.now()}_${lessonIndex}`, // Ensure temp ID
//                         lessonTitle: lesson.title || lesson.lessonTitle || '',
//                         order: lesson.order ?? lessonIndex,      // Assign order if missing
//                         contentType: lesson.contentType || 'text', // Default type
//                         textContent: lesson.textContent || '',
//                         videoUrl: lesson.videoUrl || null,
//                         videoDescription: lesson.videoDescription || ''
//                     }))
//                 }))
//             };

//             // --- Set the main editable state ---
//             // Use deep copy just to be safe from unexpected mutations
//             const deepCopy = JSON.parse(JSON.stringify(outlineWithOrder));
//             setEditableOutline(deepCopy);
//             console.log("[Editor useEffect] setEditableOutline was called with processed data:", deepCopy);

//             // Set initial file name display if editing
//             setFileName(isEditing && outlineWithOrder.thumbnailUrl ? outlineWithOrder.thumbnailUrl.split('/').pop() : '');

//             // Reset the separate thumbnail file state in the parent when data reloads
//             // This prevents accidentally saving an old file selection with new/edited data
//             if (onThumbnailChange) { // Check if handler exists
//                  onThumbnailChange(null);
//              }


//             // Optional: Expand modules logic (if state exists)
         
//             const expanded = {};
//             outlineWithOrder.modules?.forEach((_, index) => {
//                 expanded[index] = true; // Expand all initially
//             });
//             setExpandedModules(expanded);
            

//         } else {
//             // Reset state if outlineData becomes null (e.g., after saving)
//              console.log("[Editor useEffect] Resetting state because outlineData is null.");
//             setEditableOutline(null);
//             setFileName('');
//             // setExpandedModules({}); // Reset expanded state too
//              if (onThumbnailChange) {
//                  onThumbnailChange(null);
//              }
//         }
//         // Dependencies: run when the incoming outline changes or edit mode changes
//         // Also include onThumbnailChange if it's stable (defined via useCallback in parent)
//     }, [outlineData, isEditing, onThumbnailChange]);


//     // --- Rest of the component ---
//     // ... handlers (handleInputChange, handleModuleChange, etc.) ...
//     // ... triggerSave ...

//     // --- Render Logic ---
//     console.log("[Editor Render] State before render:", editableOutline); // Log state before render

//     if (!editableOutline) {
//         console.log("[Editor Render] editableOutline is null, rendering null.");
//         // If parent loadingInitialData is true, parent shows spinner.
//         // If parent loadingInitialData is false AND editableOutline is still null, maybe show message?
//         // return <div>Loading editor data or no outline generated...</div>;
//          return null; // Render nothing until data is processed
//     }

//     // --- Input Handlers ---
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setEditableOutline(prev => ({ ...prev, [name]: value }));
//     };

//     const handleAccessTypeChange = (e) => {
//         setEditableOutline(prev => ({ ...prev, accessType: e.target.value }));
//     };

//     // --- Module/Lesson CRUD Operations ---
//     const handleModuleChange = (moduleIndex, field, value) => {
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             newModules[moduleIndex] = { ...newModules[moduleIndex], [field]: value };
//             return { ...prev, modules: newModules };
//         });
//     };

//     const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             const newLessons = [...newModules[moduleIndex].lessons];
//             newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
//             newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: newLessons };
//             return { ...prev, modules: newModules };
//         });
//     };

//     const handleAddModule = () => {
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newOrder = prev.modules.length;
//             const newModule = {
//                 _id: `temp_mod_${Date.now()}_${newOrder}`,
//                 moduleTitle: `New Module ${newOrder + 1}`,
//                 order: newOrder,
//                 lessons: []
//             };
//             return { ...prev, modules: [...prev.modules, newModule] };
//         });
//         // Expand the new module
//         setExpandedModules(prev => ({ ...prev, [editableOutline?.modules?.length || 0]: true }));
//     };

//     const handleRemoveModule = (moduleIndex) => {
//         if (!window.confirm("Remove this module and all its lessons?")) return;
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             return {
//                 ...prev,
//                 modules: prev.modules.filter((_, i) => i !== moduleIndex)
//                     .map((mod, i) => ({ ...mod, order: i }))
//             };
//         });
//     };

//     const handleAddLesson = (moduleIndex) => {
//         setEditableOutline(prev => {
//             if (!prev || !prev.modules[moduleIndex]) return null;
//             const newModules = [...prev.modules];
//             const currentLessons = newModules[moduleIndex].lessons || [];
//             const newOrder = currentLessons.length;
//             const newLesson = {
//                 _id: `temp_lesson_${Date.now()}_${newOrder}`,
//                 lessonTitle: `New Lesson ${newOrder + 1}`,
//                 order: newOrder,
//                 contentType: 'text',
//                 textContent: '',
//                 videoUrl: '',
//                 videoDescription: ''
//             };
//             newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: [...currentLessons, newLesson] };
//             return { ...prev, modules: newModules };
//         });
//     };

//     const handleRemoveLesson = (moduleIndex, lessonIndex) => {
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             newModules[moduleIndex] = {
//                 ...newModules[moduleIndex],
//                 lessons: newModules[moduleIndex].lessons
//                     .filter((_, i) => i !== lessonIndex)
//                     .map((lesson, i) => ({ ...lesson, order: i }))
//             };
//             return { ...prev, modules: newModules };
//         });
//     };

//     // --- Reordering Functions ---
//     const moveModuleUp = (moduleIndex) => {
//         if (moduleIndex <= 0) return;
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             [newModules[moduleIndex], newModules[moduleIndex - 1]] = 
//             [newModules[moduleIndex - 1], newModules[moduleIndex]];
//             return { ...prev, modules: newModules };
//         });
//     };

//     const moveModuleDown = (moduleIndex) => {
//         if (!editableOutline || moduleIndex >= editableOutline.modules.length - 1) return;
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             [newModules[moduleIndex], newModules[moduleIndex + 1]] = 
//             [newModules[moduleIndex + 1], newModules[moduleIndex]];
//             return { ...prev, modules: newModules };
//         });
//     };

//     const moveLessonUp = (moduleIndex, lessonIndex) => {
//         if (lessonIndex <= 0) return;
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             const lessons = [...newModules[moduleIndex].lessons];
//             [lessons[lessonIndex], lessons[lessonIndex - 1]] = 
//             [lessons[lessonIndex - 1], lessons[lessonIndex]];
//             newModules[moduleIndex] = { ...newModules[moduleIndex], lessons };
//             return { ...prev, modules: newModules };
//         });
//     };

//     const moveLessonDown = (moduleIndex, lessonIndex) => {
//         if (!editableOutline || lessonIndex >= editableOutline.modules[moduleIndex].lessons.length - 1) return;
//         setEditableOutline(prev => {
//             if (!prev) return null;
//             const newModules = [...prev.modules];
//             const lessons = [...newModules[moduleIndex].lessons];
//             [lessons[lessonIndex], lessons[lessonIndex + 1]] = 
//             [lessons[lessonIndex + 1], lessons[lessonIndex]];
//             newModules[moduleIndex] = { ...newModules[moduleIndex], lessons };
//             return { ...prev, modules: newModules };
//         });
//     };

//     // --- Toggle Module Expansion ---
//     const toggleModuleExpansion = (moduleIndex) => {
//         setExpandedModules(prev => ({
//             ...prev,
//             [moduleIndex]: !prev[moduleIndex]
//         }));
//     };
//     const handleThumbFileChange = (e) => {
//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];
//             if (file.type.startsWith('image/')) {
//                 onThumbnailChange(file); // Call parent's state setter
//             } else {
//                 alert("Please select a valid image file for the thumbnail.");
//                 e.target.value = null; // Clear input
//                 onThumbnailChange(null); // Reset parent state
//             }
//         } else {
//             onThumbnailChange(null); // Reset parent state if selection cancelled
//         }
//     };

//     // --- Save Validation ---
//     const triggerSave = () => {
//         if (!editableOutline) return;
        
//         // Basic validation
//         if (!editableOutline.courseTitle) {
//             setValidationError("Course title is required");
//             return;
//         }
        
//         if (!editableOutline.modules || editableOutline.modules.length === 0) {
//             setValidationError("Please add at least one module");
//             return;
//         }
        
//         for (const module of editableOutline.modules) {
//             if (!module.moduleTitle) {
//                 setValidationError(`Module ${editableOutline.modules.indexOf(module) + 1} needs a title`);
//                 return;
//             }
//             if (!module.lessons || module.lessons.length === 0) {
//                 setValidationError(`Module "${module.moduleTitle}" needs at least one lesson`);
//                 return;
//             }
//             for (const lesson of module.lessons) {
//                 if (!lesson.lessonTitle) {
//                     setValidationError(`Lesson ${module.lessons.indexOf(lesson) + 1} in Module "${module.moduleTitle}" needs a title`);
//                     return;
//                 }
//                 if (lesson.contentType === 'video' && !lesson.videoUrl) {
//                     setValidationError(`Video lesson "${lesson.lessonTitle}" needs a YouTube URL`);
//                     return;
//                 }
//             }
//         }
        
//         setValidationError(null);
//         onSave(editableOutline);
//     };

//     if (!editableOutline) return null;

//     return (
//         <div className="mt-6 p-4 md:p-6 border border-indigo-200 rounded-lg bg-white shadow-inner space-y-6">
//             <h3 className="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4 flex items-center gap-2">
//                 <FontAwesomeIcon icon={faFileAlt} className="text-indigo-500" />
//                 Edit Course Outline
//             </h3>

//             {/* Validation Error */}
//             {validationError && (
//                 <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded flex items-center">
//                     <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 flex-shrink-0" />
//                     <span className='flex-1'>{validationError}</span>
//                 </div>
//             )}

//             {/* Course Metadata */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Course Title */}
//                 <div>
//                     <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
//                         Course Title <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         name="courseTitle"
//                         id="courseTitle"
//                         value={editableOutline.courseTitle || ''}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                 </div>
//                  {/* ---Thumbnail Input --- */}

//                 <div>
//                  <label htmlFor="thumbnailFile" className="block text-sm font-medium text-gray-700 mb-1">
//                      Course Thumbnail (Optional)
//                  </label>
//                  {/* Display existing thumbnail maybe? Requires thumbnailUrl in editableOutline state */}
//                  {/* {editableOutline.thumbnailUrl && !currentThumbnailFile && <img src={`http://localhost:5000${editableOutline.thumbnailUrl}`} alt="Current thumbnail" className="h-20 mb-2 rounded"/>} */}
//                  <input
//                      type="file"
//                      name="thumbnailFile"
//                      id="thumbnailFile"
//                      accept="image/*" // Accept images
//                      onChange={handleThumbFileChange} // Use specific handler
//                      className="block w-full text-sm ..."
//                  />
//                   {currentThumbnailFile && <p className="mt-1 text-xs text-gray-600">Selected: {currentThumbnailFile.name}</p>}
//              </div>
//             {/* --- End Thumbnail Input --- */}


//              {/* ... Access Type Select ... */}
//              <hr className="my-4"/>
//              {/* ... Module/Lesson Editing Area ... */}
//              <hr className="my-4"/>
//              {/* ... Save Button ... */}
//         </div>

//                 {/* Access Type */}
//                 <div>
//                     <label htmlFor="finalAccessType" className="block text-sm font-medium text-gray-700 mb-1">
//                         Access Type <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                         name="accessType"
//                         id="finalAccessType"
//                         value={editableOutline.accessType || 'basic'}
//                         onChange={handleAccessTypeChange}
//                         required
//                         className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
//                     >
//                         <option value="basic">Basic</option>
//                         <option value="classic">Classic</option>
//                         <option value="pro">Pro</option>
//                     </select>
//                 </div>
           

//             {/* Course Description */}
//             <div>
//                 <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
//                     Course Description
//                 </label>
//                 <textarea
//                     name="courseDescription"
//                     id="courseDescription"
//                     rows="3"
//                     value={editableOutline.courseDescription || ''}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                     placeholder="Describe what students will learn in this course..."
//                 />
//             </div>

//             <hr className="my-4 border-gray-200" />

//             {/* Modules Section */}
//             <div>
//                 <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
//                     <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
//                     Course Modules
//                 </h4>

//                 {editableOutline.modules?.length === 0 ? (
//                     <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
//                         <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-2xl mb-2" />
//                         <p className="text-gray-500">No modules yet. Add your first module to get started!</p>
//                         <button
//                             onClick={handleAddModule}
//                             className="mt-3 flex items-center justify-center gap-2 px-4 py-2 mx-auto border border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
//                         >
//                             <FontAwesomeIcon icon={faPlus} />
//                             Add First Module
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                         {editableOutline.modules.map((module, moduleIndex) => (
//                             <div key={module._id} className="border border-gray-200 rounded-lg overflow-hidden">
//                                 {/* Module Header */}
//                                 <div 
//                                     className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
//                                     onClick={() => toggleModuleExpansion(moduleIndex)}
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
//                                             {moduleIndex + 1}
//                                         </span>
//                                         <h5 className="font-medium text-gray-800">
//                                             {module.moduleTitle || `Module ${moduleIndex + 1}`}
//                                         </h5>
//                                     </div>
//                                     <div className="flex items-center gap-1">
//                                         <button
//                                             type="button"
//                                             onClick={(e) => { e.stopPropagation(); moveModuleUp(moduleIndex); }}
//                                             disabled={moduleIndex === 0}
//                                             className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1"
//                                             title="Move up"
//                                         >
//                                             <FontAwesomeIcon icon={faArrowUp} size="xs" />
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={(e) => { e.stopPropagation(); moveModuleDown(moduleIndex); }}
//                                             disabled={moduleIndex === editableOutline.modules.length - 1}
//                                             className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1"
//                                             title="Move down"
//                                         >
//                                             <FontAwesomeIcon icon={faArrowDown} size="xs" />
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={(e) => { e.stopPropagation(); handleRemoveModule(moduleIndex); }}
//                                             className="text-gray-400 hover:text-red-600 p-1"
//                                             title="Remove module"
//                                         >
//                                             <FontAwesomeIcon icon={faTrashAlt} size="xs" />
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Module Content (Collapsible) */}
//                                 {expandedModules[moduleIndex] && (
//                                     <div className="p-4 bg-white">
//                                         {/* Module Title Input */}
//                                         <div className="mb-4">
//                                             <label htmlFor={`moduleTitle-${moduleIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
//                                                 Module Title
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id={`moduleTitle-${moduleIndex}`}
//                                                 value={module.moduleTitle || ''}
//                                                 onChange={(e) => handleModuleChange(moduleIndex, 'moduleTitle', e.target.value)}
//                                                 required
//                                                 className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                             />
//                                         </div>

//                                         {/* Lessons Section */}
//                                         <div className="border-t pt-4">
//                                             <h6 className="text-sm font-semibold text-gray-700 mb-3">
//                                                 Lessons ({module.lessons?.length || 0})
//                                             </h6>

//                                             {module.lessons?.length === 0 ? (
//                                                 <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
//                                                     <p className="text-gray-500 text-sm">No lessons yet.</p>
//                                                     <button
//                                                         onClick={() => handleAddLesson(moduleIndex)}
//                                                         className="mt-2 flex items-center justify-center gap-1 px-3 py-1 mx-auto border border-dashed border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm"
//                                                     >
//                                                         <FontAwesomeIcon icon={faPlus} size="xs" />
//                                                         Add First Lesson
//                                                     </button>
//                                                 </div>
//                                             ) : (
//                                                 <div className="space-y-3">
//                                                     {module.lessons.map((lesson, lessonIndex) => (
//                                                         <div key={lesson._id} className="border border-gray-200 rounded-md p-3">
//                                                             {/* Lesson Header */}
//                                                             <div className="flex justify-between items-start mb-2">
//                                                                 <div className="flex-grow">
//                                                                     <label htmlFor={`lessonTitle-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
//                                                                         Lesson {lessonIndex + 1} Title
//                                                                     </label>
//                                                                     <div className="flex items-center gap-2">
//                                                                         <input
//                                                                             type="text"
//                                                                             id={`lessonTitle-${moduleIndex}-${lessonIndex}`}
//                                                                             value={lesson.lessonTitle || ''}
//                                                                             onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'lessonTitle', e.target.value)}
//                                                                             required
//                                                                             className="flex-grow border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                                                         />
//                                                                         <div className="flex items-center gap-1">
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={() => moveLessonUp(moduleIndex, lessonIndex)}
//                                                                                 disabled={lessonIndex === 0}
//                                                                                 className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1"
//                                                                                 title="Move up"
//                                                                             >
//                                                                                 <FontAwesomeIcon icon={faArrowUp} size="xs" />
//                                                                             </button>
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={() => moveLessonDown(moduleIndex, lessonIndex)}
//                                                                                 disabled={lessonIndex === module.lessons.length - 1}
//                                                                                 className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1"
//                                                                                 title="Move down"
//                                                                             >
//                                                                                 <FontAwesomeIcon icon={faArrowDown} size="xs" />
//                                                                             </button>
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={() => handleRemoveLesson(moduleIndex, lessonIndex)}
//                                                                                 className="text-gray-400 hover:text-red-600 p-1"
//                                                                                 title="Remove lesson"
//                                                                             >
//                                                                                 <FontAwesomeIcon icon={faTrashAlt} size="xs" />
//                                                                             </button>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>

//                                                             {/* Lesson Content */}
//                                                             <div className="mt-3 space-y-3">
//                                                                 {/* Content Type Selector */}
//                                                                 <div>
//                                                                     <label htmlFor={`contentType-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
//                                                                         Content Type
//                                                                     </label>
//                                                                     <select
//                                                                         id={`contentType-${moduleIndex}-${lessonIndex}`}
//                                                                         value={lesson.contentType || 'text'}
//                                                                         onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'contentType', e.target.value)}
//                                                                         className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                                                     >
//                                                                         <option value="text">Text Content</option>
//                                                                         <option value="video">Video Lesson</option>
//                                                                     </select>
//                                                                 </div>

//                                                                 {/* Text Content */}
//                                                                 {lesson.contentType === 'text' && (
//                                                                     <div>
//                                                                         <label htmlFor={`textContent-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
//                                                                             Lesson Content
//                                                                         </label>
//                                                                         <textarea
//                                                                             id={`textContent-${moduleIndex}-${lessonIndex}`}
//                                                                             rows="4"
//                                                                             value={lesson.textContent || ''}
//                                                                             onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'textContent', e.target.value)}
//                                                                             className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                                                         />
//                                                                     </div>
//                                                                 )}

//                                                                 {/* Video Content */}
//                                                                 {lesson.contentType === 'video' && (
//                                                                     <div className="space-y-3">
//                                                                         <div>
//                                                                             <label htmlFor={`videoUrl-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
//                                                                                 YouTube Video URL
//                                                                             </label>
//                                                                             <input
//                                                                                 type="url"
//                                                                                 id={`videoUrl-${moduleIndex}-${lessonIndex}`}
//                                                                                 value={lesson.videoUrl || ''}
//                                                                                 onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'videoUrl', e.target.value)}
//                                                                                 placeholder="https://www.youtube.com/watch?v=..."
//                                                                                 className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                                                             />
//                                                                         </div>
//                                                                         <div>
//                                                                             <label htmlFor={`videoDescription-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
//                                                                                 Video Description
//                                                                             </label>
//                                                                             <textarea
//                                                                                 id={`videoDescription-${moduleIndex}-${lessonIndex}`}
//                                                                                 rows="2"
//                                                                                 value={lesson.videoDescription || ''}
//                                                                                 onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'videoDescription', e.target.value)}
//                                                                                 className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                                                             />
//                                                                         </div>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     ))}

//                                                     {/* Add Lesson button at bottom of lessons list */}
//                                                     <div className="mt-2">
//                                                         <button
//                                                             onClick={() => handleAddLesson(moduleIndex)}
//                                                             className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-dashed border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm"
//                                                         >
//                                                             <FontAwesomeIcon icon={faPlus} size="xs" />
//                                                             Add Another Lesson
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ))}

//                         {/* Add Module button at bottom of modules list */}
//                         <div className="mt-4">
//                             <button
//                                 onClick={handleAddModule}
//                                 className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
//                             >
//                                 <FontAwesomeIcon icon={faPlus} />
//                                 Add Another Module
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <hr className="my-4 border-gray-200" />

//             {/* Save Button */}
//             <div className="flex justify-end">
//                 <button
//                     type="button"
//                     onClick={triggerSave}
//                     disabled={isSaving}
//                     className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
//                 >
//                     {isSaving ? (
//                         <>
//                             <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
//                             Saving...
//                         </>
//                     ) : (
//                         <>
//                             <FontAwesomeIcon icon={faSave} className="mr-2" />
//                             Save Course
//                         </>
//                     )}
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default CourseOutlineEditor;

import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faSpinner,
    faFileAlt,
    // faVideo, // Not used directly here but might be in a lesson type icon
    faPlus,
    faTrashAlt,
    faArrowUp,
    faArrowDown,
    faExclamationTriangle,
    faLightbulb,
    faImage, // For thumbnail placeholder
    faTimesCircle // For remove button
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify'; // For potential warnings

// Renamed prop for clarity
function CourseOutlineEditor({
    outlineData, // Initial data for the course
    onSave,      // Function to call when saving
    isSaving = false, // Prop to indicate if parent is currently saving
    currentThumbnailFile, // The File object for the new thumbnail (managed by parent)
    onThumbnailChange,    // Function to update currentThumbnailFile in parent
    isEditing           // Boolean to indicate if editing an existing course
}) {
    const [editableOutline, setEditableOutline] = useState(null);
    const [validationError, setValidationError] = useState(null);
    // const [fileName, setFileName] = useState(''); // Not strictly needed with the new preview
    const [expandedModules, setExpandedModules] = useState({});
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Effect to initialize/update local state when outlineData prop changes OR isEditing changes
    useEffect(() => {
        // console.log("[Editor useEffect] Running. isEditing:", isEditing, "Has outlineData:", !!outlineData);

        if (outlineData) {
            const outlineWithOrder = {
                ...outlineData,
                courseTitle: outlineData.title || outlineData.courseTitle || '',
                courseDescription: outlineData.description || outlineData.courseDescription || '',
                accessType: outlineData.accessType || 'basic',
                thumbnailUrl: outlineData.thumbnailUrl, // Keep existing URL if present
                removeExistingThumbnail: false, // Initialize flag for backend
                modules: (outlineData.modules || []).map((mod, modIndex) => ({
                    ...mod,
                    _id: mod._id || `temp_mod_${Date.now()}_${modIndex}`,
                    moduleTitle: mod.title || mod.moduleTitle || '',
                    order: mod.order ?? modIndex,
                    lessons: (mod.lessons || []).map((lesson, lessonIndex) => ({
                        ...lesson,
                        _id: lesson._id || `temp_lesson_${Date.now()}_${lessonIndex}`,
                        lessonTitle: lesson.title || lesson.lessonTitle || '',
                        order: lesson.order ?? lessonIndex,
                        contentType: lesson.contentType || 'text',
                        textContent: lesson.textContent || '',
                        videoUrl: lesson.videoUrl || '', // Ensure empty string not null for inputs
                        videoDescription: lesson.videoDescription || ''
                    }))
                }))
            };

            const deepCopy = JSON.parse(JSON.stringify(outlineWithOrder));
            setEditableOutline(deepCopy);
            // console.log("[Editor useEffect] setEditableOutline with processed data:", deepCopy);

            // Resetting thumbnail file in parent ensures no stale file is kept if data reloads
            if (onThumbnailChange) {
                onThumbnailChange(null); // Clear any previously selected file from parent
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear file input field as well
            }

            const expanded = {};
            outlineWithOrder.modules?.forEach((_, index) => {
                expanded[index] = true; // Expand all initially
            });
            setExpandedModules(expanded);

        } else {
            // console.log("[Editor useEffect] Resetting state because outlineData is null.");
            setEditableOutline(null);
            // setFileName(''); // Not needed
            setExpandedModules({});
            if (onThumbnailChange) {
                onThumbnailChange(null);
            }
        }
    }, [outlineData, isEditing, onThumbnailChange]); // onThumbnailChange is crucial here

    // Effect to manage thumbnail preview
    useEffect(() => {
        if (currentThumbnailFile) { // Prioritize newly selected file
            const objectUrl = URL.createObjectURL(currentThumbnailFile);
            setThumbnailPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); // Cleanup
        } else if (editableOutline?.thumbnailUrl) { // Fallback to existing thumbnail URL
            // Ensure full URL if it's a relative path from backend
            const fullExistingUrl = editableOutline.thumbnailUrl.startsWith('http')
                ? editableOutline.thumbnailUrl
                : `http://localhost:5000${editableOutline.thumbnailUrl}`; // Adjust base URL if needed
            setThumbnailPreview(fullExistingUrl);
        } else {
            setThumbnailPreview(null); // No new file and no existing thumbnail
        }
    }, [currentThumbnailFile, editableOutline?.thumbnailUrl]);


    // --- Thumbnail Handlers ---
    const handleThumbFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.warn("Please select a valid image file (PNG, JPG, GIF, WEBP).");
                if (fileInputRef.current) fileInputRef.current.value = ""; // Clear invalid selection
                onThumbnailChange(null); // Reset parent state
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.warn("Image size should be less than 2MB.");
                if (fileInputRef.current) fileInputRef.current.value = ""; // Clear invalid selection
                onThumbnailChange(null); // Reset parent state
                return;
            }
            onThumbnailChange(file); // Update parent state with the valid file
            // Clear the removeExistingThumbnail flag if a new file is selected
            setEditableOutline(prev => ({ ...prev, removeExistingThumbnail: false }));
        }
    };

    const handleRemoveThumbnail = () => {
        onThumbnailChange(null); // Clear file in parent
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset the file input
        }
        // If there was an existing thumbnail, mark it for removal on the backend
        // Also clear the local thumbnailUrl from editableOutline so preview updates
        setEditableOutline(prev => ({
            ...prev,
            thumbnailUrl: null, // This will clear the preview if no new file is selected
            removeExistingThumbnail: !!prev?.thumbnailUrl // Set true only if there was an existing URL
        }));
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // --- Input Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableOutline(prev => ({ ...prev, [name]: value }));
    };

    const handleAccessTypeChange = (e) => {
        setEditableOutline(prev => ({ ...prev, accessType: e.target.value }));
    };

    // --- Module/Lesson CRUD Operations (Keep as is from your original working code) ---
    const handleModuleChange = (moduleIndex, field, value) => {
        setEditableOutline(prev => {
            if (!prev) return null;
            const newModules = [...prev.modules];
            newModules[moduleIndex] = { ...newModules[moduleIndex], [field]: value };
            return { ...prev, modules: newModules };
        });
    };

    const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
        setEditableOutline(prev => {
            if (!prev) return null;
            const newModules = [...prev.modules];
            const newLessons = [...newModules[moduleIndex].lessons];
            newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
            newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: newLessons };
            return { ...prev, modules: newModules };
        });
    };

    const handleAddModule = () => {
        setEditableOutline(prev => {
            if (!prev) return null;
            const newOrder = prev.modules.length;
            const newModule = {
                _id: `temp_mod_${Date.now()}_${newOrder}`,
                moduleTitle: `New Module ${newOrder + 1}`,
                order: newOrder,
                lessons: []
            };
            // Expand the new module immediately
            setExpandedModules(exp => ({ ...exp, [newOrder]: true }));
            return { ...prev, modules: [...prev.modules, newModule] };
        });
    };

    const handleRemoveModule = (moduleIndex) => {
        if (!window.confirm("Remove this module and all its lessons? This cannot be undone.")) return;
        setEditableOutline(prev => {
            if (!prev) return null;
            const updatedModules = prev.modules.filter((_, i) => i !== moduleIndex)
                .map((mod, i) => ({ ...mod, order: i })); // Re-order
            // Adjust expanded state if necessary
            const newExpanded = { ...expandedModules };
            delete newExpanded[moduleIndex]; // Remove the deleted module
            // Shift keys for subsequent modules if you want them to maintain their expanded state
            // This part can get complex if you need to maintain expansion perfectly after deletion.
            // For simplicity, you might just close all or let user re-open.
            // Or, rebuild 'newExpanded' based on 'updatedModules' indices.
            return { ...prev, modules: updatedModules };
        });
    };

    const handleAddLesson = (moduleIndex) => {
        setEditableOutline(prev => {
            if (!prev || !prev.modules[moduleIndex]) return null;
            const newModules = [...prev.modules];
            const currentLessons = newModules[moduleIndex].lessons || [];
            const newOrder = currentLessons.length;
            const newLesson = {
                _id: `temp_lesson_${Date.now()}_${newOrder}`,
                lessonTitle: `New Lesson ${newOrder + 1}`,
                order: newOrder,
                contentType: 'text',
                textContent: '',
                videoUrl: '',
                videoDescription: ''
            };
            newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: [...currentLessons, newLesson] };
            return { ...prev, modules: newModules };
        });
    };

    const handleRemoveLesson = (moduleIndex, lessonIndex) => {
        setEditableOutline(prev => {
            if (!prev) return null;
            const newModules = [...prev.modules];
            newModules[moduleIndex] = {
                ...newModules[moduleIndex],
                lessons: newModules[moduleIndex].lessons
                    .filter((_, i) => i !== lessonIndex)
                    .map((lesson, i) => ({ ...lesson, order: i })) // Re-order
            };
            return { ...prev, modules: newModules };
        });
    };

    // --- Reordering Functions (Keep as is) ---
    // const moveModuleUp = (moduleIndex) => { /* ... */ };
    // const moveModuleDown = (moduleIndex) => { /* ... */ };
    // const moveLessonUp = (moduleIndex, lessonIndex) => { /* ... */ };
    // const moveLessonDown = (moduleIndex, lessonIndex) => { /* ... */ };
    // (Copy these from your original code, they seem fine)
    //     const reorder = (list, startIndex, endIndex) => {
    //     const result = Array.from(list);
    //     const [removed] = result.splice(startIndex, 1);
    //     result.splice(endIndex, 0, removed);
    //     return result.map((item, index) => ({ ...item, order: index }));
    // };

     // --- Reordering Functions ---
    const moveItem = (list, setListFunction, index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= list.length) return list; // Boundary check

        const reorderedList = [...list];
        const itemToMove = reorderedList[index];
        reorderedList[index] = reorderedList[newIndex];
        reorderedList[newIndex] = itemToMove;

        // Update order property after swapping
        return reorderedList.map((item, idx) => ({ ...item, order: idx }));
    };


    const moveModuleUp = (moduleIndex) => {
        if (moduleIndex <= 0) return;
        setEditableOutline(prev => {
            if (!prev) return null;
            const reorderedModules = moveItem(prev.modules, null, moduleIndex, -1);
            return { ...prev, modules: reorderedModules };
        });
    };

    const moveModuleDown = (moduleIndex) => {
        if (!editableOutline || moduleIndex >= editableOutline.modules.length - 1) return;
        setEditableOutline(prev => {
            if (!prev) return null;
            const reorderedModules = moveItem(prev.modules, null, moduleIndex, 1);
            return { ...prev, modules: reorderedModules };
        });
    };

    const moveLessonUp = (moduleIndex, lessonIndex) => {
        if (lessonIndex <= 0) return;
        setEditableOutline(prev => {
            if (!prev) return null;
            const newModules = [...prev.modules];
            const reorderedLessons = moveItem(newModules[moduleIndex].lessons, null, lessonIndex, -1);
            newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: reorderedLessons };
            return { ...prev, modules: newModules };
        });
    };

    const moveLessonDown = (moduleIndex, lessonIndex) => {
        if (!editableOutline || lessonIndex >= editableOutline.modules[moduleIndex].lessons.length - 1) return;
        setEditableOutline(prev => {
            if (!prev) return null;
            const newModules = [...prev.modules];
            const reorderedLessons = moveItem(newModules[moduleIndex].lessons, null, lessonIndex, 1);
            newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: reorderedLessons };
            return { ...prev, modules: newModules };
        });
    };


    // --- Toggle Module Expansion ---
    const toggleModuleExpansion = (moduleIndex) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleIndex]: !prev[moduleIndex]
        }));
    };

    // --- Save Validation ---
    const triggerSave = () => {
        if (!editableOutline) return;
        let errorMsg = null;

        if (!editableOutline.courseTitle?.trim()) errorMsg = "Course title is required.";
        else if (!editableOutline.modules || editableOutline.modules.length === 0) errorMsg = "Please add at least one module.";
        else {
            for (let i = 0; i < editableOutline.modules.length; i++) {
                const module = editableOutline.modules[i];
                if (!module.moduleTitle?.trim()) { errorMsg = `Module ${i + 1} needs a title.`; break; }
                if (!module.lessons || module.lessons.length === 0) { errorMsg = `Module "${module.moduleTitle}" needs at least one lesson.`; break; }
                for (let j = 0; j < module.lessons.length; j++) {
                    const lesson = module.lessons[j];
                    if (!lesson.lessonTitle?.trim()) { errorMsg = `Lesson ${j + 1} in Module "${module.moduleTitle}" needs a title.`; break; }
                    if (lesson.contentType === 'video' && !lesson.videoUrl?.trim()) { errorMsg = `Video lesson "${lesson.lessonTitle}" needs a YouTube URL.`; break; }
                    // Optional: Validate YouTube URL format more strictly
                    if (lesson.contentType === 'video' && lesson.videoUrl?.trim() && !lesson.videoUrl.includes('youtube.com/watch?v=') && !lesson.videoUrl.includes('youtu.be/')) {
                         errorMsg = `Lesson "${lesson.lessonTitle}" has an invalid YouTube URL format.`; break;
                     }
                }
                if (errorMsg) break;
            }
        }

        if (errorMsg) {
            setValidationError(errorMsg);
            toast.error(errorMsg); // Also show a toast for better visibility
            return;
        }

        setValidationError(null);
        // The actual onSave in the parent will handle currentThumbnailFile
        onSave(editableOutline);
    };

    if (!editableOutline) {
        // console.log("[Editor Render] editableOutline is null, rendering placeholder or null.");
        // Could return a loading spinner here if parent isn't already handling it
        return (
            <div className="mt-6 p-4 md:p-6 border border-indigo-200 rounded-lg bg-white shadow-inner flex justify-center items-center h-64">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-500" />
                <span className="ml-3 text-gray-600">Loading editor...</span>
            </div>
        );
    }


    return (
        <div className="mt-6 p-4 md:p-6 border border-indigo-200 rounded-lg bg-white shadow-inner space-y-6">
            <h3 className="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileAlt} className="text-indigo-500" />
                {isEditing ? 'Edit Course Outline' : 'Create New Course Outline'}
            </h3>

            {validationError && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded flex items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 flex-shrink-0" />
                    <span className='flex-1'>{validationError}</span>
                </div>
            )}

            {/* Course Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Title */}
                <div>
                    <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="courseTitle"
                        id="courseTitle"
                        value={editableOutline.courseTitle || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Access Type */}
                <div>
                    <label htmlFor="finalAccessType" className="block text-sm font-medium text-gray-700 mb-1">
                        Access Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="accessType"
                        id="finalAccessType"
                        value={editableOutline.accessType || 'basic'}
                        onChange={handleAccessTypeChange}
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        <option value="basic">Basic</option>
                        <option value="classic">Classic</option>
                        <option value="pro">Pro</option>
                    </select>
                </div>
            </div>

            {/* Course Description */}
            <div className="mt-0"> {/* Adjusted margin if needed */}
                <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Description
                </label>
                <textarea
                    name="courseDescription"
                    id="courseDescription"
                    rows="3"
                    value={editableOutline.courseDescription || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe what students will learn in this course..."
                />
            </div>

            {/* --- NEW Thumbnail Input Section --- */}
            <div className="mb-0"> {/* Adjusted margin if needed */}
                <label htmlFor="thumbnailFile-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Thumbnail (Optional, Max 2MB)
                </label>
                <div
                    className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 
                                ${thumbnailPreview ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'} 
                                border-dashed rounded-md cursor-pointer transition-colors duration-150 ease-in-out relative group`}
                    onClick={!thumbnailPreview ? triggerFileInput : undefined} // Only trigger if no preview
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        name="thumbnailFile"
                        id="thumbnailFile-input"
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        onChange={handleThumbFileChange}
                        className="sr-only"
                    />

                    {thumbnailPreview ? (
                        <div className="relative w-full h-40 sm:h-48 flex justify-center items-center rounded-md overflow-hidden">
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="object-contain max-h-full max-w-full"
                            />
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveThumbnail(); }}
                                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                                title="Remove image"
                                aria-label="Remove thumbnail image"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                            >
                                Change Image
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-1 text-center py-4">
                            <FontAwesomeIcon icon={faImage} className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            <div className="flex text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">
                                <p className="pl-1">
                                    <span className="font-semibold">Upload thumbnail</span> or drag & drop
                                </p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                        </div>
                    )}
                </div>
            </div>
            {/* --- End NEW Thumbnail Input Section --- */}


            <hr className="my-4 border-gray-200" />

            {/* Modules Section (Your existing JSX for modules) */}
            <div>
                <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
                    Course Modules <span className="text-red-500">*</span>
                </h4>

                {editableOutline.modules?.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-2xl mb-2" />
                        <p className="text-gray-500">No modules yet. Add your first module to get started!</p>
                        <button
                            onClick={handleAddModule}
                            className="mt-3 flex items-center justify-center gap-2 px-4 py-2 mx-auto border border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add First Module
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {editableOutline.modules.map((module, moduleIndex) => (
                            <div key={module._id || `mod-${moduleIndex}`} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div
                                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleModuleExpansion(moduleIndex)}
                                >
                                    <div className="flex items-center gap-3 flex-grow min-w-0">
                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                                            {moduleIndex + 1}
                                        </span>
                                        <h5 className="font-medium text-gray-800 truncate" title={module.moduleTitle || `Module ${moduleIndex + 1}`}>
                                            {module.moduleTitle || `Module ${moduleIndex + 1}`}
                                        </h5>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveModuleUp(moduleIndex); }} disabled={moduleIndex === 0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1" title="Move up"><FontAwesomeIcon icon={faArrowUp} size="xs" /></button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveModuleDown(moduleIndex); }} disabled={moduleIndex === editableOutline.modules.length - 1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1" title="Move down"><FontAwesomeIcon icon={faArrowDown} size="xs" /></button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveModule(moduleIndex); }} className="text-gray-400 hover:text-red-600 p-1" title="Remove module"><FontAwesomeIcon icon={faTrashAlt} size="xs" /></button>
                                    </div>
                                </div>

                                {expandedModules[moduleIndex] && (
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <div className="mb-4">
                                            <label htmlFor={`moduleTitle-${moduleIndex}`} className="block text-xs font-medium text-gray-500 mb-1">Module Title <span className="text-red-500">*</span></label>
                                            <input type="text" id={`moduleTitle-${moduleIndex}`} value={module.moduleTitle || ''} onChange={(e) => handleModuleChange(moduleIndex, 'moduleTitle', e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div className="border-t pt-4">
                                            <h6 className="text-sm font-semibold text-gray-700 mb-3">Lessons ({module.lessons?.length || 0}) <span className="text-red-500">*</span></h6>
                                            {module.lessons?.length === 0 ? (
                                                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50"><p className="text-gray-500 text-sm">No lessons yet.</p><button onClick={() => handleAddLesson(moduleIndex)} className="mt-2 flex items-center justify-center gap-1 px-3 py-1 mx-auto border border-dashed border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm"><FontAwesomeIcon icon={faPlus} size="xs" /> Add First Lesson</button></div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {module.lessons.map((lesson, lessonIndex) => (
                                                        <div key={lesson._id || `lesson-${moduleIndex}-${lessonIndex}`} className="border border-gray-200 rounded-md p-3 bg-gray-50/50">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex-grow mr-2">
                                                                    <label htmlFor={`lessonTitle-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">Lesson {lessonIndex + 1} Title <span className="text-red-500">*</span></label>
                                                                    <input type="text" id={`lessonTitle-${moduleIndex}-${lessonIndex}`} value={lesson.lessonTitle || ''} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'lessonTitle', e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                                                </div>
                                                                <div className="flex flex-col items-center gap-1 pt-5 flex-shrink-0"> {/* Adjusted for vertical alignment */}
                                                                    <button type="button" onClick={() => moveLessonUp(moduleIndex, lessonIndex)} disabled={lessonIndex === 0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1" title="Move up"><FontAwesomeIcon icon={faArrowUp} size="xs" /></button>
                                                                    <button type="button" onClick={() => moveLessonDown(moduleIndex, lessonIndex)} disabled={lessonIndex === module.lessons.length - 1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 p-1" title="Move down"><FontAwesomeIcon icon={faArrowDown} size="xs" /></button>
                                                                    <button type="button" onClick={() => handleRemoveLesson(moduleIndex, lessonIndex)} className="text-gray-400 hover:text-red-600 p-1" title="Remove lesson"><FontAwesomeIcon icon={faTrashAlt} size="xs" /></button>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 space-y-3">
                                                                <div>
                                                                    <label htmlFor={`contentType-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">Content Type</label>
                                                                    <select id={`contentType-${moduleIndex}-${lessonIndex}`} value={lesson.contentType || 'text'} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'contentType', e.target.value)} className="border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                                                                        <option value="text">Text Content</option>
                                                                        <option value="video">Video Lesson</option>
                                                                    </select>
                                                                </div>
                                                                {lesson.contentType === 'text' && (
                                                                    <div>
                                                                        <label htmlFor={`textContent-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">Lesson Content</label>
                                                                        <textarea id={`textContent-${moduleIndex}-${lessonIndex}`} rows="4" value={lesson.textContent || ''} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'textContent', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                                                    </div>
                                                                )}
                                                                {lesson.contentType === 'video' && (
                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <label htmlFor={`videoUrl-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">YouTube Video URL <span className="text-red-500">*</span></label>
                                                                            <input type="url" id={`videoUrl-${moduleIndex}-${lessonIndex}`} value={lesson.videoUrl || ''} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                                                        </div>
                                                                        <div>
                                                                            <label htmlFor={`videoDescription-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-500 mb-1">Video Description (Optional)</label>
                                                                            <textarea id={`videoDescription-${moduleIndex}-${lessonIndex}`} rows="2" value={lesson.videoDescription || ''} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'videoDescription', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="mt-2"><button onClick={() => handleAddLesson(moduleIndex)} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-dashed border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm"><FontAwesomeIcon icon={faPlus} size="xs" /> Add Another Lesson</button></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="mt-4"><button onClick={handleAddModule} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"><FontAwesomeIcon icon={faPlus} /> Add Another Module</button></div>
                    </div>
                )}
            </div>


            <hr className="my-4 border-gray-200" />

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={triggerSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving ? (
                        <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" />Saving...</>
                    ) : (
                        <><FontAwesomeIcon icon={faSave} className="mr-2" />Save Course</>
                    )}
                </button>
            </div>
        </div>
    );
}

export default CourseOutlineEditor;