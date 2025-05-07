// src/App.jsx (Student App on :5173)

import React, { useEffect, useContext } from 'react'; // Import useEffect, useContext
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom"; // Import hooks
import { UserProvider, useUser } from "./context/UserContext"; // Assuming UserContext exists here
import Dashboard from "./component/Dashboard";
import Layout from "./component/Layout";
import UserStudentForm from "./component/studentForm";
import ProfilePage from "./component/profile";
import StudentEnrollmentForm from "./component/studentForm";
import MyCourses from "./component/MyCourse";
import QuizTakingPage from './component/QuizTakingPage';
import { Navigate } from 'react-router-dom';
import QuizList from './component/QuizList';
import StudentResultsPage from './component/StudentsResultpage';
import StudentAssignmentsPage from './component/StudentAssignmentPage';
import StudentCourseListPage from './component/courses/StudentCourseListPage';
import StudentCourseViewerPage from './component/courses/StudentCourseViewerPage';
// --- Component to handle token grabbing ---
const TokenHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyAuthOnLoad } = useUser(); // Get the verify function from context

    // const navigate=useNavigate();
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get('token');

        if (tokenFromUrl) {
            console.log("TokenHandler: Token found in URL:", tokenFromUrl);
            // Store the token immediately
            localStorage.setItem('authToken', tokenFromUrl);

            // Clean the URL - remove the token parameter without reloading
            // Replace the current history entry with the same path but no search params
            navigate(location.pathname, { replace: true, state: location.state });

            // --- Trigger re-verification in context ---
            // Now that token is in localStorage, tell context to verify it
            // This assumes verifyAuthOnLoad checks localStorage again
            if(verifyAuthOnLoad) {
                console.log("TokenHandler: Triggering context verification...");
                verifyAuthOnLoad();
            }

        }
    }, [location, navigate, verifyAuthOnLoad]); // Run when location or navigate changes

    return null; // This component doesn't render anything itself
};


