// // src/component/courses/StudentCourseViewerPage.jsx (New File - Full Implementation)

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//     faSpinner, faExclamationTriangle, faBookOpen, faChevronDown, faChevronUp,
//     faFileAlt, faVideo, faCheckCircle, faCircle as faCircleRegular // Using regular circle for incomplete
// } from '@fortawesome/free-solid-svg-icons';
// import ReactPlayer from 'react-player/youtube'; // Import YouTube player
// import { toast } from 'react-toastify';

// // Reusable Badge Component (can be imported)
//  const AccessTypeBadge = ({ accessType }) => (
//          <span className={`
//              text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
//              ${accessType.toLowerCase() === 'pro' ? 'bg-indigo-600' :
//                accessType.toLowerCase() === 'classic' ? 'bg-purple-500' :
//                accessType.toLowerCase() === 'basic' ? 'bg-teal-500' :
//                'bg-gray-500' // Default fallback
//              }
//          `}>
//              {accessType}
//          </span>
//      );

// // Format Date helper (can be imported)
// const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric', month: 'short', day: 'numeric'
//         });
//     } catch (e) {
//         return 'Invalid Date';
//     }
// };


// function StudentCourseViewerPage() {
//     const { courseId } = useParams();
//     const navigate = useNavigate();

//     // --- State ---
//     const [courseData, setCourseData] = useState(null); // Full course structure { title, modules: [{ title, lessons: [{_id, title, contentType,...}] }] }
//     const [progressData, setProgressData] = useState({ completedLessons: [] }); // { completedLessons: [id1, id2...] }
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [expandedModules, setExpandedModules] = useState({}); // Tracks which modules are open { moduleIndex: true/false }
//     const [updatingProgress, setUpdatingProgress] = useState(new Set()); // Track which lesson IDs are being updated

//     // --- Fetch Initial Data ---
//     useEffect(() => {
//         let isMounted = true;
//         const loadData = async () => {
//             if (!courseId) {
//                 if (isMounted) { setError("Invalid Course ID."); setLoading(false); }
//                 return;
//             }
//             setLoading(true);
//             setError(null);
//             const token = localStorage.getItem('authToken');
//             if (!token) {
//                 if (isMounted) { setError("Authentication required."); setLoading(false); }
//                 return;
//             }
//             const config = { headers: { Authorization: `Bearer ${token}` } };

//             try {
//                 console.log(`Fetching course ${courseId} and progress...`);
//                 const [courseResponse, progressResponse] = await Promise.all([
//                     axios.get(`http://localhost:5000/api/ai-courses/${courseId}`, config),
//                     axios.get(`http://localhost:5000/api/student/course-progress/${courseId}`, config)
//                 ]);

//                 if (!isMounted) return;

//                 console.log("Course Data:", courseResponse.data);
//                 console.log("Progress Data:", progressResponse.data);

//                 if (!courseResponse.data || courseResponse.data.status !== 'published') {
//                     // Handle cases where course is not found, not published, or user not eligible (backend should return 403/404)
//                      setError(courseResponse.data?.message || "Course not found or not available.");
//                      setCourseData(null);
//                      setProgressData({ completedLessons: [] });
//                  } else {
//                     setCourseData(courseResponse.data);
//                     setProgressData(progressResponse.data.progress || { completedLessons: [] });
//                      // Expand the first module by default
//                      setExpandedModules({ 0: true });
//                  }

//             } catch (err) {
//                 if (!isMounted) return;
//                 console.error("Error loading course/progress:", err);
//                 setError(err.response?.data?.message || "Failed to load course data.");
//                  setCourseData(null);
//                  setProgressData({ completedLessons: [] });
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };
//         loadData();

//         return () => { isMounted = false; }; // Cleanup
//     }, [courseId]);

//     // --- Memoized Set of Completed Lessons for Quick Lookup ---
//     const completedLessonSet = useMemo(() => {
//         return new Set(progressData.completedLessons || []);
//     }, [progressData]);

//     // --- Toggle Module Expansion ---
//     const toggleModule = (moduleIndex) => {
//         setExpandedModules(prev => ({
//             ...prev,
//             [moduleIndex]: !prev[moduleIndex]
//         }));
//     };

