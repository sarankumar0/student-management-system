import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; 
import Register from './Register';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import AdminPage from './Adminpage';
import StudentLogin from './Studentlogin';
import Guest from './components/Guest/Guest';
import StudentTable from './components/StudentTable';
import Layout from './components/Layout';
import StudentForm from './components/StudentForm';
import About from './components/Guest/About';
import Pricing from './components/Guest/Pricing';
import Contact from './components/Guest/Contact';
import StudentForm2 from './components/StudentForm2';
import Batches from './Batches';
import Courses from './Courses';
import TestHome from './components/TestHome';
import AddEditTest from './components/AddEditTest';
import Reports from './Reports';
import Payment from './Payment';
import AdminQuizList from './AdminQuizList';
import AdminQuizResults from './components/AdminQuizResults';
import { Navigate } from 'react-router-dom';
import SelectQuizForResults from './SelectQuizForResults';
import AdminPostsLayout from './components/Posts/AdminPostsLayout';
import ManageAssignments from './components/Posts/ManageAssignment';
import ManageSubjects from './components/Posts/ManageSubjects';
import ManageTimetable from './components/Posts/ManageTimetable';
import { ToastContainer } from 'react-toastify';
import ChatBotWidget from './components/chatbot/ChatBotWidget';
import 'react-toastify/dist/ReactToastify.css';
import AssignmentSubmissionsReviewPage from './components/Posts/AssignmentSubmissionsReviewPage';
import AICourseOutlineGenerator from './components/AI/AICourseOutlineGenerator';
import AIToolsLayout from './components/AI/AIToolsLayout';
import ManageAICourses from './components/AI/ManageAICourses';
const GeneralSettingsPage = () => (
  <div className="p-6">General Settings Placeholder</div>
);

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="border border-gray-200 font-medium rounded-md shadow-sm"
        progressClassName="bg-indigo-600"
      />
      <UserProvider>
        {' '}
        {/* ✅ Wrap everything inside UserProvider */}
        <Router>
          <ChatBotWidget />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Guest />} />
            <Route path="/home" element={<Guest />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* ✅ Wrap Admin Routes Inside ProtectedRoute & Layout */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<Layout />}>
                <Route index element={<AdminPage />} />
                <Route path="StudentsTable" element={<StudentTable />} />
                <Route
                  path="studentsTable/studentForm"
                  element={<StudentForm />}
                />
                <Route path="studentform2" element={<StudentForm2 />} />
                <Route path="/admin/batches" element={<Batches />} />
                <Route path="/admin/courses" element={<Courses />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/payments" element={<Payment />} />
                <Route path="test" element={<TestHome />}>
                  <Route index element={<Navigate to="list" replace />} />
                  <Route path="list/Add-Test" element={<AddEditTest />} />
                  <Route path="edit/:quizId" element={<AddEditTest />} />
                  <Route path="list" element={<AdminQuizList />} />
                  <Route
                    path="results/:quizId"
                    element={<AdminQuizResults />}
                  />
                  <Route path="results" element={<SelectQuizForResults />} />
                  {/* Optionally add a route specifically for the list */}
                  {/* <Route path="list" element={<AdminQuizList />} /> */}
                </Route>
                  <Route path="posts" element={<AdminPostsLayout />}>
                    <Route
                      path="settings/general"
                      element={<GeneralSettingsPage />}
                    />
                    <Route
                      path="settings/ai-generator"
                      element={<AICourseOutlineGenerator />}
                    />
                    {/* Default view for /admin/posts is assignments */}
                    <Route
                      index
                      element={<Navigate to="assignments" replace />}
                    />
                    {/* Assignments Tab Content */}
                    <Route path="assignments" element={<ManageAssignments />} />
                    {/* Future Tabs */}
                    <Route path="subjects" element={<ManageSubjects />} />
                    <Route path="timetable" element={<ManageTimetable />} />
                    {/* Maybe */}
                  </Route>
                  <Route path="ai-tools" element={<AIToolsLayout />}>
                  <Route index element={<Navigate to="course-generator" replace />} />
                  <Route path="course-generator" element={<AICourseOutlineGenerator />} />
                  <Route path="manage-courses" element={<ManageAICourses />} />
                  {/* <Route path="assignment-generator" element={<AIAssignmentGenerator />} /> */}
                  {/* <Route path="quiz-generator" element={<AIQuizGenerator />} /> */}
              </Route>
              </Route>
              <Route
                path="assignments/:assignmentId/submissions"
                element={<AssignmentSubmissionsReviewPage />}
              />
            </Route>

      
          </Routes>
        </Router>
      </UserProvider>
    </>
  );
};

export default App;
