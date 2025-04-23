import { useState } from "react";
import { useUser } from "./context/UserContext";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
axios.defaults.withCredentials = true;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // const [user, setUser] = useState(null);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be 6+ chars, 1 uppercase & 1 number");
    } else {
      setPasswordError("");
    }
  };
  const handleBacktoWebsite = () => {
    navigate("/");
  };

  // const handleLogin = async () => {
  //   if (emailError || passwordError || !email || !password) {
  //     toast.error("Fix errors before submitting");
  //     return;
  //   }
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/auth/login",
  //       { email: email.trim(), password: password.trim() },
  //       { withCredentials: true }
  //     );
  //     const { token, user } = response.data;
  //     if (!token || !user) {
  //       toast.error("Login failed: Invalid response from server");
  //       return;
  //     }
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     localStorage.setItem("registrationNumber", user.registrationNumber);
  //     toast.success("Login successful!");
  //     setTimeout(() => {
  //       if (user.role === "admin") {
  //         window.location.href = "http://localhost:5174/admin";
  //       } else {
  //         window.location.href = "http://localhost:5173/dashboard";
  //       }
  //     }, 1000);
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Invalid credentials!");
  //   }
  // };



// 🔹 Fetch user details after login
// const handleLogin = async (event) => {
//   event.preventDefault(); // Prevent default form submission

//   if (!email || !password) {
//       toast.error("Email and password are required!");
//       return;
//   }

//   try {
//       const response = await axios.post(
//           "http://localhost:5000/api/auth/login",
//           { email: email.trim(), password: password.trim() },
//           { withCredentials: true } // ✅ Ensures cookies are sent and received
//       );

//       toast.success("Login successful!");

//       // ✅ Fetch user details separately after login
//       fetchUserProfile();
//   } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed!");
//   }
// };

// const handleLogin = async (event) => {
//   event.preventDefault();

//   if (!email || !password) {
//       toast.error("Email and password are required!");
//       return;
//   }

//   try {
//       // ✅ Login Request
//       const response = await axios.post(
//           "http://localhost:5000/api/auth/login",
//           { email: email.trim(), password: password.trim() },
//           { withCredentials: true }
//       );


//       localStorage.setItem('Email', response.data.email);


      

//       // ✅ Fetch user profile after login
//       const profileResponse = await axios.get("http://localhost:5000/api/auth/user-profile", {
//           withCredentials: true,
//       });
//       toast.success("Login successful!");

//       const user = profileResponse.data;
//       setUser(user); 

     
        
      

//       // ✅ Redirect based on role & separate projects
//       if (user.role === "admin") {
//           window.location.href = "http://localhost:5174/admin"; // ✅ Redirect to Admin Project
//       } else {
//           window.location.href = "http://localhost:5173/dashboard"; // ✅ Redirect to Student Project
//       }
//   console.log('handle ')
      
//   } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed!");
//   }
// };


// 🔹 Fetch User Profile After Login
// const fetchUserProfile = async () => {
//   try {
//       const response = await axios.get("http://localhost:5000/api/auth/user-profile", {
//           withCredentials: true, // ✅ Ensures cookies are sent
//       });

//       console.log("👤 User Data Received:", response.data);
//       setUser(response.data); // ✅ Now React will store user details
//   } catch (error) {
//       console.error("❌ Failed to fetch user profile:", error.response?.data?.message || error.message);
//   }
// };


const handleLogin = async (event) => {
  event.preventDefault();

  if (!email || !password) {
      toast.error("Email and password are required!");
      return;
  }

  console.log("Attempting login for email:", email); // Log start

  try {
      // ✅ Login Request
      const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email: email.trim(), password: password.trim() }
      );

      // --- Log the entire successful response ---
      console.log("✅ Login API Response:", response.data);

      // --- Check if login response contains token and user ---
      if (response.data && response.data.token && response.data.user) {
          const { token, user } = response.data;
          setUser(user); 
          toast.success("Login successful!");
          // --- Log before saving token ---
          console.log(`>>> Preparing to save. Token type: ${typeof token}, Token value: ${token}`);
          if (typeof token !== 'string' || token.length < 20) { // Basic sanity check on token
              console.error("🔥 ERROR: Invalid token received before trying to save!");
              toast.error("Received invalid authentication token from server.");
              return; // Stop if token looks wrong
          }

          try {
               // --- Store Token in localStorage ---
               localStorage.setItem('authToken', token);
               console.log("✅ Token save attempted."); // Confirm setItem was called

               // --- IMMEDIATELY Verify if token was saved ---
               const savedToken = localStorage.getItem('authToken');
               if (savedToken === token) {
                   console.log("🎉 SUCCESS: Token read back from localStorage MATCHES:", savedToken);
               } else {
                   console.error("🔥 FAILURE: Token read back from localStorage MISMATCH or NULL:", savedToken);
                   toast.error("Critical Error: Failed to properly store authentication token!");
                   // Decide if you should stop execution here? Maybe not redirect?
               }
          } catch (storageError) {
              console.error("🔥 CRITICAL Error saving token to localStorage:", storageError);
              toast.error("Error saving login session. Please check browser settings.");
              return; // Stop if storage fails
          }


          // --- Store User Object (Using state or context) ---
          // Assuming setUser comes from props, state, or context (e.g., useUser())
          if (typeof setUser === 'function') {
              console.log("👤 Setting user state/context with:", user);
              setUser(user); // Update global/local state
          } else {
               console.warn("setUser function not available - user state might not be updated globally.");
           }

          toast.success("Login successful!");

          // --- Redirect based on role ---
          console.log(`Redirecting based on role: ${user.role}`);
          if (user.role === "admin") {
               // Using window.location.href works but causes a full page reload.
               // If this component uses useNavigate(), prefer that for SPA feel.
               window.location.href = "http://localhost:5174/admin";
          } else {
            const encodedToken = encodeURIComponent(token);
            window.location.href = `http://localhost:5173/dashboard?token=${encodedToken}`;
          }

      } else {
          // Handle case where login response doesn't have expected structure
          console.error("❌ Login response missing token or user data:", response.data);
          toast.error("Login failed: Invalid server response structure.");
      }

  } catch (error) {
      console.error("❌ Login catch block error:", error);
      // Log the detailed error response if available
      if (error.response) {
          console.error("Axios error response:", error.response.data);
      }
      toast.error(error.response?.data?.message || "Login failed!");
  }
};