//     // --- Mark Lesson Complete Handler ---
//     const handleMarkLessonComplete = useCallback(async (lessonId) => {
//         if (!courseId || !lessonId) return;
//         if (completedLessonSet.has(lessonId)) return; // Already complete

//         setUpdatingProgress(prev => new Set(prev).add(lessonId)); // Add lessonId to submitting set
//         const token = localStorage.getItem('authToken');
//         if (!token) { /* ... auth error ... */ setUpdatingProgress(prev => { prev.delete(lessonId); return new Set(prev); }); return; }
//         const config = { headers: { Authorization: `Bearer ${token}` } };
//         const payload = { courseId, lessonId };

//         try {
//             const response = await axios.post('http://localhost:5000/api/student/courses/progress', payload, config);
//             // Update local progress state immediately based on response
//              if (response.data && response.data.progress) {
//                  setProgressData(response.data.progress); // Update with latest from backend
//                  console.log(`Lesson ${lessonId} marked complete.`);
//                  // toast.success("Lesson complete!"); // Optional feedback
//              } else {
//                  // Fallback if backend response is weird, add locally
//                  setProgressData(prev => ({
//                       ...prev,
//                       completedLessons: [...(prev.completedLessons || []), lessonId]
//                   }));
//              }
//         } catch (err) {
//             console.error("Error marking lesson complete:", err);
//             toast.error(err.response?.data?.message || "Failed to update progress.");
//              // No need to revert optimistic update here as we set state from response
//         } finally {
//             // Remove lessonId from submitting set
//              setUpdatingProgress(prev => {
//                  const next = new Set(prev);
//                  next.delete(lessonId);
//                  return next;
//               });
//         }
//     }, [courseId, completedLessonSet]); // Dependencies


//     // --- Render Logic ---
//     if (loading) {
//         return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" /> Loading Course...</div>;
//     }

//     if (error) {
//         return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded text-center"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
//     }

//     if (!courseData) {
//         return <div className="m-4 p-4 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded text-center">Course data not available.</div>;
//     }

//     // --- Main Course View ---
//     return (
//         <div className="p-4 md:p-8 max-w-5xl mx-auto"> {/* Increased max-width */}
//             {/* Course Header */}
//             <div className="mb-8 pb-4 border-b border-gray-300">
//                 <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{courseData.title}</h1>
//                 {courseData.description && <p className="text-md text-gray-600">{courseData.description}</p>}
//                 {/* Add overall progress bar? */}
//             </div>

//             {/* Modules Accordion */}
//             <div className="space-y-4">
//                 {courseData.modules?.map((module, modIndex) => {
//                     const isExpanded = !!expandedModules[modIndex];
//                     // Calculate module completion
//                      const totalLessonsInModule = module.lessons?.length || 0;
//                      const completedLessonsInModule = module.lessons?.filter(l => completedLessonSet.has(l._id)).length || 0;
//                      const moduleComplete = totalLessonsInModule > 0 && completedLessonsInModule === totalLessonsInModule;

//                     return (
//                         <div key={module._id || modIndex} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
//                             {/* Module Header (Clickable) */}
//                             <button
//                                 onClick={() => toggleModule(modIndex)}
//                                 className="w-full flex justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100 transition duration-150"
//                                 aria-expanded={isExpanded}
//                             >
//                                 <div className='flex items-center'>
//                                      <span className={`mr-3 w-6 h-6 rounded-full flex items-center justify-center ${moduleComplete ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
//                                          {moduleComplete ? <FontAwesomeIcon icon={faCheckCircle} size="xs"/> : <span className='text-xs font-semibold'>{modIndex + 1}</span>}
//                                      </span>
//                                      <span className="text-lg font-semibold text-gray-700">{module.title}</span>
//                                      <span className="ml-3 text-xs text-gray-500">({completedLessonsInModule}/{totalLessonsInModule} lessons)</span>
//                                 </div>

//                                 <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-gray-500" />
//                             </button>

