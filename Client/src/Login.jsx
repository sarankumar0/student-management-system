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
  //   event.preventDefault();
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

const handleLogin = async (event) => {
  event.preventDefault();

  if (!email || !password) {
      toast.error("Email and password are required!");
      return;
  }

  try {
      // ✅ Login Request
      const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email: email.trim(), password: password.trim() },
          { withCredentials: true }
      );

      toast.success("Login successful!");

      // ✅ Fetch user profile after login
      const profileResponse = await axios.get("http://localhost:5000/api/auth/user-profile", {
          withCredentials: true,
      });

      const user = profileResponse.data;
      setUser(user); // ✅ Store user globally

      // ✅ Redirect based on role & separate projects
      if (user.role === "admin") {
          window.location.href = "http://localhost:5174/admin"; // ✅ Redirect to Admin Project
      } else {
          window.location.href = "http://localhost:5173/dashboard"; // ✅ Redirect to Student Project
      }
  } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
  }
};


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
const fetchUserProfile = async () => {
  try {
      const response = await axios.get("http://localhost:5000/api/auth/user-profile", {
          withCredentials: true,
      });

      console.log("👤 User Data Received:", response.data);
      setUser(response.data);

      // 🔹 Redirect based on user role
      if (response.data.role === "admin") {
          navigate("/admin");
      } else {
          navigate("/dashboard");
      }

  } catch (error) {
      console.error("❌ Failed to fetch user profile:", error.response?.data?.message || error.message);
  }
};




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




// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import { ToastContainer, toast } from "react-toastify"; 
// import "react-toastify/dist/ReactToastify.css"; 
// import GuestNavBar from "./components/Guest/GuesstNavBar";
// import axios from "axios";
// axios.defaults.withCredentials = true; // ✅ Set globally

// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";


// const Login = () => {

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isValidEmail, setIsValidEmail] = useState(false);
//   const [isValidPassword, setIsValidPassword] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     setIsValidEmail(emailRegex.test(email));
//   };
//   const validatePassword = (password) => {
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
//     setIsValidPassword(passwordRegex.test(password));
//   };
//   const handleLogin = async () => {
//     try {
//       const response = await axios.post("http://localhost:5000/api/auth/login", {
//         email: email.trim(),
//         password: password.trim(),
//       },{ withCredentials: true });

//       console.log("Response from API:", response.data); // Debugging
//       const { token, user } = response.data;
//       if (!token || !user) {
//         toast.error("Login failed: Invalid response from server");
//         return;
//       }

//        // ✅ Store user data correctly
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));  // ✅ Save full user object
//     localStorage.setItem("registrationNumber", user.registrationNumber);  // ✅ Save reg ID
//       toast.success("Login successful!", { position: "top-right" });
  
//       //Redirect to different servers based on role
//       setTimeout(() => {
//         if (user.role === "admin") {
//           window.location.href = "http://localhost:5174/admin"; 
//         } else if (user.role === "user") {
//           window.location.href = "http://localhost:5173/dashboard"; 
//         } else {
//           toast.error("Unauthorized role detected!");
//         }
//       }, 1000);
  
//     } catch (error) {
//       console.error("Login Error:", error.response?.data || error);
//       toast.error(error.response?.data?.message || "Invalid credentials!", { position: "top-right" });
//     }
//   };
  
//   const Register = () => {
//     navigate("/Register");
//   };

//   return (

//     <div className="bg-gray-100 min-h-screen flex flex-col items-center">
//      <GuestNavBar />
//       <div className="flex justify-center items-center min-h-screen w-full max-w-2xl bg-gray-100">
//         <div className="bg-white shadow-lg rounded-lg p-14 w-full max-w-2xl min-h-[500px] opacity-0 translate-y-20 animate-slideInUp transition-all duration-700">
//           <h1 className="text-center text-blue-600 text-3xl font-bold mt-0 pt-0 mb-8">Login to Oxford University</h1>
          
//           <div className="mb-6">
//             <label className="block text-gray-700 text-lg mb-2">Email</label>
//             <input
//               type="text"
//               className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
//               placeholder="Example@gmail.com"
//               value={email}
//               onChange={(e) => {
//                 setEmail(e.target.value);
//                 validateEmail(e.target.value);
//               }}
//             />
//             {!isValidEmail && email && (
//               <span className="text-red-500 text-sm">Invalid email format</span>
//             )}
//           </div>

//           <div className="mb-6 relative">
//             <label className="block text-gray-700 text-lg mb-2">Password</label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg pr-10"
//                 placeholder="Password@12"
//                 value={password}
//                 onChange={(e) => {
//                   setPassword(e.target.value);
//                   validatePassword(e.target.value);
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-3 flex items-center text-gray-600"
//               >
//                 <i className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}></i>
//               </button>
//             </div>
//             {!isValidPassword && password && (
//               <span className="text-red-500 text-sm">
//                 Password must contain 1 uppercase, 1 lowercase, 1 number, and at least 8 characters.
//               </span>
//             )}
//             <a href="#" className="block text-right text-blue-600 hover:underline my-3">I forgot my password</a>
//           </div>

//           <button
//             type="button"
//             onClick={handleLogin}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-lg font-semibold"
//             disabled={!isValidEmail || !isValidPassword}
//           >
//             Login
//           </button>
          
//           <div>
//             <h4 className="text-center mt-6 text-lg">Log in with Another Account</h4>
//             <div className="flex justify-center space-x-6 mt-4">
//               <a href="#" className="text-gray-600 text-2xl px-1 sm:px-3 text-4xl"><i className="fa-brands fa-google"></i></a>
//               <a href="#" className="text-gray-600 text-2xl px-1 lg:px-3 text-4xl"><i className="fa-brands fa-facebook"></i></a>
//               <a href="#" className="text-gray-600 text-2xl px-1 lg:px-3 text-4xl"><i className="fa-brands fa-twitter"></i></a>
//               <a href="#" className="text-gray-600 text-2xl px-1 lg:px-3 text-4xl"><i className="fa-brands fa-github"></i></a>
//               <a href="#" className="text-gray-600 text-2xl px-1 lg:px-3 text-4xl"><i className="fa-brands fa-linkedin"></i></a>
//             </div> 
//             <div className="text-center mt-6 text-lg">Not a member yet? <button onClick={Register} className="text-blue-600 hover:underline">Sign up</button> free</div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default Login;
