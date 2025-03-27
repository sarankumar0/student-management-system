
// import Cookies from "js-cookie";
// import { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaBullhorn, FaUser,FaIdCard,FaBook, FaEnvelope, FaBookOpen, FaClipboardList, FaCalendarAlt, FaTrophy, FaFire, FaChartLine } from "react-icons/fa";

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const registrationNumber = Cookies.get("registrationNumber") || "N/A";

//   useEffect(() => {
//     const userData = Cookies.get("user");
//     if (userData) {
//       setUser(JSON.parse(userData));
//     }
//     setLoading(false);
//   }, []);

//   const [announcements, setAnnouncements] = useState([
//     "📢 Midterm exams start next Monday!",
//     "🚀 New internship opportunities available!",
//     "📜 Assignment deadlines updated."
//   ]);
//   const [messages, setMessages] = useState([
//     "📩 Your advisor sent a meeting request.",
//     "🎉 Welcome to the new semester!",
//     "📅 Exam schedule has been updated."
//   ]);
//   const [gpaData, setGpaData] = useState([3.5, 3.8, 3.6, 3.9, 4.0]);
//   const [attendanceData, setAttendanceData] = useState([90, 85, 88, 92, 95]);

//   if (loading) {
//     return <p className="text-center text-blue-500">Loading user data...</p>;
//   }

//   if (!user) {
//     return <p className="text-center text-red-500">User data not available.</p>;
//   }

//   return (
//     <div className="flex flex-col">
//       {/* Welcome Section */}
//       {/* <div className="w-full mx-5 mx-auto mt-4 p-4 bg-white rounded-lg shadow-md">
//   <h1 className="text-2xl font-bold mb-3 flex items-center gap-2">
//     <FaUser className="text-blue-500 text-lg" /> 
//     Welcome, <span className="text-indigo-600">{user.name || "Student"}</span>
//   </h1>

//   <div className="space-y-3 text-base text-gray-700">
//     <p className="flex items-center gap-2">
//       <FaEnvelope className="text-green-500 text-sm" />
//       <b>Email:</b> {user.email || "N/A"}
//     </p>
//     <p className="flex items-center gap-2">
//       <FaIdCard className="text-red-500 text-sm" />
//       <b>Student ID:</b> {registrationNumber}
//     </p>
//     <p className="flex items-center gap-2">
//       <FaBook className="text-yellow-500 text-sm" />
//       <b>Plan:</b> {user.plan ? user.plan.toUpperCase() : "BASIC"}
//     </p>
//     <p className="flex items-center gap-2 text-gray-500">
//       <FaCalendarAlt className="text-blue-400 text-sm" />
//       📅 Today: {new Date().toLocaleDateString()}
//     </p>
//   </div>
// </div> */}
// <div
//   className="w-full mx-1 mx-auto mt-6 p-1 rounded-lg shadow-lg relative"
//   style={{
//     background: "linear-gradient(135deg, #6C63FF, #C850C0)", // Purple-pink gradient
//     borderRadius: "12px",
//   }}
// >
//   <div
//     className="ps-6 py-2 rounded-xl"
//     style={{
//       background: "linear-gradient(135deg, #6C63FF, #C850C0)", // Gradient inside
//       color: "#fff", // White text for contrast
//       boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)", // Soft shadow
//     }}
//   >
//     <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
//       {/* <FaUser className="text-yellow-300 text-lg drop-shadow-lg" /> */}
//       Welcome,{" "}
//       <span className="font-semibold text-white">
//         {user.name ? user.name : "Student"}
//       </span>
//     </h1>

//     <div className="space-y-1 text-lg">
//       {/* <p className="flex items-center gap-3">
//         <FaIdCard className="text-red-300 text-base drop-shadow-md" />
//         <b className="text-gray-100">Student ID:</b> {registrationNumber}
//       </p> */}
//       <p className="flex items-center gap-3">
//         {/* <FaBook className="text-yellow-400 text-base drop-shadow-md" /> */}
//         <b className="text-gray-100">You are at {user.plan ? user.plan.toUpperCase() : "BASIC"} plan</b>
//       </p>
//       <p className="flex items-center gap-3">
//         {/* <FaCalendarAlt className="text-blue-300 text-base drop-shadow-md" /> */}
//         <b className="text-gray-100">Date:</b> {new Date().toLocaleDateString()}
//       </p>
//     </div>
//   </div>
// </div>


//       {/* Performance & Announcements */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
//         <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//           <FaChartLine size={30} className="text-purple-500 mb-2" />
//           <h2 className="text-lg font-semibold">Performance Summary</h2>
//           <p className="text-gray-600">Your overall GPA is {gpaData[gpaData.length - 1]} 🎯</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//           <FaCalendarAlt size={30} className="text-blue-500 mb-2" />
//           <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
//           <p className="text-gray-600">2 Assignments due this week</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//           <FaTrophy size={30} className="text-yellow-500 mb-2" />
//           <h2 className="text-lg font-semibold">Achievements</h2>
//           <p className="text-gray-600">Top scorer in Mathematics!</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//           <FaFire size={30} className="text-red-500 mb-2" />
//           <h2 className="text-lg font-semibold">Trending Discussions</h2>
//           <p className="text-gray-600">Best study strategies for exams</p>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-lg font-semibold mb-4">📊 GPA Progress</h2>
//           <Chart
//             type="line"
//             series={[{ name: "GPA", data: gpaData }]}
//             options={{
//               chart: { id: "gpa-chart" },
//               xaxis: { categories: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"] }
//             }}
//             height={250}
//           />
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-lg font-semibold mb-4">✅ Attendance (%)</h2>
//           <Chart
//             type="bar"
//             series={[{ name: "Attendance", data: attendanceData }]}
//             options={{
//               chart: { id: "attendance-chart" },
//               xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] }
//             }}
//             height={250}
//           />
//         </div>
//       </div>

//       {/* Announcements & Messages */}
//       <div className="grid mb-5 grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaBullhorn /> Announcements</h2>
//           <div className="h-24 overflow-auto">
//             {announcements.map((announcement, index) => (
//               <p key={index} className="text-gray-700 py-1">{announcement}</p>
//             ))}
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaEnvelope /> Messages</h2>
//           <div className="h-24 overflow-auto">
//             {messages.map((message, index) => (
//               <p key={index} className="text-gray-700 py-1">{message}</p>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Quick Access Buttons */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
//         <button className="bg-indigo-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
//           <FaBookOpen size={20} /> View Marksheet
//         </button>
//         <button className="bg-green-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center gap-2 hover:bg-green-700 transition">
//           <FaClipboardList size={20} /> Exam Timetable
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import StudentWelcomeCard from './StudentWelcomeCard'

const Dashboard = () => {
  return (
   <>
   <StudentWelcomeCard/>
   </>
  )
}

export default Dashboard