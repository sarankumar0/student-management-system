import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import React from 'react';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";



const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: "onChange" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [role, setRole] = useState("user");
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState(""); // ✅ Plan type
  const [modalOpen, setModalOpen] = useState(false); // ✅ Modal for success
  const [registrationData, setRegistrationData] = useState(null); // ✅ Store Reg Data
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Extract plan type from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedPlan = params.get("plan") || "basic"; 
    setPlan(selectedPlan);
  }, [location]);

  // ✅ Handle Registration
  const onSubmit = async (data) => {
    event.preventDefault();
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-right" });
      return;
    }
  
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const plan = urlParams.get("plan") || null; // Get plan from URL
  
      const requestBody = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: data.role === "user" ? plan : data.role.toLowerCase(), // ✅ Fixed role assignment
        plan,
      };
  
      // Send adminKey only if the role is Admin
      if (data.role === "Admin") {
        requestBody.adminKey = data.adminKey;
      }
  
      const response = await axios.post("http://localhost:5000/api/auth/register", requestBody);
  
      setRegistrationData({
        email: data.email,
        registrationNumber: response.data.registrationNumber,
      });
  
      setModalOpen(true); // Open modal instead of redirecting immediately
  
      toast.success(response.data.message, { position: "top-right" });
  
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed", { position: "top-right" });
    }
  };
  

  const isFormFilled =
    watch("firstName") &&
    watch("lastName") &&
    watch("email") &&
    watch("password") &&
    watch("confirmPassword") &&
    (role !== "Admin" || watch("adminKey")) &&
    agree;

  return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4" style={{
        backgroundImage: `url('../assets/RegiPosterBlured.png')`,  backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-lg"></div>
        <div className=" relative z-10 w-full max-w-4xl flex flex-col bg-white  md:flex-row shadow-lg rounded-2xl overflow-hidden bg-white">
          <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('./assets/RegiPoster.png')" }}>
            <button onClick={() => navigate("/")} className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-md text-sm">Back to website</button>
            <div className="absolute bottom-0 w-full p-3  text-gray-800 text-lg font-semibold bg-white">
              Just One Step Ahead of Sculpting Your Future
            </div>
          </div>
          {/* Right side form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-gray-900 text-2xl font-semibold mb-4">Create an account</h2>
            <p className="text-gray-600 mb-6">Already have an account? <a href="/login" className="text-purple-500">Log in</a></p>
  
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <select {...register("role")} onChange={(e) => setRole(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="User"className="hover:bg-purple-500">Student</option>
                <option value="Admin">Admin</option>
              </select>
              {role === "Admin" && (
                <div className="relative">
                  <input 
                    type={showAdminKey ? "text" : "password"} 
                    {...register("adminKey", { required: "Admin Secret Key is required" })} 
                    placeholder="Admin Secret Key" 
                    className="w-full p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-4 text-gray-600" 
                    onClick={() => setShowAdminKey(!showAdminKey)}
                  >
                    {showAdminKey ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.adminKey && <p className="text-red-500 text-sm">{errors.adminKey.message}</p>}
                </div>
              )}
  
<div className="flex gap-4">
  {/* First Name Field with Icon */}
  <div className="w-1/2 relative">
    <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
    <input
      type="text"
      {...register("firstName", { required: "First name is required" })}
      placeholder="First name"
      className="w-full pl-10 p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
    {errors.firstName && (
      <p className="text-red-500 text-sm">{errors.firstName.message}</p>
    )}
  </div>

  {/* Last Name Field with Icon */}
  <div className="w-1/2 relative">
    <i className="fas fa-user-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
    <input
      type="text"
      {...register("lastName", { required: "Last name is required" })}
      placeholder="Last name"
      className="w-full pl-10 p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
    {errors.lastName && (
      <p className="text-red-500 text-sm">{errors.lastName.message}</p>
    )}
  </div>
</div>

{/* Email Field with Icon */}
<div className="relative mt-4">
  <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
  <input
    type="email"
    {...register("email", {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email format",
      },
    })}
    placeholder="Email"
    className="w-full pl-10 p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
  {errors.email && (
    <p className="text-red-500 text-sm">{errors.email.message}</p>
  )}
</div>

{/* Password Field with Eye Toggle */}
<div className="relative mt-4">
  <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
  <input
    type={showPassword ? "text" : "password"}
    {...register("password", {
      required: "Password is required",
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
      pattern: {
        value: /^(?=.*[A-Z])(?=.*\d).{6,}$/,
        message: "Password must include one uppercase letter and one number",
      },
    })}
    placeholder="Enter your password"
    className="w-full pl-10 p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
  <button
    type="button"
    className="absolute right-3 top-4 text-gray-600"
    onClick={() => setShowPassword(!showPassword)}
  >
    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
  </button>
  {errors.password && (
    <p className="text-red-500 text-sm">{errors.password.message}</p>
  )}
</div>

{/* Confirm Password Field with Eye Toggle */}
<div className="relative mt-4">
  <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
  <input
    type={showConfirmPassword ? "text" : "password"}
    {...register("confirmPassword", {
      required: "Confirm Password is required",
      validate: (value) =>
        value === watch("password") || "Passwords do not match",
    })}
    placeholder="Confirm your password"
    className="w-full pl-10 p-3 bg-gray-100 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
  <button
    type="button"
    className="absolute right-3 top-4 text-gray-600"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    <i
      className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
    ></i>
  </button>
  {errors.confirmPassword && (
    <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
  )}
</div>

  
              <div className="flex items-center gap-2">
                <input type="checkbox" id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="agree" className="text-gray-600 text-sm">I agree to the Terms & Conditions</label>
              </div>
  
              <button type="submit" className={`w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 ${!isFormFilled && "opacity-80 cursor-not-allowed"}`} disabled={!isFormFilled}>
                Create account
              </button>
            </form>
          </div>
        </div>
        {modalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-8 shadow-lg text-center">
    <DotLottieReact
  className="w-36 h-36 mx-auto"
  src="https://lottie.host/5d1e324e-6348-470c-b011-46939f1cd36e/f0lBaZk0cH.lottie"
  loop
  autoplay
/>

<h2 className="text-2xl font-bold text-green-600 mt-4">Registration Successful!</h2>
<p className="text-gray-600 mt-2">You have successfully registered.</p>

<button 
  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
  onClick={() => navigate("/login")}
>
  Go to Login
</button>
    </div>
  </div>
)}

      </div>
    );
};

export default RegisterPage;






