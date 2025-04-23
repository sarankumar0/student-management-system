// ProtectedRoute.jsx (Corrected for Option 1 - useUser hook)

import axios from "axios";
// --- Correct Imports for Option 1 ---
import { Navigate, Outlet, useLocation } from "react-router-dom"; // Keep useLocation
import { useEffect, useState, useContext } from "react"; // Keep useContext (it's used internally by useUser)
import { useUser } from "./context/UserContext"; // <--- IMPORT useUser hook

// Remove global default if not needed everywhere:
// axios.defaults.withCredentials = true;

const ProtectedRoute = ({ role }) => {
  // --- Get user and setUser from the custom hook ---
  const { user, setUser } = useUser(); // Correctly call the hook

  // --- Local state for this component's specific loading/auth status ---
  const [loading, setLoading] = useState(true); // Loading state for THIS verification check
  const [isAuthorized, setIsAuthorized] = useState(false); // Local auth status
  const location = useLocation(); // For redirect state

  useEffect(() => {
    const verifyUserAuthentication = async () => {
      // No need to set loading true here, it starts true and is set false in finally block
      // setLoading(true);

      // If user is already in context from UserProvider's initial load, check role
      if (user) {
        console.log("ProtectedRoute: User found in context. Checking role.");
        if (user.role === role) {
          setIsAuthorized(true); // Role matches
        } else {
          console.log(`ProtectedRoute: Role mismatch (context). Expected ${role}, got ${user.role}.`);
          setIsAuthorized(false); // Role doesn't match
        }
        setLoading(false); // Finished check
        return; // Don't need to fetch via API
      }

      // If no user in context, token might still be valid (e.g., page refresh)
      // Try to verify token via API.
      console.log("ProtectedRoute: No user in context. Verifying token via API.");
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.log("ProtectedRoute: No token found. Unauthorized.");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Call /api/auth/verify
        const response = await axios.get("http://localhost:5000/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("🔍 Verify API Data in ProtectedRoute:", response.data);
        if (response.data.success && response.data.user) {
          const fetchedUser = response.data.user;
          // --- IMPORTANT: Set the user in global context ---
          setUser(fetchedUser);

          // Check role authorization
          if (fetchedUser.role === role) {
            console.log("ProtectedRoute: Verification and role check successful.");
            setIsAuthorized(true);
          } else {
            console.log(`ProtectedRoute: Role mismatch (API). Expected ${role}, got ${fetchedUser.role}.`);
            setIsAuthorized(false);
          }
        } else {
          console.log("ProtectedRoute: Verification failed (API response).");
          setIsAuthorized(false);
          // Consider removing bad token
           localStorage.removeItem('authToken');
           setUser(null); // Ensure context user is null if verify fails
        }
      } catch (error) {
        console.error("❌ Failed to verify token:", error.response?.data?.message || error.message);
        setIsAuthorized(false);
        // Consider removing bad token
        localStorage.removeItem('authToken');
        setUser(null); // Ensure context user is null on error
      } finally {
        // --- Ensure loading is always set to false ---
        setLoading(false);
      }
    };

    // Run verification logic
    verifyUserAuthentication();

  // Dependencies: Re-run if the role prop changes, or if the user object in context changes
  // Adding setUser might cause infinite loops if not careful, usually not needed here
  }, [role, user, setUser]); // Dependencies updated

  // --- Render Logic ---
  if (loading) {
       // While checking, show loading state
       return <div className="flex justify-center items-center h-screen">Loading Authentication...</div>;
   }

  if (!isAuthorized) {
      // If check is done and user is not authorized (either no user or wrong role)
      console.log(`ProtectedRoute: Unauthorized for role '${role}'. Redirecting to login.`);
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If loading is done and user is authorized
  console.log(`ProtectedRoute: Authorized for role '${role}'. Rendering Outlet.`);
  return <Outlet />; // Render the protected component/route
};

export default ProtectedRoute;