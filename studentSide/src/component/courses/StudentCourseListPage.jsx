// src/component/StudentCourseListPage.jsx (New File)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faBookOpen, faLayerGroup, faCalendarAlt, faAngleRight } from '@fortawesome/free-solid-svg-icons';

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

// Format Date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) { return 'Invalid Date'; }
};


function StudentCourseListPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
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
                // Use the correct student endpoint
                const response = await axios.get('http://localhost:5000/api/student/ai-courses', config);
                console.log("Student AI courses received:", response.data);
                setCourses(response.data.courses || []); // Expect { courses: [...] }
            } catch (err) {
                console.error("Error fetching student AI courses:", err);
                setError(err.response?.data?.message || "Failed to load courses.");
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []); // Fetch once on mount

    // Navigate to the course viewer page
    const viewCourse = (courseId) => {
        navigate(`/student/course/${courseId}`); // Define this route later
    };


    if (loading) {
        return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /> Loading Courses...</div>;
    }

    if (error) {
        return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                <FontAwesomeIcon icon={faBookOpen} className='mr-3 text-indigo-600'/> My Courses
            </h1>

            {courses.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                    <p className="text-gray-500 italic">No courses are currently available for your plan.</p>
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {courses.map((course) => (
                         <div key={course._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col overflow-hidden cursor-pointer" onClick={() => viewCourse(course._id)} >
                             {/* Thumbnail */}
                             <img
                                 src={`http://localhost:5000${course.thumbnailUrl || '/uploads/course_thumbnails/default_course.png'}`}
                                 alt={`${course.title} thumbnail`}
                                 className="w-full h-40 object-cover" // Fixed height, object cover
                                 onError={(e) => { e.target.onerror = null; e.target.src='http://localhost:5000/uploads/course_thumbnails/default_course.png'; }} // Fallback
                              />
                              {/* Course Info */}
                              <div className="p-4 flex flex-col flex-grow">
                                   <div className="flex justify-between items-start mb-1">
                                       <h2 className="text-md font-semibold text-gray-800 mb-1 leading-tight flex-1 mr-2">{course.title}</h2>
                                       <AccessTypeBadge accessType={course.accessType} />
                                   </div>
                                   <p className="text-xs text-gray-600 mb-3 flex-grow">
                                      {course.description ? course.description.substring(0, 80) + (course.description.length > 80 ? '...' : '') : 'No description available.'}
                                   </p>
                                   {/*Status Bar */}
                                   <div className="w-full mb-3">
                                       {/* Ensure percentage is between 0 and 100 */}
                                       {course.completionPercentage !== undefined && (
                                           <>
                                               <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                   <span>Progress</span>
                                                   <span>{course.completionPercentage}%</span>
                                               </div>
                                               <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                   <div
                                                       className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                                                       style={{ width: `${Math.max(0, Math.min(100, course.completionPercentage))}%` }} // Use inline style for dynamic width
                                                   ></div>
                                                </div>
                                           </>
                                       )}
                                   </div>

                                   {/* Footer Info */}
                                   <div className="text-xs text-gray-500 border-t pt-2 mt-auto flex justify-between items-center">
                                       <span className='flex items-center'><FontAwesomeIcon icon={faLayerGroup} className='mr-1.5'/> {course.moduleCount || 0} Modules</span>
                                       <span className='flex items-center'><FontAwesomeIcon icon={faCalendarAlt} className='mr-1.5'/> Added: {formatDate(course.createdAt)}</span>
                                   </div>
                               </div>
                               {/* Optional: Add a 'View Course' button explicitly */}
                               {/* <div className="p-3 bg-gray-50 text-right">
                                  <button onClick={() => viewCourse(course._id)} className="text-sm text-indigo-600 hover:underline">View Course <FontAwesomeIcon icon={faAngleRight}/></button>
                               </div> */}
                         </div>
                     ))}
                 </div>
            )}
        </div>
    );
}

export default StudentCourseListPage;