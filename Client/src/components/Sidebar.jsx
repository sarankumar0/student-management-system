import { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaUserGraduate, FaChartPie, FaCog, FaCalendarAlt, FaMoneyCheckAlt, FaBookOpen, FaClipboardList, FaFileAlt } from "react-icons/fa";
// imporat { MdDashboard } from "react-icons/md";
import ConfirmModal from "./ConfirmModal";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsModalOpen(false); 
    navigate("/login");
  };

  return (
    <div>
      <nav className={`bg-gray-900 text-white p-5 z-[100] h-screen fixed   ${isCollapsed ? "w-22" : "w-52"} transition-all duration-900`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h1 className={` text-xl font-bold ${isCollapsed ? "hidden" : "block"}`}>Admin</h1>
          <FaBars
  className="cursor-pointer text-2xl ms-2"
  onClick={() => {
    console.log("Before Toggle:", isCollapsed);
    setIsCollapsed((prev) => !prev);
    console.log("After Toggle:", isCollapsed);
  }}
/>
            
        </div>

        {/* Sidebar Links */}
        <ul className="space-y-5">
          <li>
            <NavLink to="/admin" end className={({ isActive }) => `flex items-center space-x-3 p-2 rounded mt-12  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaChartPie className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Dashboard</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/StudentsTable" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaUserGraduate className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Students</span>}
            </NavLink>
          </li>

          {/* <li>
            <NavLink to="/admin/batches" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded   ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaCalendarAlt className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Batches</span>}
            </NavLink>
          </li> */}

          <li>
            <NavLink to="/admin/payments" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaMoneyCheckAlt className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Payments</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/courses" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaBookOpen className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Courses</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/Test" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaFileAlt className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Test&Result</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="posts/assignments" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaClipboardList className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Post Details</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/reports" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaFileAlt className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Reports</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded  ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}>
              <FaCog className="text-2xl" />
              {!isCollapsed && <span className='px-5' >Settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
      />
    </div>
  );
}

export default Sidebar;



