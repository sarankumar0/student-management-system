// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useUser } from "../context/UserContext"; // Assuming you're using a global user context

// const Profile = () => {
//   const { user } = useUser();
//   const [studentData, setStudentData] = useState(null);

//   useEffect(() => {
//     if (user && user.registrationNumber) {
//       axios
//         .get(`http://localhost:5000/api/students/${user.registrationNumber}`, { withCredentials: true })
//         .then((response) => {
//           setStudentData(response.data);
//         })
//         .catch((error) => console.error("Error fetching student data:", error));
//     }
//   }, [user]);

//   if (!studentData) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="bg-white shadow-lg rounded-2xl p-6 flex items-center w-[600px]">
//         <img
//           src={studentData.profileImg || "/default-profile.png"}
//           alt="Profile"
//           className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
//         />
//         <div className="ml-4">
//           <h2 className="text-lg font-semibold text-gray-900">{studentData.name}</h2>
//           <p className="text-sm text-gray-600">{studentData.role || "Student"}</p>
//           <p className="text-sm text-gray-500">{studentData.registrationNumber || "Reg No not available"}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import EditableCard from "./EditableCard";
import { Navigate, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useUser();
  const [studentData, setStudentData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.registrationNumber) {
      axios
        .get(`http://localhost:5000/api/students/${user.registrationNumber}`, { withCredentials: true })
        .then((response) => {
          setStudentData(response.data);  // ✅ Use setStudentData instead of updateStudentData
        })
        .catch((error) => console.error("Error fetching student data:", error));
    }
  }, [user]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(file);
    }
  };
  const handleEdit = (student) => {
    navigate("/studentForm", { state: { student } });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("profileImg", file);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/students/${user.registrationNumber}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      setStudentData((prev) => ({
        ...prev,
        profileImg: response.data.profileImg + `?t=${new Date().getTime()}`
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  const handleSave = async (updatedData) => {
    try {
      await updateStudent(user.registrationNumber, updatedData);
      setStudentData(updatedData);  // Update local state after successful API update
    } catch (error) {
      console.error("Error updating student data:", error);
    }
  };

  if (!studentData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen flex-col mt-10 bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 flex items-center w-[1200px] relative">
  {/* Profile Image Section */}
  <div className="relative w-24 h-24">
    <img
      src={studentData.profileImg || "/default-profile.png"}
      alt="Profile"
      className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
    />
    <label className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full cursor-pointer shadow">
      <FaCamera className="text-gray-600" />
      <input type="file" className="hidden" onChange={handleImageChange} />
    </label>
  </div>

  {/* Student Info Section */}
  <div className="ml-4">
    <h2 className="text-lg font-semibold text-gray-900">{studentData.name}</h2>
    <p className="text-sm text-gray-600">{studentData.role || "Student"}</p>
    <p className="text-sm text-gray-500">{studentData.registrationNumber || "Reg No not available"}</p>
  </div>

  {/* Edit Button (Top Right) */}
  <button 
    onClick={() => handleEdit(studentData)} 
    className="absolute top-4 right-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition"
  >
    Edit Whole Form
  </button>
</div>


      <div className="p-5 space-y-6 w-[1200px]">
      {/* Personal Information */}
      <EditableCard
        title="Personal Information"
        fields={[
          { name: "rollNo", label: "Roll No", type: "text" },
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text" },
        ]}
        data={studentData}
        onSave={handleSave}
      />

      {/* Academic Details */}
      <EditableCard
        title="Academic Details"
        fields={[
          { name: "course", label: "Course Name", type: "text" },
          { name: "yearOfStudy", label: "Year of Study", type: "number" },
          { name: "prevQualification", label: "Previous Qualification", type: "text" },
          { name: "prevMarks", label: "Marks in Previous Qualification", type: "number" },
        ]}
        data={studentData}
        onSave={handleSave}
      />

      {/* Parent/Guardian Information */}
      <EditableCard
        title="Parent/Guardian Information"
        fields={[
          { name: "fatherName", label: "Father's Name", type: "text" },
          { name: "motherName", label: "Mother's Name", type: "text" },
          { name: "guardianContact", label: "Guardian Contact", type: "text" },
          { name: "parentOccupation", label: "Parent Occupation", type: "text" },
        ]}
        data={studentData}
        onSave={handleSave}
      />

      {/* Address Details */}
      <EditableCard
        title="Address Details"
        fields={[
          { name: "permAddress", label: "Permanent Address", type: "text" },
          { name: "currAddress", label: "Current Address", type: "text" },
          { name: "city", label: "City", type: "text" },
          { name: "state", label: "State", type: "text" },
          { name: "zip", label: "ZIP Code", type: "text" },
          { name: "country", label: "Country", type: "text" },
        ]}
        data={studentData}
        onSave={handleSave}
      />

      {/* Additional Information */}
      <EditableCard
        title="Additional Information"
        fields={[
          { name: "aadharNumber", label: "Aadhar Number", type: "text" },
          { name: "category", label: "Category", type: "text" },
          { name: "medicalCondition", label: "Medical Condition", type: "text" },
        ]}
        data={studentData}
        onSave={handleSave}
      />
    </div>
    </div>
  );
};

export default Profile;





{/* <div className="flex flex-col items-center space-y-6 p-6">
{/* Personal Information Card 
<div className="bg-white shadow-lg rounded-2xl p-6 w-[600px]">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
  <div className="space-y-3">
    {[{ name: "rollNo", label: "Roll No", icon: <FaIdBadge /> },
      { name: "name", label: "Name", icon: <FaUser /> },
      { name: "email", label: "Email", icon: <MdEmail /> },
      { name: "phone", label: "Phone", icon: <FaPhoneAlt /> },
      { name: "marks", label: "Marks", icon: <FaPercentage /> },
      { name: "enrollmentDate", label: "Enrollment Date", icon: <FaCalendarAlt /> }].map((field) => (
      <div key={field.name} className="flex items-center space-x-3">
        <div className="text-gray-600">{field.icon}</div>
        <p className="text-gray-800 font-medium">{field.label}: {studentData[field.name] || "N/A"}</p>
      </div>
    ))}
  </div>
</div>

{/* Academic Information Card 
<div className="bg-white shadow-lg rounded-2xl p-6 w-[600px]">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
  <div className="space-y-3">
    {[{ name: "course", label: "Course Name", icon: <FaBook /> },
      { name: "yearOfStudy", label: "Year of Study", icon: <FaCalendarAlt /> },
      { name: "prevQualification", label: "Previous Qualification", icon: <FaUniversity /> },
      { name: "prevMarks", label: "Marks in Previous Qualification", icon: <FaPercentage /> }].map((field) => (
      <div key={field.name} className="flex items-center space-x-3">
        <div className="text-gray-600">{field.icon}</div>
        <p className="text-gray-800 font-medium">{field.label}: {studentData[field.name] || "N/A"}</p>
      </div>
    ))}
  </div>
</div>
</div> */}