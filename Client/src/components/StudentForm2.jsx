                   //Not in use ui is good take look


import { useNavigate } from "react-router-dom";
import  { useState, } from "react";
import { FaIdBadge, FaUser , FaBriefcaseMedical, FaPhoneAlt, FaPercentage, FaCalendarAlt, FaBook, FaUniversity, FaHome, FaCity, FaUserGraduate } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const StudentEnrollmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
  const savedData = localStorage.getItem("studentFormData");
    return savedData ? JSON.parse(savedData) : {
      rollNo: "", 
      name: "", 
      email: "",
      phone: "", marks: "", enrollmentDate: "", department: "",
      course: "", yearOfStudy: "", prevQualification: "", prevMarks: "", permAddress: "",
      currAddress: "", city: "", state: "", zip: "", country: "", fatherName: "", motherName: "", guardianContact: "",
      parentOccupation: "", aadharNumber: "", category: "", medicalCondition: "", hostelRequired: "",
      transportRequired: "", aadhar: "", image: "",
    };
  });
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0]?.name : value, // Store file name
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    alert("Form data saved successfully!");
    console.log("Saving to local storage:", formData);
  
    // Save the data to localStorage
    localStorage.setItem("studentFormData", JSON.stringify(formData));
  
    // Reset form fields without affecting localStorage
    setFormData({
      rollNo: "", 
      name: "", 
      email: "",
      phone: "", marks: "", enrollmentDate: "", department: "",
      course: "", yearOfStudy: "", prevQualification: "", prevMarks: "", permAddress: "",
      currAddress: "", city: "", state: "", zip: "", country: "", fatherName: "", motherName: "", guardianContact: "",
      parentOccupation: "", aadharNumber: "", category: "", medicalCondition: "", hostelRequired: "",
      transportRequired: "", aadhar: "", image: "",
    });
  
    // Optional: Delay navigation to ensure state update
    setTimeout(() => {
      navigate("/admin/students");
    }, 200);
  };
  

  const fields = [
    { name: "rollNo", label: "Roll No", icon: <FaIdBadge />, type: "text" },
    { name: "name", label: "Name", icon: <FaUser  />, type: "text" },
    { name: "email", label: "Email", icon: <MdEmail />, type: "email" },
    { name: "phone", label: "Phone", icon: <FaPhoneAlt />, type: "text" },
    { name: "marks", label: "Marks", icon: <FaPercentage />, type: "number" },
    { name: "enrollmentDate", label: "Enrollment Date", icon: <FaCalendarAlt />, type: "date" },
  ];

  const academicFields = [
    { name: "course", label: "Course Name", icon: <FaBook />, type: "text" },
    { name: "yearOfStudy", label: "Year of Study", icon: <FaCalendarAlt />, type: "number" },
    { name: "prevQualification", label: "Previous Qualification", icon: <FaUniversity />, type: "text" },
    { name: "prevMarks", label: "Marks in Previous Qualification", icon: <FaPercentage />, type: "number" },
  ];

  const addressFields = [
    { name: "permAddress", label: "Permanent Address", icon: <FaHome />, type: "text" },
    { name: "currAddress", label: "Current Address", icon: <FaHome />, type: "text" },
    { name: "city", label: "City", icon: <FaCity />, type: "text" },
    { name: "state", label: "State", icon: <MdLocationOn />, type: "text" },
    { name: "zip", label: "ZIP Code", icon: <MdLocationOn />, type: "text" },
    { name: "country", label: "Country", icon: <MdLocationOn />, type: "text" },
  ];

  const parentFields = [
    { name: "fatherName", label: "Father's Name", icon : <FaUserGraduate />, type: "text" },
    { name: "motherName", label: "Mother's Name", icon: <FaUser Graduate />, type: "text" },
    { name: "guardianContact", label: "Guardian Contact", icon: <FaPhoneAlt />, type: "text" },
    { name: "parentOccupation", label: "Parent Occupation", icon: <FaBriefcaseMedical />, type: "text" },
  ];

  const additionalFields = [
    { name: "aadharNumber", label: "Aadhar Number", icon: <FaIdBadge />, type: "text" },
    { name: "category", label: "Category", icon: <FaUser Graduate />, type: "text" },
    { name: "medicalCondition", label: "Medical Condition", icon: <FaBriefcaseMedical />, type: "text" },
    { name: "hostelRequired", label: "Hostel Required", icon: <FaHome />, type: "checkbox" },
    { name: "transportRequired", label: "Transport Required", icon: <FaHome />, type: "checkbox" },
    { name: "image", label: "Upload Image", icon: <FaUser Graduate />, type: "file" },
  ];

  return (
    <>
    <div className=" ms-20 p-6 mt-10">
     <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">
       Add New Student <FaUserGraduate className="text-3xl" />
     </h2>
     <form  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
       {fields.map(({ name, label,icon, type }) => (
      <div key={name} className="relative">
      <span className="absolute left-3 top-3 text-gray-500 text-lg">
        {icon}
      </span>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="peer w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        placeholder=" " // Needed for floating label effect
        required
      />
      <label
        className={`absolute left-10 px-1 bg-white transition-all duration-200 
        transform -translate-y-5 scale-75 origin-top-left 
        peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
        peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-sm peer-focus:text-indigo-500`}
      >
        {label}
      </label>
    </div>
       ))}
       <div className=" sm:col-span-2">
         <select
           name="department"
           value={formData.department}
           onChange={handleChange}
           className=" p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
           required
         >
           <option value="">Select Department(CSE/ECE/EEE/etc.. )</option>
           <option value="CSE">CSE</option>
           <option value="ECE">ECE</option>
           <option value="EEE">EEE</option>
           <option value="Mechanical">Mechanical</option>
         </select>
       </div>
       <h3 className=" text-lg font-semibold col-span-full">Academic Details</h3>
       {academicFields.map(({ name, label, icon, type}) => (
         <div key={name} className="relative">
           <span className="absolute left-3 top-3 text-gray-500 text-lg">{icon}</span>
           <input
           type={type}
             name={name}
             value={formData[name]}
             onChange={handleChange}
             className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none"
             required
           />
           <label
             className={`absolute left-10 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-indigo-500 bg-white px-1 ${formData[name] ? 'top-[-10px] text-sm text-indigo-500' : ''}`}
           >
             {label}
           </label>
         </div>
       ))}
       <h3 className="text-lg font-semibold col-span-full">Address Details</h3>
       {addressFields.map(({ name, label, icon,type }) => (
         <div key={name} className="relative">
           <span className="absolute left-3 top-3 text-gray-500 text-lg">{icon}</span>
           <input
             type={type}
             name={name}
             value={formData[name]}
             onChange={handleChange}
             className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none"
             required
           />
           <label
             className={`absolute left-10 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-indigo-500 bg-white px-1 ${formData[name] ? 'top-[-10px] text-sm text-indigo-500' : ''}`}
           >
             {label}
           </label>
         </div>
       ))}
       <h3 className="text-lg font-semibold col-span-full">Parent Details</h3>
   
       {parentFields.map(({ name, label, icon, type }) => (
         <div key={name} className="relative">
           <span className="absolute left-3 top-3 text-gray-500 text-lg">{icon}</span>
           <input
             type={type}
             name={name}
             value={formData[name]}
             onChange={handleChange}
             className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none`}
             required
           />
           <label
             className={`absolute left-10 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-indigo-500 bg-white px-1`}
           >
             {label}
           </label>
         </div>
       ))}
       
       <br/>
       <div className="sm:col-span-full flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/4">
    <label className="mb-1 font-semibold">Category(General/SC/ST/OBC/Other)</label>
    <select
      name="Category"
      value={formData.category}
      onChange={handleChange}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
      required
    >
      <option value="General">General</option>
      <option value="OBC">OBC</option>
      <option value="SC">SC</option>
      <option value="ST">ST</option>
      <option value="Others">Others</option>

    </select>
  </div>
  <div className="w-full sm:w-1/4">
    <label className="mb-1 font-semibold">Hostel Required?</label>
    <select
      name="hostelRequired"
      value={formData.hostelRequired}
      onChange={handleChange}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
      required
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  </div>
  <div className="w-full sm:w-1/4">
    <label className="mb-1 font-semibold">Transport Required?</label>
    <select
      name="transportRequired"
      value={formData.transportRequired}
      onChange={handleChange}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
      required
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  </div>
</div>
<h3 className="text-lg font-semibold col-span-full">Upload Documents</h3>
<div className="sm:col-span-1 mt-4">
  <label className="block mb-1 font-semibold">Upload Aadhar Card</label>
  <input
    type="file"
    accept="image/*,.pdf"
    name="aadhar"
 
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
    required
  />
</div>
<div className="sm:col-span-1 mt-4">
  <label className="block mb-1 font-semibold">Upload </label>
  <input
    type="file"
    accept="image/*,.pdf"
    name="Image"
    
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
    required
  />
</div>
       <div className="sm:col-span-full flex justify-end ">
         <button onClick={handleSubmit} className="px-6 py-2 mx-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
           Submit
         </button>
         <button  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
           Cancel
         </button>
       </div>
     </form>
     </div> 
  
    </>
  );
};
export default StudentEnrollmentForm;




