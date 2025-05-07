import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaBook, FaClipboardList,
  FaCog, FaUsers, FaCommentDots, FaCalendarAlt, FaGraduationCap, FaFileAlt,
  FaUniversity, FaRocket, FaFolderOpen, FaChalkboardTeacher, FaScroll, FaUser
} from "react-icons/fa";

const StudentSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Menu Items
  const menuItems = [
    { label: "Dashboard", icon: FaTachometerAlt, path: "/dashboard" },
    { label: "Forum", icon: FaCommentDots, path: "/forum" },
    { label: "Groups", icon: FaUsers, path: "/groups" },
    { label: "My Profile", icon: FaUser, path: "/profile" }
  ];

  const dropdownItems = [
    {
      label: "Courses", icon: FaBook, items: [
        { label: "My-Course", icon: FaChalkboardTeacher, path: "/courses" },
        { label: "Assignments", icon: FaClipboardList, path: "/courses/assignments" },
        { label: "Study Materials", icon: FaFolderOpen, path: "/courses/materials" }
      ]
    },
    {
      label: "Exams", icon: FaGraduationCap, items: [
        { label: "Exam Timetable", icon: FaCalendarAlt, path: "/exams/timetable" },
        { label: "Take Quiz", icon: FaFileAlt, path: "/exams/TakeQuiz"},
        { label: "Results", icon: FaScroll, path: "/exams/results" },
      ]
    },
    {
      label: "Others", icon: FaUniversity, items: [
        { label: "Library", icon: FaBook, path: "/others/library" },
        { label: "Events", icon: FaRocket, path: "/others/events" },
        { label: "Internships", icon: FaFolderOpen, path: "/others/internships" }
      ]
    }
  ];

  return (
    <div
      className={`h-screen bg-gray-900 text-white z-100 overflow-hidden transition-all duration-500 ${isExpanded ? "w-64" : "w-20"}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-purple-500 p-2 rounded-full">📌</div>
          <span className={`text-xl font-extrabold transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>Oxford</span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          <ul className="space-y-5">
            {menuItems.map((item, index) => (
              <li
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-colors duration-200 ${location.pathname === item.path ? "bg-indigo-600" : "hover:bg-gray-700"}`}
              >
                <item.icon className="text-2xl flex-shrink-0" />
                <span className={`transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>{item.label}</span>
              </li>
            ))}

            {dropdownItems.map((menu, index) => (
              <li
                key={index}
                className="relative group"
                onMouseEnter={() => toggleDropdown(menu.label)}
                onMouseLeave={() => toggleDropdown(null)}
              >
                <div
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-colors duration-200 ${openDropdown === menu.label ? "bg-indigo-600" : "hover:bg-gray-700"}`}
                  onClick={() => toggleDropdown(menu.label)}
                >
                  <menu.icon className="text-2xl flex-shrink-0" />
                  <span className={`transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>{menu.label}</span>
                  {isExpanded && (
                    <span
                      className={`ml-auto transition-transform transform ${openDropdown === menu.label ? "rotate-90" : "rotate-0"}`}
                    >
                      {">"}
                    </span>
                  )}
                </div>
                {openDropdown === menu.label && (
                  <ul className="ml-6 space-y-2 bg-gray-800 p-2 rounded-md">
                    {menu.items.map((item, subIndex) => (
                      <li
                        key={subIndex}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors duration-200 ${location.pathname === item.path ? "bg-indigo-600" : "hover:bg-gray-700"}`}
                      >
                        <item.icon className="text-lg" />
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings at Bottom */}
        <div className="mt-auto">
          <li
            onClick={() => navigate("/settings")}
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-colors duration-200 ${location.pathname === "/settings" ? "bg-indigo-600" : "hover:bg-gray-700"}`}
          >
            <FaCog className="text-2xl flex-shrink-0" />
            <span className={`transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>Settings</span>
          </li>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