//                             {/* Module Content (Lessons - Collapsible) */}
//                             {isExpanded && (
//                                 <ul className="divide-y divide-gray-200 border-t border-gray-200">
//                                     {module.lessons?.map((lesson, lessonIndex) => {
//                                         const isCompleted = completedLessonSet.has(lesson._id);
//                                         const isUpdating = updatingProgress.has(lesson._id);
//                                         return (
//                                             <li key={lesson._id || lessonIndex} className="p-4 hover:bg-slate-50">
//                                                  <div className="flex justify-between items-center gap-4 mb-3">
//                                                      {/* Lesson Title and Type */}
//                                                      <div className="flex items-center flex-grow min-w-0">
//                                                           <FontAwesomeIcon
//                                                              icon={isCompleted ? faCheckCircle : (lesson.contentType === 'video' ? faVideo : faFileAlt)}
//                                                              className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isCompleted ? 'text-green-500' : (lesson.contentType === 'video' ? 'text-blue-500' : 'text-gray-500')}`}
//                                                          />
//                                                          <span className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{lesson.title}</span>
//                                                      </div>
//                                                       {/* Mark Complete Button */}
//                                                       <button
//                                                           onClick={() => handleMarkLessonComplete(lesson._id)}
//                                                           disabled={isCompleted || isUpdating} // Disable if complete or updating
//                                                           className={`text-xs font-medium py-1 px-2.5 rounded whitespace-nowrap flex items-center transition duration-150 ${
//                                                               isCompleted ? 'bg-gray-200 text-gray-500 cursor-default' :
//                                                               isUpdating ? 'bg-yellow-100 text-yellow-700 cursor-wait' :
//                                                               'bg-green-100 text-green-700 hover:bg-green-200'
//                                                           }`}
//                                                       >
//                                                            {isCompleted ? <><FontAwesomeIcon icon={faCheckCircle} className="mr-1"/> Completed</> :
//                                                              isUpdating ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-1"/> Updating...</> :
//                                                             'Mark as Complete'
//                                                            }
//                                                        </button>
//                                                  </div>

//                                                  {/* Lesson Content */}
//                                                  <div className="pl-7 text-sm text-gray-600 space-y-3">
//                                                       {lesson.contentType === 'text' && (
//                                                           <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.textContent || '<p><em>No text content available.</em></p>' }}>
//                                                               {/* Using dangerouslySetInnerHTML assumes content is safe/sanitized */}
//                                                               {/* If content is plain text: <p className="whitespace-pre-wrap">{lesson.textContent}</p> */}
//                                                           </div>
//                                                       )}
//                                                       {lesson.contentType === 'video' && lesson.videoUrl && (
//                                                            <div className="aspect-video max-w-2xl mx-auto my-4">
//                                                                 <ReactPlayer
//                                                                     url={lesson.videoUrl}
//                                                                     width="100%"
//                                                                     height="100%"
//                                                                     controls={true}
//                                                                     config={{ youtube: { playerVars: { showinfo: 1 } } }}
//                                                                 />
//                                                                {lesson.videoDescription && <p className="text-xs text-center mt-1 text-gray-500">{lesson.videoDescription}</p>}
//                                                            </div>
//                                                        )}
//                                                       {lesson.contentType === 'video' && !lesson.videoUrl && (
//                                                            <p className="text-red-500 italic text-xs">Video URL is missing for this lesson.</p>
//                                                        )}
//                                                  </div>
//                                              </li>
//                                         );
//                                      })}
//                                 </ul>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>

//              {/* Back Button */}
//             <div className="mt-8">
//                  <Link to="/courses" className="text-indigo-600 hover:underline">
//                      ← Back to Course List
//                  </Link>
//              </div>
//         </div>
//     );
// }

// export default StudentCourseViewerPage;

// src/component/courses/StudentCourseViewerPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faExclamationTriangle, faBookOpen, faChevronRight,
    faFileAlt, faVideo, faCheckCircle, faChevronLeft, faListUl, faTimes // Added faTimes
} from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player/youtube';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';       // Import toastify CSS

const API_BASE_URL = "http://localhost:5000"; // Define once

// Reusable Badge Component (can be imported or defined here)
const AccessTypeBadge = ({ accessType }) => (
    <span className={`
        text-xs text-white px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-medium
        ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
          accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
          accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
          'bg-gray-500'
        }
    `}>
        {accessType || 'N/A'}
    </span>
);

