import { useState } from "react";
import { MoreVertical, Search } from "lucide-react";

const batches = [
  { name: "Basic", students: 120, completion: "60%", lastUpdate: "2 days ago", timeRemaining: "30 days" },
  { name: "Classic", students: 200, completion: "80%", lastUpdate: "1 day ago", timeRemaining: "20 days" },
  { name: "Pro", students: 300, completion: "90%", lastUpdate: "5 hours ago", timeRemaining: "10 days" },
];

const lectures = [
  { title: "Lecture 1", date: "March 20, 2025", videoUrl: "#" },
  { title: "Lecture 2", date: "March 21, 2025", videoUrl: "#" },
];

const materials = [
  { name: "Notes Chapter 1", posted: "March 18, 2025" },
  { name: "Assignment 1", posted: "March 19, 2025" },
];

export default function CoursePage() {
  const [selectedBatch, setSelectedBatch] = useState("Basic");
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fileBatch, setFileBatch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Handle File Upload Logic
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    if (!fileBatch) {
      alert("Please select a batch!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("batch", fileBatch);

    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });
    

    if (response.ok) {
      alert("File uploaded successfully!");
      setModalOpen(false); // Close modal after upload
      setSelectedFile(null); // Reset file after upload
    } else {
      alert("File upload failed.");
    }
  };

  return (
    <div className="flex flex-col ms-12 mt-10 w-full relative">
      {/* 📝 Header with Search and Upload Button */}
      <div className="flex justify-end items-center bg-white shadow-md px-4 py-2 sticky top-0 z-50">
        <div className="flex items-center gap-2 me-4 relative">
          <Search size={18} className="absolute me-4 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-md pl-8 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-1 font-xl me-8 bg-indigo-500 text-white text-lg rounded-lg shadow-md hover:bg-indigo-600"
        >
          Upload
        </button>
      </div>

      {/* 📚 Main Content */}
      <div className="flex ms-16 mt-4 flex-col md:flex-row w-full p-4 gap-4 relative">
        {/* 📂 Modal for File Upload */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 relative">
              <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800">Upload File</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="p-2 border rounded-lg w-full mb-4"
                />
                <select
                  onChange={(e) => setFileBatch(e.target.value)}
                  className="p-2 border rounded-lg w-full mb-4"
                >
                  <option value="">Select Batch</option>
                  <option value="Pro">Pro</option>
                  <option value="Classic">Classic</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  onClick={handleUpload}
                  className="p-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300"
                >
                  Upload File
                </button>
                <button
                  className="p-3 bg-gray-200 text-gray-800 text-lg font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🎓 Left Side: Batch Cards */}
        <div className="w-full md:w-80 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
          {batches.map((batch) => (
            <div
              key={batch.name}
              className={`p-4 w-40 md:w-80 cursor-pointer shadow-md rounded-lg transition-all ${
                selectedBatch === batch.name ? "bg-blue-500 text-white" : "bg-white"
              }`}
              onClick={() => setSelectedBatch(batch.name)}
            >
              <h2 className="text-xl font-bold">{batch.name}</h2>
              <p>Total Students: {batch.students}</p>
              <p>Completion: {batch.completion}</p>
              <p>Last Update: {batch.lastUpdate}</p>
              <p>Time Left: {batch.timeRemaining}</p>
            </div>
          ))}
        </div>

        {/* 🎥 Right Side: Dynamic Content */}
        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 hover:z-[10] gap-4">
          {/* 🎥 Lecture Cards */}
          {lectures.map((lecture, index) => (
            <div key={index} className="p-4 shadow-md rounded-lg relative bg-white">
              <h3 className="text-lg font-semibold">{lecture.title}</h3>
              <p>{lecture.date}</p>
              <button className="mt-2 px-4 py-2 bg-gray-200 rounded-md">Watch</button>
              <button
                onClick={() => setMenuOpen(index === menuOpen ? null : index)}
                className="absolute top-2 right-2"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen === index && (
                <div className="absolute top-8 right-2 bg-white shadow-lg p-2 rounded-md">
                  <p className="cursor-pointer p-3 hover:text-red-500">Delete</p>
                  <p className="cursor-pointer p-3 hover:text-gray-500">Archive</p>
                </div>
              )}
            </div>
          ))}

          {/* 📚 Material Cards */}
          {materials.map((material, index) => (
            <div key={index} className="p-4 shadow-md rounded-lg relative bg-white">
              <h3 className="text-lg font-semibold">{material.name}</h3>
              <p>Posted: {material.posted}</p>
              <button
                onClick={() =>
                  setMenuOpen(index + lectures.length === menuOpen ? null : index + lectures.length)
                }
                className="absolute top-2 right-2"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen === index + lectures.length && (
                <div className="absolute top-8 right-2 bg-white shadow-lg p-2 rounded-md">
                  <p className="cursor-pointer hover:text-red-500">Delete</p>
                  <p className="cursor-pointer hover:text-gray-500">Archive</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




// import { useState } from "react";
// import { MoreVertical, Search } from "lucide-react";

// const batches = [
//   { name: "Basic", students: 120, completion: "60%", lastUpdate: "2 days ago", timeRemaining: "30 days" },
//   { name: "Classic", students: 200, completion: "80%", lastUpdate: "1 day ago", timeRemaining: "20 days" },
//   { name: "Pro", students: 300, completion: "90%", lastUpdate: "5 hours ago", timeRemaining: "10 days" },
// ];

// const lectures = [
//   { title: "Lecture 1", date: "March 20, 2025", videoUrl: "#" },
//   { title: "Lecture 2", date: "March 21, 2025", videoUrl: "#" },
// ];

// const materials = [
//   { name: "Notes Chapter 1", posted: "March 18, 2025" },
//   { name: "Assignment 1", posted: "March 19, 2025" },
// ];

// export default function CoursePage() {
//   const [selectedBatch, setSelectedBatch] = useState("Basic");
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [fileBatch, setFileBatch] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!selectedFile) {
//       alert("Please select a file first!");
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("batch", fileBatch);
  
//     const response = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });
  
//     if (response.ok) {
//       alert("File uploaded successfully!");
//     } else {
//       alert("File upload failed.");
//     }
//   };
  
  

//   return (
//     <div className="flex flex-col ms-12 mt-10 w-full relative">
//       {/* Sticky Header */}
//       <div className="flex justify-end items-center bg-white shadow-md px-4 py-2 sticky top-0 z-50">
//         <div className="flex items-center gap-2 me-4 relative">
//           <Search size={18} className="absolute me-4 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="border rounded-md pl-8 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
//         </div>
//         <button
//           onClick={() => setModalOpen(true)}
//           className="px-5 py-1 font-xl me-8 bg-indigo-500 text-white text-lg rounded-lg shadow-md hover:bg-indigo-600"
//         >
//           Upload
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex ms-16 mt-4 flex-col md:flex-row w-full p-4 gap-4 relative">
//         {/* Modal */}
//         {modalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//             <div className="bg-white p-6 rounded-xl shadow-2xl w-96 relative">
//               <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800">Select Batch</h2>
//               <div className="flex flex-col gap-4">
//               <button
//   className="p-3 bg-gray-100 text-gray-800 text-lg font-semibold rounded-lg shadow-md hover:bg-gradient-to-r from-indigo-100 to-indigo-500 transition-all duration-300"
//   onClick={() => setFileBatch("Pro")}
// >
//   Pro
// </button>
// <button
//   className="p-3 bg-gray-100 text-gray-800 text-lg font-semibold rounded-lg shadow-md hover:bg-gradient-to-r from-indigo-100 to-indigo-500 transition-all duration-300"
//   onClick={() => setFileBatch("Classic")}
// >
//   Classic
// </button>
// <button
//   className="p-3 bg-gray-100 text-gray-800 text-lg font-semibold rounded-lg shadow-md hover:bg-gradient-to-r from-indigo-100 to-indigo-500 transition-all duration-300"
//   onClick={() => setFileBatch("Basic")}
// >
//   Basic
// </button>

//                 <button
//                   className="p-3 bg-gray-200 text-gray-800 text-lg font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300"
//                   onClick={() => setModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Left Side: Batch Cards */}
//         <div className="w-full md:w-80 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
//           {batches.map((batch) => (
//             <div
//               key={batch.name}
//               className={`p-4 w-40 md:w-80 cursor-pointer shadow-md rounded-lg transition-all ${selectedBatch === batch.name ? "bg-blue-500 text-white" : "bg-white"}`}
//               onClick={() => setSelectedBatch(batch.name)}
//             >
//               <h2 className="text-xl font-bold">{batch.name}</h2>
//               <p>Total Students: {batch.students}</p>
//               <p>Completion: {batch.completion}</p>
//               <p>Last Update: {batch.lastUpdate}</p>
//               <p>Time Left: {batch.timeRemaining}</p>
//             </div>
//           ))}
//         </div>

//         {/* Right Side: Dynamic Content */}
//         <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 hover:z-[10] gap-4">
//           {/* Lecture Cards */}
//           {lectures.map((lecture, index) => (
//             <div key={index} className="p-4 shadow-md rounded-lg relative bg-white">
//               <h3 className="text-lg font-semibold">{lecture.title}</h3>
//               <p>{lecture.date}</p>
//               <button className="mt-2 px-4 py-2 bg-gray-200 rounded-md">Watch</button>
//               <button onClick={() => setMenuOpen(index === menuOpen ? null : index)} className="absolute top-2 right-2">
//                 <MoreVertical size={18} />
//               </button>
//               {menuOpen === index && (
//                 <div className="absolute top-8 right-2 bg-white shadow-lg p-2 rounded-md">
//                   <p className="cursor-pointer p-3 hover:text-red-500">Delete</p>
//                   <p className="cursor-pointer p-3 hover:text-gray-500">Archive</p>
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Material Cards */}
//           {materials.map((material, index) => (
//             <div key={index} className="p-4 shadow-md rounded-lg relative bg-white">
//               <h3 className="text-lg font-semibold">{material.name}</h3>
//               <p>Posted: {material.posted}</p>
//               <button onClick={() => setMenuOpen(index + lectures.length === menuOpen ? null : index + lectures.length)} className="absolute top-2 right-2">
//                 <MoreVertical size={18} />
//               </button>
//               {menuOpen === index + lectures.length && (
//                 <div className="absolute top-8 right-2 bg-white shadow-lg p-2 rounded-md">
//                   <p className="cursor-pointer hover:text-red-500">Delete</p>
//                   <p className="cursor-pointer hover:text-gray-500">Archive</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
