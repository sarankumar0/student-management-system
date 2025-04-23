import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ Create UserContext
const UserContext = createContext();
export { UserContext };
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch user profile on app load
    useEffect(() => {
        const verifyAuthOnLoad = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken'); // Get token from storage
            console.log("UserProvider: Checking token on load:", token);

            if (token) {
                try {
                     // --- CALL /api/auth/verify ---
                    const response = await axios.get("http://localhost:5000/api/auth/verify", {
                        headers: { Authorization: `Bearer ${token}` } // Send token
                    });
                    console.log("UserProvider: Verify response:", response.data);

                    if (response.data.success && response.data.user) {
                        setUser(response.data.user); // Set user from verify response
                    } else {
                         // Handle case where API says token is bad
                         setUser(null);
                         localStorage.removeItem('authToken'); // Remove bad token
                    }
                } catch (error) {
                    console.error("UserProvider: ❌ Failed to verify token on load:", error.response?.data?.message || error.message);
                    setUser(null); // Clear user on error
                    localStorage.removeItem('authToken'); // Remove bad token
                }
            } else {
                 console.log("UserProvider: No token found on load.");
                 // No token means no user is logged in
                 setUser(null);
            }
            setLoading(false); // Done checking
        };
        verifyAuthOnLoad();
    }, []); // Empty array means run once on mount
    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

// ✅ Custom Hook for easy access
export const useUser = () => useContext(UserContext);