// Format Date helper (can be imported or defined here)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

// --- Course Sidebar Component ---
const CourseSidebar = ({
    courseTitle,
    modules,
    activeLessonId,
    onSelectLesson,
    completedLessonSet,
    onToggleSidebar,
    isSidebarOpen
}) => {
    return (
        <div className={`fixed inset-y-0 left-0 z-30 w-72 sm:w-80 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto lg:flex-shrink-0 print:hidden`}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold truncate" title={courseTitle}>{courseTitle || "Course Content"}</h2>
                <button onClick={onToggleSidebar} className="lg:hidden text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700" aria-label="Close navigation">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-65px)]"> {/* Adjust height based on header */}
                {modules?.map((module, modIndex) => (
                    <div key={module._id || modIndex} className="mb-1">
                        <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{module.title || `Module ${modIndex + 1}`}</h3>
                        <ul className="space-y-px">
                            {module.lessons?.map((lesson) => {
                                const isCompleted = completedLessonSet.has(lesson._id);
                                const isActive = lesson._id === activeLessonId;
                                return (
                                    <li key={lesson._id}>
                                        <button
                                            onClick={() => onSelectLesson(lesson._id)}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-md transition-colors duration-150 ease-in-out text-left
                                                ${isActive ? 'bg-indigo-600 text-white font-medium shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                                            `}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            <FontAwesomeIcon
                                                icon={isCompleted ? faCheckCircle : (lesson.contentType === 'video' ? faVideo : faFileAlt)}
                                                className={`w-4 h-4 flex-shrink-0 
                                                    ${isCompleted && !isActive ? 'text-green-400' : 
                                                      isActive ? 'text-white' : 
                                                      'text-gray-400'}`}
                                            />
                                            <span className={`truncate flex-grow ${isCompleted && !isActive ? 'line-through opacity-70' : ''}`}>{lesson.title || "Untitled Lesson"}</span>
                                        </button>
                                    </li>
                                );
                            })}
                            {(!module.lessons || module.lessons.length === 0) && (
                                <li className="px-3 py-2 text-xs text-gray-500 italic">No lessons in this module.</li>
                            )}
                        </ul>
                    </div>
                ))}
                 {(!modules || modules.length === 0) && (
                    <p className="p-3 text-sm text-gray-400 italic">This course has no modules yet.</p>
                )}
            </nav>
        </div>
    );
};


function StudentCourseViewerPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState(null);
    const [progressData, setProgressData] = useState({ completedLessons: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingProgress, setUpdatingProgress] = useState(new Set());
    const [activeLessonId, setActiveLessonId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true); setError(null); setActiveLessonId(null);
            const token = localStorage.getItem('authToken');
            if (!token) { if (isMounted) { setError("Authentication required to view course."); setLoading(false); } return; }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const [courseResponse, progressResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/ai-courses/${courseId}`, config),
                    axios.get(`${API_BASE_URL}/api/student/course-progress/${courseId}`, config)
                ]);

                if (!isMounted) return;

                if (!courseResponse.data || courseResponse.data.status !== 'published') {
                    setError(courseResponse.data?.message || "Course not found, not published, or you may not be enrolled.");
                    setCourseData(null);
                } else {
                    setCourseData(courseResponse.data);
                    setProgressData(progressResponse.data?.progress || { completedLessons: [] });
                    // Set initial active lesson
                    const firstLessonId = courseResponse.data.modules?.[0]?.lessons?.[0]?._id;
                    if (firstLessonId) {
                        setActiveLessonId(firstLessonId);
                    } else {
                        console.warn("Course has no lessons to set as active.");
                        // Potentially set a flag to show "No lessons in this course" in main content
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error loading course/progress:", err);
                setError(err.response?.data?.message || "An error occurred while loading course data.");
                setCourseData(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (courseId) {
            loadData();
        } else {
            setError("Invalid course identifier.");
            setLoading(false);
        }
        return () => { isMounted = false; };
    }, [courseId]);

    const completedLessonSet = useMemo(() => new Set(progressData.completedLessons || []), [progressData]);

    const activeLesson = useMemo(() => {
        if (!courseData || !activeLessonId) return null;
        for (const module of courseData.modules || []) {
            for (const lesson of module.lessons || []) {
                if (lesson._id === activeLessonId) return lesson;
            }
        }
        return null;
    }, [courseData, activeLessonId]);

    const allLessonsFlat = useMemo(() => {
        if (!courseData?.modules) return [];
        return courseData.modules.flatMap(module => module.lessons || []).filter(lesson => lesson?._id);
    }, [courseData]);

    const handleSelectLesson = (lessonId) => {
        setActiveLessonId(lessonId);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after selection
            setIsSidebarOpen(false);
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navigateToLesson = (direction) => {
        if (!activeLessonId || allLessonsFlat.length === 0) return;
        const currentIndex = allLessonsFlat.findIndex(l => l._id === activeLessonId);
        if (currentIndex === -1) return;

        let targetIndex;
        if (direction === 'next') {
            targetIndex = currentIndex + 1;
            if (targetIndex < allLessonsFlat.length) {
                setActiveLessonId(allLessonsFlat[targetIndex]._id);
            } else {
                toast.info("🎉 You've reached the end of the course!");
            }
        } else if (direction === 'prev') {
            targetIndex = currentIndex - 1;
            if (targetIndex >= 0) {
                setActiveLessonId(allLessonsFlat[targetIndex]._id);
            } else {
                toast.info("You are at the first lesson.");
            }
        }
    };

    const handleMarkLessonComplete = useCallback(async (lessonIdToComplete) => {
        if (!courseId || !lessonIdToComplete || completedLessonSet.has(lessonIdToComplete)) return;
        setUpdatingProgress(prev => new Set(prev).add(lessonIdToComplete));
        const token = localStorage.getItem('authToken');
        if (!token) { toast.error("Authentication required."); setUpdatingProgress(prev => { prev.delete(lessonIdToComplete); return new Set(prev); }); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const payload = { courseId, lessonId: lessonIdToComplete };
        let success = false;

        try {
            const response = await axios.post(`${API_BASE_URL}/api/student/courses/progress`, payload, config);
            if (response.data?.progress) {
                setProgressData(response.data.progress);
                success = true;
            } else { throw new Error("Invalid progress response from server."); }
        } catch (err) {
            console.error("Error marking lesson complete:", err);
            toast.error(err.response?.data?.message || "Failed to update progress.");
        } finally {
            setUpdatingProgress(prev => { const next = new Set(prev); next.delete(lessonIdToComplete); return next; });
            if (success) { // Auto-advance only on success
                navigateToLesson('next');
            }
        }
    }, [courseId, completedLessonSet, navigateToLesson]); // Added navigateToLesson

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" /> <span className="ml-4 text-xl text-gray-700">Loading Course...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
            <div className="m-4 p-6 bg-red-50 text-red-700 border border-red-300 rounded-lg shadow-md text-center max-w-md">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl mb-3" />
                <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h2>
                <p className="text-sm mb-4">{error}</p>
                <Link to="/courses" className="text-indigo-600 hover:text-indigo-800 underline text-sm">Go back to My Courses</Link>
            </div>
        </div>;
    }

    if (!courseData) {
        return <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
            <div className="m-4 p-6 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg shadow-md text-center max-w-md">
                 <FontAwesomeIcon icon={faBookOpen} className="text-3xl mb-3" />
                 <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
                 <p className="text-sm mb-4">The course you are looking for is not available or you might not have access.</p>
                <Link to="/courses" className="text-indigo-600 hover:text-indigo-800 underline text-sm">Go back to My Courses</Link>
            </div>
        </div>;
    }

    const isCurrentLessonCompleted = activeLesson && completedLessonSet.has(activeLesson._id);
    const isCurrentLessonUpdating = activeLesson && updatingProgress.has(activeLesson._id);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100"> {/* Prevent body scroll */}
            <ToastContainer position="top-right" autoClose={3000} theme="colored" newestOnTop />

            <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen && window.innerWidth < 1024 ? 'blur-sm pointer-events-none' : ''} lg:ml-0 print:ml-0 print:p-0`}>
                {activeLesson ? (
                    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{activeLesson.title || "Untitled Lesson"}</h2>
                            {/* Optional: Lesson Type Badge
                            <AccessTypeBadge accessType={activeLesson.contentType} /> */}
                        </div>

                        <div className="prose prose-sm sm:prose-base prose-indigo max-w-none mb-8">
                            {activeLesson.contentType === 'text' && (
                                <div dangerouslySetInnerHTML={{ __html: activeLesson.textContent || '<p class="italic text-gray-500">No text content available for this lesson.</p>' }} />
                            )}
                            {activeLesson.contentType === 'video' && activeLesson.videoUrl && (
                                <div className="aspect-video rounded-lg overflow-hidden shadow-md my-4 clear-both"> {/* Added clear-both for prose issues */}
                                    <ReactPlayer
                                        url={activeLesson.videoUrl}
                                        width="100%"
                                        height="100%"
                                        controls={true}
                                        config={{ youtube: { playerVars: { modestbranding: 1, rel: 0, showinfo: 0 } } }}
                                        onError={(e) => { console.error("Video player error:", e); toast.error("Video could not be loaded."); }}
                                    />
                                </div>
                            )}
                            {activeLesson.contentType === 'video' && !activeLesson.videoUrl && (
                                <p className="italic text-red-500">Video content is missing for this lesson.</p>
                            )}
                            {/* Add more content types here if needed */}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => navigateToLesson('prev')}
                                disabled={allLessonsFlat.findIndex(l => l._id === activeLessonId) === 0}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            > <FontAwesomeIcon icon={faChevronLeft} className="mr-2 h-4 w-4" /> Previous </button>

                            <button
                                onClick={() => handleMarkLessonComplete(activeLesson._id)}
                                disabled={isCurrentLessonCompleted || isCurrentLessonUpdating}
                                className={`w-full sm:w-auto order-first sm:order-none px-5 py-2.5 text-sm font-semibold rounded-md shadow-sm transition duration-150 flex items-center justify-center min-w-[180px]
                                    ${isCurrentLessonCompleted ? 'bg-green-600 text-white cursor-default' :
                                      isCurrentLessonUpdating ? 'bg-yellow-400 text-yellow-800 cursor-wait animate-pulse' :
                                      'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500'
                                    }`}
                            >
                                {isCurrentLessonCompleted ? <><FontAwesomeIcon icon={faCheckCircle} className="mr-2"/> Lesson Complete</> :
                                 isCurrentLessonUpdating ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2"/> Updating...</> :
                                 'Mark as Complete & Next'
                                }
                            </button>

                            <button
                                onClick={() => navigateToLesson('next')}
                                disabled={allLessonsFlat.findIndex(l => l._id === activeLessonId) === allLessonsFlat.length - 1}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            > Next <FontAwesomeIcon icon={faChevronRight} className="ml-2 h-4 w-4" /> </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-gray-500">
                        <FontAwesomeIcon icon={faBookOpen} size="3x" className="mb-4 text-gray-400" />
                        {allLessonsFlat.length > 0 ? (
                            <p>Select a lesson from the sidebar to start learning.</p>
                        ) : (
                            <p>This course doesn't have any lessons yet. Check back later!</p>
                        )}
                    </div>
                )}

                <div className="mt-8 text-center pb-8">
                    <Link to="/courses" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                        ← Back to My Courses
                    </Link>
                </div>
            </main>
            {!isSidebarOpen && (
                 <button
                    onClick={toggleSidebar}
                    className="fixed top-3 left-3 z-40 lg:hidden p-2 bg-gray-700 text-white rounded-md shadow-lg hover:bg-gray-600 transition-colors"
                    aria-label="Open course navigation"
                 > <FontAwesomeIcon icon={faListUl} /> </button>
            )}

            <CourseSidebar
                courseTitle={courseData.title}
                modules={courseData.modules}
                activeLessonId={activeLessonId}
                onSelectLesson={handleSelectLesson}
                completedLessonSet={completedLessonSet}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
            />

            {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden print:hidden"></div>}

        </div>
    );
}

export default StudentCourseViewerPage;