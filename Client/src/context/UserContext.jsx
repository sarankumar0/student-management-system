import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ Create UserContext
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch user profile on app load
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/user-profile", {
                    withCredentials: true, // ✅ Ensures cookies are sent
                });
                setUser(response.data);
            } catch (error) {
                console.error("❌ Failed to fetch user profile:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

// ✅ Custom Hook for easy access
export const useUser = () => useContext(UserContext);
