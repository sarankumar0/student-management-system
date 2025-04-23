import React, { useState,useEffect,useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';


function AddEditTest() {
    // State for basic quiz details
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        accessType: 'basic', // Default value
        timeLimitMinutes: '',
        passingScorePercentage: '',
    });

    // State for the dynamic questions array
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', ''], correctAnswerIndex: null } // Start with one empty question structure
    ]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [bulkFile, setBulkFile] = useState(null); // State for the bulk upload file
    const [isEditMode, setIsEditMode] = useState(false);
    const [editQuizId, setEditQuizId] = useState(null);
    const location = useLocation(); // Get location object which contains state
    const navigate = useNavigate();

     // --- Effect to Check for Edit Mode on Mount ---
     useEffect(() => {
        // Check if state was passed during navigation
        if (location.state && location.state.editQuizId) {
            const quizId = location.state.editQuizId;
            console.log("Edit mode detected. Quiz ID:", quizId);
            setIsEditMode(true);
            setEditQuizId(quizId);

            // Fetch the existing quiz data
            const fetchQuizForEdit = async () => {
                setFetchLoading(true);
                setError(null); // Clear previous errors
                 try {
                    const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
                    const fetchedQuiz = response.data;
                    console.log("Fetched quiz for edit:", fetchedQuiz);

                    // Populate the form state
                    setQuizData({
                        title: fetchedQuiz.title || '',
                        description: fetchedQuiz.description || '',
                        accessType: fetchedQuiz.accessType || 'basic',
                        timeLimitMinutes: fetchedQuiz.timeLimitMinutes || '',
                        passingScorePercentage: fetchedQuiz.passingScorePercentage || '',
                    });
                     // Map questions carefully to match state structure
                     setQuestions(fetchedQuiz.questions.map(q => ({
                        // Need unique ID for key stability if allowing question reordering/deletion during edit
                        _id: q._id, // Store original question ID if needed for PATCH backend
                        questionText: q.questionText || '',
                        options: q.options || ['', ''], // Ensure options is an array
                        correctAnswerIndex: (q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined) ? q.correctAnswerIndex : null, // Handle null/undefined
                        // points: q.points // Include if using points
                     })) || [{ questionText: '', options: ['', ''], correctAnswerIndex: null }]); // Fallback

                 } catch (err) {
                     console.error("Error fetching quiz for edit:", err);
                     setError(`Failed to load quiz data for editing. Error: ${err.response?.data?.message || err.message}`);
                     // Optionally navigate back or disable form
                 } finally {
                     setFetchLoading(false);
                 }
            };

            fetchQuizForEdit();
        } else {
             // Reset to create mode if no ID is passed (e.g., navigating directly)
             setIsEditMode(false);
             setEditQuizId(null);
         }
         // Clear success/error messages when mode changes or component mounts
         setSuccess(null);
         setError(null);

    }, [location.state]); // Re-run effect if location.state changes
    // --- Handlers for Basic Quiz Data ---
    const handleQuizDataChange = (e) => {
        const { name, value } = e.target;
        setQuizData(prev => ({ ...prev, [name]: value }));
    };

    // --- Handlers for Questions Array ---

    const handleBulkFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Basic validation (e.g., check type again)
          if (file.type === "text/csv" || file.name.endsWith(".csv")) {
               setBulkFile(file);
               console.log("Bulk file selected:", file);
          } else {
               alert("Please select a valid CSV file.");
               e.target.value = null; // Clear the input
               setBulkFile(null);
          }
      } else {
           setBulkFile(null); // Clear state if selection is cancelled
      }
  };

    // Update a specific question's text
    const handleQuestionTextChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = value;
        setQuestions(newQuestions);
    };

    // Update a specific option text within a question
    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(newQuestions);
    };

    // Add a new option to a specific question
    const handleAddOption = (questionIndex) => {
        const newQuestions = [...questions];
        // Ensure not adding too many options (e.g., limit to 6?)
        if (newQuestions[questionIndex].options.length < 6) {
             newQuestions[questionIndex].options.push(''); // Add empty option
             setQuestions(newQuestions);
        } else {
            alert("Maximum of 6 options allowed per question.");
        }
    };

    // Remove an option from a specific question (ensure at least 2 remain)
    const handleRemoveOption = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].options.length > 2) { // Keep at least 2 options
             newQuestions[questionIndex].options.splice(optionIndex, 1);
             // Adjust correct answer index if needed after removal
             if (newQuestions[questionIndex].correctAnswerIndex === optionIndex) {
                 newQuestions[questionIndex].correctAnswerIndex = null; // Reset if removed option was correct
             } else if (newQuestions[questionIndex].correctAnswerIndex > optionIndex) {
                 newQuestions[questionIndex].correctAnswerIndex -= 1; // Decrement if correct answer was after removed one
             }
             setQuestions(newQuestions);
        } else {
            alert("A question must have at least two options.");
        }
    };

    // Set the correct answer index for a specific question
    const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].correctAnswerIndex = optionIndex;
        setQuestions(newQuestions);
    };

    // Add a new empty question structure to the array
    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { questionText: '', options: ['', ''], correctAnswerIndex: null }
        ]);
    };

    // Remove a question from the array (ensure at least 1 remains)
    const handleRemoveQuestion = (index) => {
        if (questions.length > 1) {
             const newQuestions = questions.filter((_, i) => i !== index);
             setQuestions(newQuestions);
        } else {
            alert("A quiz must have at least one question.");
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Basic Frontend Validation (more detailed validation happens on backend)
        if (!quizData.title || !quizData.accessType || !quizData.timeLimitMinutes || !quizData.passingScorePercentage) {
            setError("Quiz Title and Access Type are required.");
            setLoading(false);
            return;
        }
        if (!bulkFile && questions.some(q => !q.questionText || q.options.length < 2 || q.options.some(opt => !opt.trim()) || q.correctAnswerIndex === null)) {
          setError("If not using bulk upload, please ensure all questions have text, at least two non-empty options, and a selected correct answer.");
             setLoading(false);
             return;
         }
         if (!bulkFile && questions.length === 0){
          setError("Please add at least one question manually or upload a bulk file.");
          setLoading(false);
          return;
     }
     let payload;
     let config = { headers: { 'Content-Type': 'application/json' } }; 
     let endpoint = '/api/quizzes'; // Default for POST
     let method = 'post';

     if (isEditMode) {
        endpoint = `/api/quizzes/${editQuizId}`; // Target specific quiz
        method = 'patch'; // Use PATCH for updates
    }

    if (bulkFile && !isEditMode) {
      // *** BACKEND DOES NOT SUPPORT THIS YET ***
      // When backend is ready: Send as FormData
       console.log("Preparing FormData for bulk upload (Backend support needed)");
       setError("Bulk upload feature is not yet fully implemented on the server."); // Temporary error
       setLoading(false);
       return;} else {

        payload = {
          title: quizData.title,
          description: quizData.description || undefined,
          accessType: quizData.accessType,
          timeLimitMinutes: parseInt(quizData.timeLimitMinutes, 10),
          passingScorePercentage: parseInt(quizData.passingScorePercentage, 10),
          questions: questions.map(q => ({
               questionText: q.questionText,
               options: q.options.map(opt => opt.trim()),
               correctAnswerIndex: q.correctAnswerIndex,
           }))
      };


      console.log("Submitting Manual Questions Payload:", JSON.stringify(payload, null, 2));
    }

        try {
          const response = await axios[method](`http://localhost:5000${endpoint}`, payload, config); // Send to backend endpoint
            console.log("Server Response:", response.data);
            const actionVerb = isEditMode ? 'updated' : 'created';
            setSuccess(`Quiz "${response.data.title || payload.title}" ${actionVerb} successfully!`);
            if (isEditMode) {
                // Optionally navigate back to the list after successful update
                navigate('/test/list'); 
            }else{
            setQuizData({ title: '', description: '', accessType: 'basic', timeLimitMinutes: '', passingScorePercentage: '' });
            setQuestions([{ questionText: '', options: ['', ''], correctAnswerIndex: null }]);
            setBulkFile(null); // Clear bulk file
        }
        } catch (err) {
            console.error("Error submitting quiz:", err);
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} quiz:`, err);
            let errorMsg = `Failed to ${isEditMode ? 'update' : 'create'} quiz.`;
            if (err.response && err.response.data) {
                // Use specific error message from backend if available
                errorMsg = err.response.data.message || errorMsg;
                if (err.response.data.errors) {
                     // Append validation errors
                     errorMsg += ` Details: ${err.response.data.errors.join(', ')}`;
                 }
                 console.error("Backend Error Details:", err.response.data);
            } else if (err.request) {
                errorMsg = "No response received from server. Please check network connection.";
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- JSX Structure (Basic Outline) ---
    return (
        <div className="p-6 max-w-8xl mx-auto bg-white rounded-lg shadow-xl">
<Breadcrumbs />

              {fetchLoading && (
                 <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                     <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" />
                     <span className='ml-3 text-indigo-700'>Loading Quiz Data...</span>
                 </div>
             )}
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">
                {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>


            {/* --- Display Messages --- */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded flex items-center">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2" /> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded flex items-center">
                     <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> {success}
                </div>
            )}
           
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- Basic Quiz Details --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                         <input type="text" name="title" id="title" value={quizData.title} onChange={handleQuizDataChange} required
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                     </div>
                     <div>
                         <label htmlFor="accessType" className="block text-sm font-medium text-gray-700 mb-1">Target Batch</label>
                         <select name="accessType" id="accessType" value={quizData.accessType} onChange={handleQuizDataChange} required
                                 className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                             <option value="basic">Basic</option>
                             <option value="classic">Classic</option>
                             <option value="pro">Pro</option>
                         </select>
                     </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea name="description" id="description" rows="3" value={quizData.description} onChange={handleQuizDataChange}
                              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label htmlFor="timeLimitMinutes" className="block text-sm font-medium text-gray-700 mb-1">Time Limit (Minutes)</label>
                         <input type="number" name="timeLimitMinutes" id="timeLimitMinutes" min="1" value={quizData.timeLimitMinutes} onChange={handleQuizDataChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" required/>
                     </div>
                     <div>
                         <label htmlFor="passingScorePercentage" className="block text-sm font-medium text-gray-700 mb-1">Passing Score (Mark)</label>
                         <input type="number" name="passingScorePercentage" id="passingScorePercentage" min="0" max="100" value={quizData.passingScorePercentage} onChange={handleQuizDataChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" required/>
                     </div>
                 </div>

                 <div className={`mt-6 border-t pt-6 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Upload Questions {isEditMode ? '(Disabled in Edit Mode)' : '(Optional)'}</h3>
        
        <div>
            <label htmlFor="bulkQuizFile" className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
            <input
                type="file"
                name="bulkQuizFile" // Use a distinct name
                id="bulkQuizFile"
                accept=".csv, text/csv" // Accept only CSV
                onChange={handleBulkFileChange} // We need to create this handler
                disabled={isEditMode} 
                className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {/* Display selected file name */}
            {bulkFile && <p className="mt-2 text-sm text-gray-600">Selected file: {bulkFile.name}</p>}
        </div>
        <p className="text-sm text-gray-500 mb-3">
            Upload a CSV file with questions. Format: column 1=Question Text, column 2=Option 1, column 3=Option 2, ..., column N=Correct Answer Index (0-based).
            <br/><strong>Note:</strong> If you upload a file, manually added questions below will be ignored.
        </p>
    </div>
    {/* --- End Bulk Upload Section --- */}


    <hr className="my-6"/>

    {/* --- Dynamic Questions Section --- */}
    <h3 className="text-xl font-semibold text-gray-800 mb-4">
    {isEditMode ? 'Edit Questions' : 'Manually Add Questions'}
                  {bulkFile && !isEditMode ? ' (Ignored if bulk file selected)' : ''}
                  {!bulkFile && !isEditMode ? ' (Required if no bulk file)' : ''}
             </h3>

    

                <hr className="my-6"/>

                {/* --- Dynamic Questions Section --- */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Questions</h3>
                {questions.map((question, qIndex) => (
                    <div key={qIndex} className="border rounded-md p-4 mb-4 bg-gray-50 relative space-y-3">
                        {/* Remove Question Button (Top Right) */}
                        {questions.length > 1 && (
                             <button type="button" onClick={() => handleRemoveQuestion(qIndex)}
                                     className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                     title="Remove Question">
                                 <FontAwesomeIcon icon={faTrash} />
                             </button>
                        )}

                        {/* Question Text */}
                        <div>
                             <label htmlFor={`questionText-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">Question {qIndex + 1}</label>
                             <textarea name={`questionText-${qIndex}`} id={`questionText-${qIndex}`} rows="2" value={question.questionText} required
                                      onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>

                        {/* Options */}
                        <div className='space-y-2'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Options (Select correct answer)</label>
                            {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    {/* Radio Button for Correct Answer */}
                                    <input type="radio" name={`correctAnswer-${qIndex}`} id={`correctAnswer-${qIndex}-${oIndex}`} required
                                           checked={question.correctAnswerIndex === oIndex}
                                           onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                           className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/>

                                    {/* Option Text Input */}
                                    <input type="text" value={option} required
                                           onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                           className="flex-grow border border-gray-300 rounded-md shadow-sm p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                           placeholder={`Option ${oIndex + 1}`}/>

                                    {/* Remove Option Button */}
                                    {question.options.length > 2 && (
                                        <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                className="text-red-500 hover:text-red-700 p-1 text-xs" title="Remove Option">
                                             <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}
                                </div>
                             ))}
                             {/* Add Option Button */}
                             {question.options.length < 6 && (
                                  <button type="button" onClick={() => handleAddOption(qIndex)}
                                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                       <FontAwesomeIcon icon={faPlus} /> Add Option
                                  </button>
                             )}
                        </div>
                    </div>
                ))}

                {/* Add Question Button */}
                <button type="button" onClick={handleAddQuestion} disabled={isEditMode} 
                        className="mt-4 flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition duration-150">
                    <FontAwesomeIcon icon={faPlus} /> Add Another Question
                </button>

                 <hr className="my-6"/>

                {/* --- Submit Button --- */}
                <div className="flex justify-end">
                    <button type="submit" disabled={loading || fetchLoading}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {loading && <FontAwesomeIcon icon={faSpinner} spin className="mr-2"/>}
                     {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Quiz' : 'Create Quiz')}
                 </button>
                 </div>
            </form>
        </div>
    );
}

export default AddEditTest;