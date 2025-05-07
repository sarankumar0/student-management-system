import { useState } from "react";
import { FaBell, FaUserCircle, FaBullhorn, FaEnvelope } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import studentSide_profile_demo from "../assets/studentSide_profile_demo.jpeg";


const Header = ({ pageTitle, onSearch, profilePic }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("user"); 
    localStorage.removeItem("registrationNumber"); 
    window.location.href = "http://localhost:5174/login"; 
  };
  

  return (
    <header className="bg-white sticky top-0 z-40 shadow-md px-6 py-3 flex justify-between items-center">
      {/* <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1> */}

      <div className="hidden md:flex items-center w-1/3">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      <div className="flex items-center space-x-6">
        {/* <div className="relative group cursor-pointer">
          <FaBullhorn size={22} className="text-gray-600 hover:text-indigo-600" />
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
            Announcements
          </span>
        </div> */}

        <div className="relative group cursor-pointer">
          <FaEnvelope size={22} className="text-gray-600 hover:text-indigo-600" />
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
            Messages
          </span>
        </div>

        <div className="relative group cursor-pointer">
          <FaBell size={22} className="text-gray-600 hover:text-indigo-600" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            3
          </span>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
            Notifications
          </span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
          >
            {profilePic ? (
              <img
                src={studentSide_profile_demo}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-gray-300 object-cover"
              />
            ) : (
              <FaUserCircle size={24} />
            )}
            <span className="hidden md:block">Student</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg overflow-hidden z-10">
              <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                View Profile
              </button>
              <button onClick={handleLogout} className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2">
                <MdLogout size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
