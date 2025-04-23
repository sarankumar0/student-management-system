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

