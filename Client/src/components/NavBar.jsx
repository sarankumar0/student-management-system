// import { useState } from "react";
// import { FaSearch, FaBell, FaUser, FaTasks, FaEnvelope } from "react-icons/fa";
// import { Tooltip } from "react-tooltip";

// const Navbar = () => {
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [modalOpen, setModalOpen]=useState(false);
//   const handleLogout = () => {
//     modalOpen(true);
//     localStorage.removeItem("token"); 
//     localStorage.removeItem("user"); 
//     localStorage.removeItem("registrationNumber"); 
//     window.location.href = "http://localhost:5174/login"; 
//   };
//   setModalOpen = ({ isOpen, onClose, onConfirm, student }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//             <div className="bg-white p-6 rounded-lg">
//                 <p>Are you sure you want to logout?</p>
//                 <div className="flex justify-center gap-2 mt-4">
//                     <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={onClose}>Cancel</button>
//                     <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => { handleLogout }}>Logout</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

//   return (
//     <div className="fixed top-0 left-0 w-full h-14 bg-gray-800 text-white flex items-center px-4 shadow-md z-50">
//       <h1 className="text-xl font-bold ms-20">Oxford</h1>
//       <div className="ml-auto flex items-center gap-10">
//         <div className="relative flex items-center">
//           {searchOpen ? (
//             <input
//               type="text"
//               placeholder="Search..."
//               className="p-2 pl-10 text-black rounded-lg border focus:outline-none focus:ring focus:ring-blue-500 transition-all w-48"
//             />
//           ) : (
//             <FaSearch
//               className="cursor-pointer text-xl hover:text-blue-400"
//               onClick={() => setSearchOpen(true)}
//               data-tooltip-id="search-tooltip"
//             />
//           )}
//           <Tooltip id="search-tooltip" content="Search" place="bottom" />
//         </div>
        
//         <FaEnvelope className="cursor-pointer text-2xl hover:text-blue-400" data-tooltip-id="message-tooltip" />
//         <Tooltip id="message-tooltip" content="Messages" place="bottom" />
//         <FaTasks className="cursor-pointer text-2xl hover:text-blue-400" data-tooltip-id="tasks-tooltip" />
//         <Tooltip id="tasks-tooltip" content="Tasks" place="bottom" />
//         <FaBell className="cursor-pointer text-2xl hover:text-blue-400" data-tooltip-id="notification-tooltip" />
//         <Tooltip id="notification-tooltip" content="Notifications" place="bottom" />
//         <div className="relative">
//           <FaUser
//             className="cursor-pointer text-2xl hover:text-blue-400"
//             onClick={() => setProfileOpen(!profileOpen)}
//             data-tooltip-id="user-tooltip"
//           />
//           <Tooltip id="user-tooltip" content="Profile" place="bottom" />
//           {profileOpen && (
//             <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-lg shadow-lg">
//               <button className="block w-full px-4 py-2 hover:bg-gray-200">Profile</button>
//               <button onClick={handleLogout} className="block w-full px-4 py-2 hover:bg-gray-200">Logout</button>
//             </div>
//           )}
//         </div>
//       </div>{

//       }
//     </div>
//   );
// };

// export default Navbar;
import { useState } from "react";
import { FaSearch, FaBell, FaUser, FaTasks, FaEnvelope } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <p className="text-black">Are you sure you want to logout?</p>
        <div className="flex justify-center gap-2 mt-4">
          <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("registrationNumber");
    window.location.href = "http://localhost:5174/login";
  };

  return (
    
    <div className="fixed top-0 left-0 w-full h-14 bg-gray-800 text-white flex items-center px-4 shadow-md z-50">
      <h1 className="text-xl font-bold ms-20">Oxford</h1>
      <div className="ml-auto flex items-center gap-10">
        <div className="relative flex items-center">
          {searchOpen ? (
            <input
              type="text"
              placeholder="Search..."
              className="p-2 pl-10 text-black rounded-lg border focus:outline-none focus:ring focus:ring-blue-500 transition-all w-48"
            />
          ) : (
            <FaSearch
              className="cursor-pointer text-xl hover:text-blue-400"
              onClick={() => setSearchOpen(true)}
              data-tooltip-id="search-tooltip"
            />
          )}
          <Tooltip id="search-tooltip" content="Search" place="bottom" />
        </div>

        <FaEnvelope className="cursor-pointer text-2xl hover:text-blue-400" data-tooltip-id="message-tooltip" />
        <Tooltip id="message-tooltip" content="Messages" place="bottom" />
        <FaTasks className="cursor-pointer text-2xl hover:text-blue-400" data-tooltip-id="tasks-tooltip" />
        <Tooltip id="tasks-tooltip" content="Tasks" place="bottom" />
        <FaBell className="cursor-pointer text-2xl hover:text-blue-400" data-tooltip-id="notification-tooltip" />
        <Tooltip id="notification-tooltip" content="Notifications" place="bottom" />

        <div className="relative">
          <FaUser
            className="cursor-pointer text-2xl hover:text-blue-400"
            onClick={() => setProfileOpen(!profileOpen)}
            data-tooltip-id="user-tooltip"
          />
          <Tooltip id="user-tooltip" content="Profile" place="bottom" />
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-lg shadow-lg">
              <button className="block w-full px-4 py-2 hover:bg-gray-200">Profile</button>
              <button onClick={() => setModalOpen(true)} className="block w-full px-4 py-2 hover:bg-gray-200">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <LogoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Navbar;
