// src/component/Dashboard.jsx (New or Existing File)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faUser, faBookOpen, faClipboardList, faEdit, faCalendarCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Chart from 'react-apexcharts'; // Use ApexCharts

// Reusable Badge Component (if not imported globally)
const AccessTypeBadge = ({ accessType }) => (
     <span className={`inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize font-medium leading-none ml-2 ${ accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' : accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' : accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' : 'bg-gray-500' }`}>
        {accessType || 'N/A'}
    </span>
);

// Format Date helper
const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try { return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
     catch (e) { return 'Invalid Date'; }
 };


function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- State for Charts ---
    const [progressOptions, setProgressOptions] = useState({
        chart: { type: 'radialBar', height: 200 },
        plotOptions: {
             radialBar: {
                 hollow: { size: '60%' },
                 dataLabels: {
                     name: { show: true, fontSize: '14px', offsetY: -5, color: '#6b7280'}, // Gray color for label
                     value: { show: true, fontSize: '20px', fontWeight: 'bold', offsetY: 5, formatter: function (val) { return val + "%" } }
                  }
             }
         },
        labels: ['Overall Progress'],
        colors: ['#4f46e5'] // Indigo color for progress
     });
    const [progressSeries, setProgressSeries] = useState([0]);


    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');
            if (!token) { setError("Authentication required."); setLoading(false); return; }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                // Fetch the consolidated dashboard data
                const response = await axios.get('http://localhost:5000/api/student/dashboard', config);
                console.log("Student Dashboard Data Received:", response.data);
                setDashboardData(response.data);

                // --- Update Progress Chart State ---
                 if (response.data && response.data.progress) {
                     const { completedLessonsTotal = 0, totalEnrolledLessons = 0 } = response.data.progress;
                     const percentage = (totalEnrolledLessons > 0)
                         ? Math.round((completedLessonsTotal / totalEnrolledLessons) * 100)
                         : 0;
                     console.log(`Calculated Progress: ${completedLessonsTotal}/${totalEnrolledLessons} = ${percentage}%`);
                     setProgressSeries([percentage]); // Update radial bar series
                 } else {
                     setProgressSeries([0]); // Default to 0 if no progress data
                 }

            } catch (err) {
                console.error("Error fetching student dashboard data:", err);
                setError(err.response?.data?.message || "Failed to load dashboard data.");
                setDashboardData(null);
                 setProgressSeries([0]); // Reset chart on error
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Fetch once on mount

    // Helper to render upcoming items
    const renderUpcomingItem = (item, type) => {
         const linkPath = type === 'assignment' ? `/courses/assignments` : `/exams/timetable`; // Link to list pages for now
         const dueDate = item.dueDate || item.date; // Use correct date field
         const title = item.title;
         return (
             <Link to={linkPath} key={item._id} className="block p-2 hover:bg-gray-100 rounded text-sm">
                 <div className='flex justify-between items-center'>
                     <span className='text-gray-700 truncate mr-2'>{title}</span>
                     {dueDate && <span className='text-xs text-red-600 flex-shrink-0'><FontAwesomeIcon icon={faCalendarCheck} className='mr-1'/> Due: {formatDate(dueDate)}</span>}
                 </div>
             </Link>
         );
     };

     // Helper to render recent courses
     const renderRecentCourse = (course) => (
         <Link to={`/student/course/${course._id}`} key={course._id} className="block bg-white p-3 rounded shadow hover:shadow-md transition-shadow text-sm">
              <img
                  src={`http://localhost:5000${course.thumbnailUrl || '/uploads/course_thumbnails/default_course.png'}`}
                  alt="" // Alt text should be descriptive if possible
                  className="w-full h-20 object-cover rounded mb-2"
                  onError={(e) => { e.target.onerror = null; e.target.src='http://localhost:5000/uploads/course_thumbnails/default_course.png'; }}
              />
              <span className="font-medium text-gray-800 hover:text-indigo-600 line-clamp-2">{course.title}</span>
         </Link>
      );

    // --- Render Logic ---
    if (loading) {
        return <div className="flex justify-center items-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" /> Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> Error: {error}</div>;
    }

    if (!dashboardData) {
         return <div className="m-4 p-4 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded">Could not load dashboard information.</div>;
    }

    // --- Main Dashboard Display ---
    return (
        <div className="p-4 md:p-6 space-y-8">
            {/* Welcome Banner */}
            <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {dashboardData.welcomeName}!</h1>
                    <p className="text-indigo-100">Ready to continue your learning journey?</p>
                </div>
                <div className="text-right">
                     <span className='text-sm opacity-90'>Current Plan</span><br/>
                     <span className='font-semibold text-lg capitalize'>{dashboardData.plan}</span>
                 </div>
            </div>

            {/* Grid for Stats & Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Progress Chart */}
                <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center h-48">
                     <h3 className="text-md font-semibold text-gray-600 mb-2">Overall Course Progress</h3>
                     <Chart options={progressOptions} series={progressSeries} type="radialBar" height="160" />
                </div>

                {/* Quiz Stats */}
                <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-center h-48">
                     <h3 className="text-md font-semibold text-gray-600 mb-3">Quiz Status</h3>
                     <div className='text-center'>
                         <p className='text-3xl font-bold text-indigo-600'>{dashboardData.counts?.quizzesAvailable ?? 'N/A'}</p>
                         <p className='text-sm text-gray-500 mb-2'>Available</p>
                         <p className='text-sm text-gray-500'>
                            Completed: <span className='font-medium'>{dashboardData.counts?.completedQuizzes ?? 'N/A'}</span>
                         </p>
                         <Link to="/exams/TakeQuiz" className="mt-3 inline-block text-xs text-indigo-600 hover:underline">View Quizzes →</Link>
                     </div>
                </div>

                {/* Assignment Stats */}
                <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-center h-48">
                     <h3 className="text-md font-semibold text-gray-600 mb-3">Assignments</h3>
                      <div className='text-center'>
                         <p className='text-3xl font-bold text-indigo-600'>{dashboardData.counts?.assignmentsDueTotal ?? 'N/A'}</p>
                         <p className='text-sm text-gray-500 mb-2'>Total Assigned</p>
                         <p className='text-sm text-gray-500'>
                            Due Soon: <span className='font-medium'>{dashboardData.upcoming?.assignments?.length ?? '0'}</span>
                         </p>
                         <Link to="/courses/assignments" className="mt-3 inline-block text-xs text-indigo-600 hover:underline">View Assignments →</Link>
                     </div>
                </div>
            </div>

            {/* Grid for Upcoming & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Upcoming Deadlines & Schedule */}
                 <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Upcoming Schedule</h3>
                      {(dashboardData.upcoming?.assignments?.length > 0 || dashboardData.upcoming?.timetable?.length > 0) ? (
                         <ul className="space-y-1">
                             {dashboardData.upcoming?.assignments?.map(item => renderUpcomingItem(item, 'assignment'))}
                             {dashboardData.upcoming?.timetable?.map(item => renderUpcomingItem(item, 'timetable'))}
                         </ul>
                       ) : (
                          <p className="text-sm text-gray-500 italic">No upcoming deadlines or scheduled events found.</p>
                       )}
                  </div>

                  {/* Recent/Continue Courses */}
                  <div className="bg-white p-4 rounded-lg shadow">
                       <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Recently Added Courses</h3>
                       {dashboardData.recent?.aiCourses?.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                              {dashboardData.recent.aiCourses.map(course => renderRecentCourse(course))}
                           </div>
                        ) : (
                           <p className="text-sm text-gray-500 italic">No new courses recently added.</p>
                        )}
                  </div>
            </div>

             {/* Optional: Recent Events/Internships - Conditionally Render */}
             {(dashboardData.recent?.events?.length > 0 || dashboardData.recent?.internships?.length > 0) && (
                  <div className="bg-white p-4 rounded-lg shadow">
                       <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Opportunities & Events</h3>
                       {/* TODO: Render Events and Internships here */}
                       <p className="text-sm text-gray-500 italic">Display recent events/internships here...</p>
                  </div>
              )}

        </div>
    );
}

export default Dashboard;