const App = () => {
  return (
    <UserProvider>
      <Router>
          {/* --- Render TokenHandler inside Router to access hooks --- */}
          <TokenHandler />
          {/* --- Routes --- */}
          <Routes>
            <Route element={<Layout />}>
               {/* ProtectedRoute will now find the token set by TokenHandler */}
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/profile" element={<ProfilePage />} />
               <Route path="/studentForm" element={<StudentEnrollmentForm/>} />
               <Route path="/courses/materials" element={<MyCourses/>}/>
               <Route path="/student/quiz/:quizId" element={<QuizTakingPage />} />
               <Route path="/exams/Takequiz" element={<QuizList/>}/>
               <Route path="/exams/results" element={<StudentResultsPage />} />
               {/* Add default route if needed, maybe redirect to dashboard */}
               <Route path="/" element={<Navigate to="/dashboard" replace />} />
               <Route path="/courses/assignments" element={<StudentAssignmentsPage />} />
               <Route path="/student/course/:courseId" element={<StudentCourseViewerPage />}/>
               <Route path="/courses" element={<StudentCourseListPage />} />
            </Route>
            {/* Add a potential login route for this origin if needed */}
            {/* <Route path="/login" element={<StudentLoginPage />} /> */}
             {/* Add 404 */}
             <Route path="*" element={<div>Student App - Not Found</div>} />
          </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;

// --- Also update UserContext.jsx (:5173) ---
// Ensure the verifyAuthOnLoad function exists and checks localStorage


// src/App.jsx (Student Frontend - localhost:5173)
// Assuming this is the main routing file for the student-facing application

// import React, { useEffect, useContext } from 'react';
// import {
//     BrowserRouter as Router,
//     Routes,
//     Route,
//     Navigate,
//     useLocation,
//     useNavigate
// } from "react-router-dom";

// // --- Context ---
// import { UserProvider, useUser } from "./context/UserContext"; // Verify path

// // --- Layout Components ---
// import Layout from "./component/Layout"; // Verify path

// // --- Page/View Components ---
// import Dashboard from "./component/Dashboard";
// import ProfilePage from "./component/profile";
// import StudentEnrollmentForm from "./component/studentForm";
// import MyCourses from "./component/MyCourse"; // Displays OLD course materials (PDF/Video)
// import QuizList from './component/QuizList';
// import QuizTakingPage from './component/QuizTakingPage';
// import StudentAssignmentsPage from "./component/StudentAssignmentsPage";
// import StudentResultsPage from "./component/StudentResultsPage"; // Quiz results history

// // --- NEW/UPDATED Course Components ---
// import StudentCourseListPage from "./component/StudentCourseListPage"; // New list for AI Courses
// import StudentCourseViewerPage from "./component/StudentCourseViewerPage"; // New viewer for AI Courses

// // Placeholders for other pages
// const ForumPage = () => <div className="p-6">Forum Page Placeholder</div>;
// const GroupsPage = () => <div className="p-6">Groups Page Placeholder</div>;
// const SubjectsPage = () => <div className="p-6">Subjects Page Placeholder</div>;
// const ExamTimetablePage = () => <div className="p-6">Exam Timetable Placeholder</div>;
// const LibraryPage = () => <div className="p-6">Library Page Placeholder</div>;
// const EventsPage = () => <div className="p-6">Events Page Placeholder</div>;
// const InternshipsPage = () => <div className="p-6">Internships Page Placeholder</div>;
// const SettingsPage = () => <div className="p-6">Settings Page Placeholder</div>;

// // --- Token Handler Component (Keep as is) ---
// const TokenHandler = () => { /* ... */ };


// // --- Main App Component ---
// const App = () => {
//   return (
//     <UserProvider>
//       <Router>
//           <TokenHandler />
//           <Routes>
//             {/* Routes within the main Layout */}
//             <Route element={<Layout />}>
//                <Route path="/dashboard" element={<Dashboard />} />
//                <Route path="/profile" element={<ProfilePage />} />
//                {/* <Route path="/studentForm" element={<StudentEnrollmentForm/>} /> */} {/* Maybe remove if profile handles edit */}

//                {/* --- Course Related Routes --- */}
//                {/* Option 1: Replace old '/courses/materials' with new AI Course List */}
//                {/* <Route path="/courses/materials" element={<StudentCourseListPage />} /> */}

//                {/* Option 2: Keep old materials route and add a new one for AI Courses */}
//                <Route path="/courses/materials" element={<MyCourses />} /> {/* Keep for old PDFs/Videos */}
//                <Route path="/courses/ai-courses" element={<StudentCourseListPage />} /> {/* Add route for NEW AI Course List */}
//                <Route path="/student/course/:courseId" element={<StudentCourseViewerPage />} /> {/* Route to VIEW a specific AI course */}

//                {/* Other Course Sub-routes */}
//                <Route path="/courses/assignments" element={<StudentAssignmentsPage />} />
//                <Route path="/courses/subjects" element={<SubjectsPage />} />

//                {/* --- Exam/Quiz Related Routes --- */}
//                <Route path="/exams/TakeQuiz" element={<QuizList />} />
//                <Route path="/exams/results" element={<StudentResultsPage />} />
//                <Route path="/exams/timetable" element={<ExamTimetablePage />} />
//                <Route path="/student/quiz/:quizId" element={<QuizTakingPage />} />

//                {/* --- Other Sidebar Links --- */}
//                <Route path="/forum" element={<ForumPage />} />
//                <Route path="/groups" element={<GroupsPage />} />
//                <Route path="/others/library" element={<LibraryPage />} />
//                <Route path="/others/events" element={<EventsPage />} />
//                <Route path="/others/internships" element={<InternshipsPage />} />
//                <Route path="/settings" element={<SettingsPage />} />

//                {/* Default route */}
//                <Route path="/" element={<Navigate to="/dashboard" replace />} />

//                {/* Catch-all within Layout */}
//                <Route path="*" element={<div className='p-10 text-center'>Student App - Page Not Found</div>} />
//             </Route>

//             {/* Catch-all outside Layout (Optional) */}
//             {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}

//           </Routes>
//       </Router>
//     </UserProvider>
//   );
// };

// export default App;