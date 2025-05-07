import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faSpinner, faExclamationTriangle, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CourseOutlineEditor from './AICourseOutlineEditor';

function AICourseOutlineGenerator() {
    // --- State for Inputs ---
    const [topic, setTopic] = useState('');
    const [targetAudience, setTargetAudience] = useState('beginner');
    const [numModules, setNumModules] = useState(5);
    const [includeVideos, setIncludeVideos] = useState(true);
    const [targetPlanSuggestion, setTargetPlanSuggestion] = useState('basic');

    // --- State for API Interaction ---
    const [loadingGenerate, setLoadingGenerate] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(false);
    const [error, setError] = useState(null);
    const [generatedOutline, setGeneratedOutline] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);

    // --- NEW State for Edit Mode ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);

    // --- Hooks ---
    const location = useLocation();
    const navigate = useNavigate();

    // --- Effect to Detect Edit Mode and Fetch Data ---
    useEffect(() => {
        // Reset component state when location changes (navigating away/back)
        setTopic('');
        setGeneratedOutline(null);
        setError(null);
        setThumbnailFile(null);
        setIsEditMode(false);
        setEditCourseId(null);

        // Check for edit state passed via navigation
        if (location.state && location.state.editCourseId) {
            const courseId = location.state.editCourseId;
            console.log("[Generator] Edit mode detected. Course ID:", courseId);
            setIsEditMode(true);
            setEditCourseId(courseId);

            const fetchCourseForEdit = async () => {
                setLoadingInitialData(true);
                setError(null);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('Authentication required');
                    setLoadingInitialData(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                try {
                    const response = await axios.get(`http://localhost:5000/api/ai-courses/${courseId}`, config);
                    console.log("[Generator] Fetched course for edit:", response.data);

                    if (response.data) {
                        setGeneratedOutline({
                            courseTitle: response.data.title,
                            courseDescription: response.data.description,
                            accessType: response.data.accessType,
                            modules: response.data.modules || [],
                            thumbnailUrl: response.data.thumbnailUrl
                        });
                    } else {
                        throw new Error("Course data not found in response.");
                    }
                } catch (err) {
                    console.error("Error fetching course for edit:", err);
                    setError(err.response?.data?.message || "Failed to load course data for editing.");
                } finally {
                    setLoadingInitialData(false);
                }
            };
            fetchCourseForEdit();
        }
    }, [location.state]);

    // --- Handler for Generation Request ---
    const handleGenerateOutline = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            toast.error("Please enter a course topic.");
            return;
        }

        setLoadingGenerate(true);
        setError(null);
        setGeneratedOutline(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setLoadingGenerate(false);
            return;
        }

        const payload = {
            topic,
            targetAudience,
            numModules: parseInt(numModules, 10),
            includeVideos,
            targetPlanSuggestion
        };
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        console.log("Sending generation request with payload:", payload);

        try {
            const response = await axios.post('http://localhost:5000/api/ai/generate-course-outline', payload, config);
            console.log("AI Outline Response:", response.data);

            if (response.data && response.data.courseOutline) {
                setGeneratedOutline(response.data.courseOutline);
                toast.success("Course outline generated successfully! Please review and edit below.");
            } else {
                throw new Error("Invalid response structure received from AI generation endpoint.");
            }
        } catch (err) {
            console.error("Error generating course outline:", err);
            const errorMsg = err.response?.data?.message || "Failed to generate outline.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoadingGenerate(false);
        }
    };

    // --- Handler for saving the FINAL course ---
    const handleSaveCourse = async (finalCourseData) => {
        console.log("Final Course Data to Save:", JSON.stringify(finalCourseData, null, 2));
        console.log("Thumbnail File:", thumbnailFile);
        setLoadingSave(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setLoadingSave(false);
            return;
        }

        const payload = new FormData();
        const courseDataObject = {
            title: finalCourseData.courseTitle,
            description: finalCourseData.courseDescription,
            accessType: finalCourseData.accessType,
            modules: finalCourseData.modules.map(mod => ({
                title: mod.moduleTitle,
                order: mod.order,
                lessons: mod.lessons.map(lesson => ({
                    title: lesson.lessonTitle,
                    order: lesson.order,
                    contentType: lesson.contentType,
                    textContent: lesson.textContent,
                    videoUrl: lesson.videoUrl,
                    videoDescription: lesson.videoDescription
                }))
            })),
            status: finalCourseData.status || 'published'
        };
        payload.append('courseData', JSON.stringify(courseDataObject));

        if (thumbnailFile instanceof File) {
            payload.append('thumbnailFile', thumbnailFile);
        }

        // --- Determine Endpoint and Method ---
        const isUpdating = isEditMode && editCourseId;
        const endpoint = isUpdating
            ? `http://localhost:5000/api/ai-courses/${editCourseId}`
            : 'http://localhost:5000/api/ai-courses';
        const method = isUpdating ? 'patch' : 'post';

        console.log(`${method.toUpperCase()}ing to ${endpoint}...`);
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        };

        try {
            const response = await axios[method](endpoint, payload, config);
            console.log("Save/Update Course Response:", response.data);
            toast.success(`Course "${response.data.title}" ${isUpdating ? 'updated' : 'saved'} successfully!`);

            setGeneratedOutline(null);
            setTopic('');
            setThumbnailFile(null);
            if (isUpdating) {
                navigate('/admin/ai-tools/manage-courses');
            }
        } catch (err) {
            console.error(`Error ${isUpdating ? 'updating' : 'saving'} course:`, err);
            const errorMsg = err.response?.data?.message || `Failed to ${isUpdating ? 'update' : 'save'} course.`;
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoadingSave(false);
        }
    };

    // --- Render Logic ---
    return (
        <div className="p-4 md:p-6 max-w mx-auto">
            {/* Show different title based on mode */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Edit AI-Generated Course' : 'AI Course Outline Generator'}
            </h1>

            {/* Generation Form (Conditionally disable/hide in edit mode) */}
            {!isEditMode && (
                <form onSubmit={handleGenerateOutline} className="bg-white p-6 rounded-lg shadow space-y-4 mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">1. Generate Outline</h2>
                    
                    {/* Topic Input */}
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Course Topic <span className="text-red-500">*</span></label>
                        <input type="text" name="topic" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} required minLength="3"
                                placeholder="e.g., Introduction to Python Programming"
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Target Audience */}
                        <div>
                            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <select name="targetAudience" id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                        {/* Number of Modules */}
                        <div>
                            <label htmlFor="numModules" className="block text-sm font-medium text-gray-700 mb-1">Number of Modules</label>
                            <input type="number" name="numModules" id="numModules" min="1" max="15" value={numModules} onChange={(e) => setNumModules(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Target Plan Suggestion */}
                        <div>
                            <label htmlFor="targetPlanSuggestion" className="block text-sm font-medium text-gray-700 mb-1">Initial Plan Target</label>
                            <select name="targetPlanSuggestion" id="targetPlanSuggestion" value={targetPlanSuggestion} onChange={(e) => setTargetPlanSuggestion(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                                <option value="basic">Basic</option>
                                <option value="classic">Classic</option>
                                <option value="pro">Pro</option>
                            </select>
                        </div>
                        {/* Include Videos Checkbox */}
                        <div className="flex items-center pt-6">
                            <input type="checkbox" name="includeVideos" id="includeVideos" checked={includeVideos} onChange={(e) => setIncludeVideos(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/>
                            <label htmlFor="includeVideos" className="text-sm font-medium text-gray-700">Suggest Video Topics?</label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-right pt-2">
                        <button type="submit" disabled={loadingGenerate || !topic.trim()}
                                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {loadingGenerate ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2"/> : <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2"/>}
                            {loadingGenerate ? 'Generating...' : 'Generate Outline'}
                        </button>
                    </div>
                </form>
            )}

            {/* Loading indicator for fetching edit data */}
            {loadingInitialData && (
                <div className="text-center p-10"><FontAwesomeIcon icon={faSpinner} spin /> Loading course data...</div>
            )}

            {/* Display Error (if not loading edit data) */}
            {error && !loadingInitialData && (
                <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded flex items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 flex-shrink-0" />
                    <span className='flex-1'>{error}</span>
                </div>
            )}

            {/* --- Generated Outline Editor --- */}
            {generatedOutline && !loadingInitialData && (
                <div>
                    {!isEditMode && <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4 mt-8">2. Review & Edit Outline</h2>}
                    <CourseOutlineEditor
                        key={editCourseId || 'create'}
                        outlineData={generatedOutline}
                        onSave={handleSaveCourse}
                        isSaving={loadingSave}
                        currentThumbnailFile={thumbnailFile}
                        onThumbnailChange={setThumbnailFile}
                        isEditing={isEditMode}
                    />
                </div>
            )}
        </div>
    );
}

export default AICourseOutlineGenerator;