// const fetchUserProfile = async () => {
//   try {
//       const response = await axios.get("http://localhost:5000/api/auth/user-profile", {
//           withCredentials: true,
//       });

//       console.log("👤 User Data Received:", response.data);
//       setUser(response.data);

//       // 🔹 Redirect based on user role
//       if (response.data.role === "admin") {
//           navigate("/admin");
//       } else {
//           navigate("/dashboard");
//       }

//   } catch (error) {
//       console.error("❌ Failed to fetch user profile:", error.response?.data?.message || error.message);
//   }
// };




  return (
    <div className="flex sm:relative justify-center items-center min-h-screen  bg-gray-100"  style={{
      backgroundImage: `url('../assets/image_flipped_blurred.png')`,  backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
    <div className="flex max-w-4xl w-full bg-white shadow-lg rounded-2xl m-6 overflow-hidden">
      <div className="w-1/2 hidden md:block md:relative ">
        <img
          src="../assets/LoginPageImage.png"
          alt="Login Illustration"
          className="w-full h-full object-cover"
        /><button onClick={handleBacktoWebsite} className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-md text-sm">Back to website</button>
      </div>
{/* Right side form */}
      <div className="w-full  md:w-1/2 p-8">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
        <p className="text-gray-600 text-sm mt-2">Login to access your account</p>

        <form className="mt-6">
        <div>
  {/* Name Field with User Icon */}
  <label className="block text-gray-700 text-sm font-medium">Email</label>
  <div className="relative">
    <i className="fas fa-user absolute left-3 bottom-1/4 transform -translate-y-1/2 text-gray-400"></i>
    <input
      type="email"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        validateEmail(e.target.value);
      }}
      className="w-full pl-10 p-3 mt-1 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder="Enter your email/Register Number"
    />
  </div>
  {emailError && (
    <p className="text-red-500 text-sm mt-1">{emailError}</p>
  )}
</div>

<div className="mt-4">
  {/* Password Field with Icon and Eye Toggle */}
  <label className="block text-gray-700 text-sm font-medium">Password</label>
  <div className="relative">
    <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        validatePassword(e.target.value);
      }}
      className="w-full pl-10 p-3 mt-1 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder="Enter your password"
    />
    <i
      className={`fas ${
        showPassword ? "fa-eye-slash" : "fa-eye"
      } absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer`}
      onClick={() => setShowPassword(!showPassword)}
    ></i>
  </div>
  <div className="min-h-[20px] mt-1">
    {passwordError && (
      <p className="text-red-500 text-sm">{passwordError}</p>
    )}
  </div>
</div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <label className="flex items-center">
              <input type="checkbox" className="text-purple-500" />
              <span className="ml-2">Remember Me</span>
            </label>
            <a href="#" className="text-purple-600 hover:underline">Forgot Password?</a>
          </div>
          <button
  type="submit"
  onClick={handleLogin}
  className={`w-full mt-6 py-3 rounded-lg transition ${
    emailError || passwordError || !email || !password
      ? "bg-purple-400 text-white cursor-not-allowed opacity-50"
      : "bg-purple-600 text-white hover:bg-purple-700"
  }`}
  disabled={emailError || passwordError || !email || !password}
>
  Login
</button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account? <a onClick={()=>navigate("/Register")} className="text-purple-600 cursor-pointer hover:underline">Sign up</a>
        </p>
      </div>
    </div>
    <ToastContainer position="top-right" />
  </div>
);
};


export default Login;


