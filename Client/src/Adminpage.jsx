
// import { useEffect, useState } from "react";
// import ChartComponent from "./components/ChartComponent";
// import StudentTable from "./components/StudentTable";
// import { FaUser, FaEnvelope, FaIdCard, FaBook } from "react-icons/fa";
// import Cookies from "js-cookie"; 
// import axios from "axios";


// const AdminPage = () => {
//   // const user = JSON.parse(localStorage.getItem("user"));
//   const regNumber = localStorage.getItem("registrationNumber");
  
//   const [isShow,setisShow]= useState(false);
//   const [width, setWidth] = useState("ms-15")

//   useEffect(()=>{
//     setWidth("ms-20")
//   })


//   useEffect(()=>{
//     setisShow(true)
//   })
//   const [user, setUser] = useState(null);
//   const downloadFile = async (type, students) => {
//     try {
//       const url = `http://localhost:5000/api/download/${type}?students=${encodeURIComponent(
//         JSON.stringify(students)
//       )}`;
  
//       const response = await axios.get(url, {
//         responseType: "blob",
//       });
  
//       const blob = new Blob([response.data], {
//         type: type === "pdf" ? "application/pdf" : "text/csv",
//       });
//       const link = document.createElement("a");
//       link.href = window.URL.createObjectURL(blob);
//       link.setAttribute(
//         "download",
//         `Student_Details_Report.${type === "pdf" ? "pdf" : "csv"}`
//       );
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error(`Error downloading ${type.toUpperCase()}:`, error);
//     }
//   };

//   useEffect(() => {
//     const userCookie = Cookies.get("user");
//     if (userCookie) {
//       try {
//         setUser(JSON.parse(decodeURIComponent(userCookie))); // ✅ Fix: Parse user correctly
//       } catch (error) {
//         console.error("Error parsing user cookie:", error);
//       }
//     }
//   }, []);
//   if (!user) return <div>Loading user data...</div>;
//   return (
//     <div className="flex h-full pt-10">

// <div className="w-full opacity-0 translate-y-20 animate-slideInUp ms-12  transition-all duration-700  ">
// <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white mx-7 mb-8 p-6 rounded-lg shadow-lg">
//     <h1 className="text-3xl font-bold">Welcome, <span className="font-semibold">{user.name}</span></h1>
//     <p className="text-lg">Role: <span className="font-semibold text-yellow-300">Admin</span></p>
//     <p>Email: <span className="font-semibold">{user.email}</span></p>
//     <p>Admin ID: <span className="font-semibold text-red-300">{regNumber}</span></p>
// </div>

//   <div className="mb-5 mx-5">
//       <div className="flex flex-wrap mx-5 md:flex-nowrap justify-between gap-6 ">
//         <ChartComponent
//           type="pie"
//           title="Subject-wise Marks"
//           categories={["ControlSystem", "EDC", "Network", "EMF","Digital"]}
//           series={[85, 90, 78, 88,91]} 
//         />
//         <ChartComponent
//           type="bar"
//           title="Student Enrollment"
//           categories={["Jan", "Feb", "Mar", "Apr"]}
//           series={[{ name: "Students", data: [20, 30, 25, 40] }]}
//         />
//           <ChartComponent
//             type="donut"
//             title="Subject-wise Marks"
//             categories={["Math", "Science", "English", "History"]}
//             series={[85, 90, 78, 88]} 
//           />
//       </div>
//       </div>

//       <StudentTable show={isShow} width={width} pageType={"AdminPage"} downloadFile={downloadFile}/>
//     </div>
//     </div>
//   );
// };


// export default AdminPage;

// // const [deletedLogs, setDeletedLogs] = useState([]);

// // useEffect(() => {
// //   const fetchDeletedLogs = async () => {
// //     const response = await axios.get("/api/deletedLogs");
// //     setDeletedLogs(response.data);
// //   };
// //   fetchDeletedLogs();
// // }, []);

import React from 'react'
import AdminWelcomeCard from "./components/AdminWelcomeCard";
import AdminCharts from "./components/AdminChart";
import StudentTable from "./components/StudentTable";



const Adminpage = () => {
  return (
    <div className="animate-slideInUp translate-y-20 transition-all duration-700">

    <AdminWelcomeCard />
    <AdminCharts/>
    <StudentTable/>
    </div>
    
  )
}

export default Adminpage