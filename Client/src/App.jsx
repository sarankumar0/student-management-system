import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext"; // ✅ Import Context API
import Register from "./Register";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import AdminPage from "./Adminpage";
import StudentLogin from "./Studentlogin";
import Guest from "./components/Guest/Guest";
import StudentTable from "./components/StudentTable";
import Layout from "./components/Layout"; 
import StudentForm from "./components/StudentForm";
import About from "./components/Guest/About";
import Pricing from "./components/Guest/Pricing";
import Contact from "./components/Guest/Contact";
import StudentForm2 from "./components/StudentForm2";
import Batches from "./Batches";
import Courses from "./Courses";

const App = () => {
  return (
    <UserProvider> {/* ✅ Wrap everything inside UserProvider */}
      <Router>
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
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/students" element={<StudentTable />} />
              <Route path="/admin/studentform" element={<StudentForm />} />
              <Route path="/admin/studentform2" element={<StudentForm2 />} />
              <Route path="/admin/batches" element={<Batches />} />
              <Route path="/admin/courses" element={<Courses />} />
            </Route>
          </Route>

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute role="user" />}>
            <Route path="/dashboard" element={<StudentLogin />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
