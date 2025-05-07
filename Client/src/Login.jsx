import { useState } from "react";
import { useUser } from "./context/UserContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(regex.test(email) ? "" : "Invalid email format");
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    setPasswordError(regex.test(password) ? "" : "Must be 6+ chars with 1 uppercase & number");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error("Email and password are required!");
      return;
    }
  
    if (emailError || passwordError) {
      toast.error("Please fix validation errors");
      return;
    }
  
    setIsSubmitting(true);
    console.log("Attempting login for email:", email);
  
    try {
      // 1. Login Request
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: email.trim(), password: password.trim() },
        { withCredentials: true }
      );
  
      console.log("✅ Login API Response:", response.data);
  
      // 2. Verify server response structure
      if (!response.data?.token || !response.data?.user) {
        throw new Error("Invalid server response structure");
      }
  
      const { token, user } = response.data;
  
      // 3. Validate token before storing
      if (typeof token !== 'string' || token.length < 20) {
        throw new Error("Invalid authentication token format");
      }
  
      // 4. Store token and update user state
      localStorage.setItem('authToken', token);
      setUser(user);
  
      // 5. Show success and redirect
      toast.success("Login successful!", { autoClose: 3000 });
  
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "http://localhost:5174/admin";
        } else {
          const encodedToken = encodeURIComponent(token);
          window.location.href = `http://localhost:5173/dashboard?token=${encodedToken}`;
        }
      }, 3000);
  
    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed. Please check credentials.";
      
      if (error.response) {
        // Handle axios error response
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        // Handle our custom thrown errors
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid (format-wise)
  const isFormValid = email && 
                     password && 
                     !emailError && 
                     !passwordError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 bg-cover bg-center" 
      style={{ backgroundImage: "url('../assets/image_flipped_blurred.png')" }}>
      
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-4xl bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img 
            src="../assets/LoginPageImage.png" 
            alt="Login" 
            className="w-full h-full object-cover" 
          />
          <button 
            onClick={() => navigate("/")} 
            className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition"
          >
            Back to website
          </button>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 text-sm mt-2">Login to access your account</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  className="w-full pl-10 p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                />
              </div>
              <div className="min-h-[20px]">
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="min-h-[20px]">
                {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 mt-4 rounded-lg text-white transition ${
                !isFormValid || isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/register")} 
              className="text-purple-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;