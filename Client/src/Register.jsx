import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaUserAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: "onChange" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [role, setRole] = useState("user");
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedPlan = params.get("plan") || "basic"; 
    setPlan(selectedPlan);
  }, [location]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match!");
      }

      const urlParams = new URLSearchParams(window.location.search);
      const plan = urlParams.get("plan") || "Ba";

      const requestBody = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: data.role.toLowerCase(),
        plan: data.role === "Admin" ? null : plan
      };
      if (data.role === "Admin") {
        requestBody.adminKey = data.adminKey;
      }
      const response = await axios.post("http://localhost:5000/api/auth/register", requestBody);
      
      if (response.data.success) {
        setRegistrationData({
          email: data.email,
          registrationNumber: response.data.userId,
        });
        setModalOpen(true);
        toast.success("Registration successful!", { position: "top-right", className: "bg-green-500 text-white" });
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Registration failed", 
        { position: "top-right", className: "bg-red-500 text-white" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Fixed form validation
  const isFormValid = () => {
    const values = watch();
    return (
      values.firstName &&
      values.lastName &&
      values.email &&
      values.password &&
      values.confirmPassword &&
      (role !== "Admin" || values.adminKey) &&
      agree
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{
      backgroundImage: `url('../assets/RegiPosterBlured.png')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-lg"></div>
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Left Side - Image */}
        <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('./assets/RegiPoster.png')" }}>
          <button 
            onClick={() => navigate("/")} 
            className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition"
          >
            Back to website
          </button>
          <div className="absolute bottom-0 w-full p-3 text-gray-800 text-lg font-semibold bg-white/90">
            Just One Step Ahead of Sculpting Your Future
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-gray-900 text-2xl font-semibold mb-4">Create an account</h2>
          <p className="text-gray-600 mb-6">
            Already have an account?{" "}
            <a href="/login" className="text-purple-500 hover:underline">Log in</a>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <select 
              {...register("role")} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="User">Student</option>
              <option value="Admin">Admin</option>
            </select>

            {/* Admin Key Field (Conditional) */}
            {role === "Admin" && (
              <div className="relative">
                <input 
                  type={showAdminKey ? "text" : "password"} 
                  {...register("adminKey", { required: "Admin Secret Key is required" })} 
                  placeholder="Admin Secret Key" 
                  className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                />
                <FaLock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <button 
                  type="button" 
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700" 
                  onClick={() => setShowAdminKey(!showAdminKey)}
                >
                  {showAdminKey ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
                {errors.adminKey && <p className="mt-1 text-sm text-red-600">{errors.adminKey.message}</p>}
              </div>
            )}

            {/* Name Fields - Kept in same line */}
            <div className="flex gap-4">
              <div className="w-1/2 relative">
                <input
                  type="text"
                  {...register("firstName", { required: "First name is required" })}
                  placeholder="First name"
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <FaUser className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div className="w-1/2 relative">
                <input
                  type="text"
                  {...register("lastName", { required: "Last name is required" })}
                  placeholder="Last name"
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <FaUserAlt className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
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
                className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <FaEnvelope className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
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
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <FaLock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <FaLock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="agree" 
                checked={agree} 
                onChange={(e) => setAgree(e.target.checked)} 
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="agree" className="text-gray-600 text-sm">
                I agree to the <a href="#" className="text-purple-500 hover:underline">Terms & Conditions</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 transition ${
                (!isFormValid() || isSubmitting) ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
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
              className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
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