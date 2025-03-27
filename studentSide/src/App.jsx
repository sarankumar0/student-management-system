import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext"; // ✅ Import User Context
import Dashboard from "./component/Dashboard";
import Layout from "./component/Layout";
import UserStudentForm from "./component/studentForm";
import ProfilePage from "./component/profile";
import StudentEnrollmentForm from "./component/studentForm";

const App = () => {
  return (
    <UserProvider> {/* ✅ Wrap everything inside UserProvider */}
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/studentForm" element={<StudentEnrollmentForm/>} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
