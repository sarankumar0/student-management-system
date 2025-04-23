// import { createContext, useContext, useState, useEffect, useCallback } from "react";
// import axios from "axios";

// const UserContext = createContext();
// export { UserContext };

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const verifyAuthOnLoad = useCallback(async () => {
//         // This function will now be called manually by TokenHandler
//         // after potentially setting the token from the URL
//         setLoading(true);
//         const token = localStorage.getItem('authToken'); // Checks localStorage
//         console.log("UserProvider (verifyAuthOnLoad): Checking token:", token);

//         if (token) {
//             try {
//                 const response = await axios.get("http://localhost:5000/api/auth/verify", {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 console.log("UserProvider: Verify response:", response.data);
//                 if (response.data.success && response.data.user) {
//                     setUser(response.data.user);
//                 } else {
//                     setUser(null); localStorage.removeItem('authToken');
//                 }
//             } catch (error) {
//                 console.error("UserProvider: ❌ Failed to verify token:", error.response?.data?.message || error.message);
//                 setUser(null); localStorage.removeItem('authToken');
//             }
//         } else {
//             console.log("UserProvider: No token found.");
//             setUser(null);
//         }
//         setLoading(false);
//     }, []); // No dependencies, relies on manual trigger or initial mount

//     // Remove the automatic useEffect call on mount, rely on TokenHandler
//     // useEffect(() => {
//     //     verifyAuthOnLoad();
//     // }, [verifyAuthOnLoad]);

//      // Expose verifyAuthOnLoad via context so TokenHandler can call it
//      const loginUser = (userData, token) => { /* ... */ };
//      const logoutUser = () => { /* ... */ };

//     return (
//         <UserContext.Provider value={{ user, setUser: loginUser, logout: logoutUser, loading, verifyAuthOnLoad }}>
//             {children}
//         </UserContext.Provider>
//     );
// };

// export const useUser = () => useContext(UserContext);

import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const UserContext = createContext();
export { UserContext };

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const verifyAuthOnLoad = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        console.log("UserProvider (verifyAuthOnLoad): Checking token:", token);

        if (token) {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/verify", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("✅ Verified:", response.data);

                if (response.data.success && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error("❌ Token verification failed:", error.response?.data?.message || error.message);
                setUser(null);
                localStorage.removeItem('authToken');
            }
        } else {
            console.log("⚠️ No token in localStorage");
            setUser(null);
        }

        setLoading(false);
    }, []);

    const loginUser = (userData, token) => {
        localStorage.setItem("authToken", token);
        setUser(userData);
    };

    const logoutUser = () => {
        localStorage.removeItem("authToken");
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser: loginUser, logout: logoutUser, loading, verifyAuthOnLoad }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
