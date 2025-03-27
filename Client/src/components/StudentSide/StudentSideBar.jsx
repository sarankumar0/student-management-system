import { useState } from "react";
import { FaTachometerAlt, FaBook, FaClipboardList, FaChartBar, FaSignOutAlt, FaCog, FaUsers, FaCommentDots } from "react-icons/fa";
import { MdOutlineClass } from "react-icons/md";

const StudentSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-900 text-white transition-all duration-500 ${isExpanded ? "w-64" : "w-20"}`} 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full p-4">
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-purple-500 p-2 rounded-full">📌</div>
          <span className={`whitespace-nowrap transition-opacity  duration-200 ${isExpanded ? "opacity-100 font-extrabold text-xl" : "opacity-0 hidden"}`}>Oxford</span>
        </div>

        <div className="flex items-center space-x-4 mb-10">
          <img  className="bg-purple-500 p-2 rounded-full rounded-full" alt="Profile" />
          <div className={`transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
            <p className="text-sm font-medium">Saran</p>
            <p className="text-xs text-gray-400">Student</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          <ul className="space-y-5">
            {[{ icon: FaTachometerAlt, label: "Dashboard" },
              { icon: FaBook, label: "My Courses" },
              { icon: MdOutlineClass, label: "Save Classes" },
              { icon: FaClipboardList, label: "Assignments" },
              { icon: FaChartBar, label: "Test" },
              { icon: FaUsers, label: "Groups" },
              { icon: FaCommentDots, label: "Forum" }].map((item, index) => (
              <li key={index} className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                <item.icon className="text-2xl flex-shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings & Logout */}
        <div className="space-y-2">
          {[{ icon: FaCog, label: "Settings" },
            { icon: FaSignOutAlt, label: "Log Out", extraClasses: "bg-red-500 hover:bg-red-600" }].map((item, index) => (
            <li key={index} className={`flex items-center space-x-4 p-2 rounded-md ${item.extraClasses || "hover:bg-gray-700"} cursor-pointer`}>
              <item.icon className="text-2xl flex-shrink-0" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>{item.label}</span>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
