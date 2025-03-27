// import axios from "axios";
// import { Navigate, Outlet } from "react-router-dom";
// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// axios.defaults.withCredentials = true; // ✅ Set globally


// const ProtectedRoute = ({ role }) => {
//   const token = Cookies.get("token");
//   const [isAuthorized, setIsAuthorized] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchToken = async () => {
//       await new Promise(resolve => setTimeout(resolve, 500)); // ✅ Delay to ensure cookies are available

//       const token = Cookies.get("token"); 
//       const userCookie = Cookies.get("user"); // ✅ Read token after delay
//       console.log("🔍 Token from Cookies:", token); // ✅ Debugging

//       if (!token || !userCookie) {
//         setIsAuthorized(false);
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get("http://localhost:5000/api/auth/verify", {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         });

//         if (!response.data.user) throw new Error("Invalid response");

//         // ✅ Check if user role matches required role
//         const userRole = response.data.user.role;
//         setIsAuthorized(userRole === role);
//       } catch (error) {
//         console.error("Verification failed:", error.response?.data || error);
//         Cookies.remove("token"); // ✅ Clear expired token
//         Cookies.remove("user");
//         setIsAuthorized(false);
//       } finally {
//         setLoading(false); // ✅ Stop loading
//       }
//     };

//     fetchToken();
//   }, [role]);

//   if (isAuthorized === null) return <div>Loading...</div>;
//   if (!isAuthorized) return <Navigate to="/login" replace />;  // Redirect to login if unauthorized

//   return <Outlet />;
// };

// export default ProtectedRoute;

import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
axios.defaults.withCredentials = true; // ✅ Ensure credentials are always included

const ProtectedRoute = ({ role }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/user-profile", {
          withCredentials: true, // ✅ Ensures cookies are sent
        });

        console.log("🔍 User Data in ProtectedRoute:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== role) return <Navigate to="/login" replace />; // Redirect if unauthorized

  return <Outlet />;
};

export default ProtectedRoute;

