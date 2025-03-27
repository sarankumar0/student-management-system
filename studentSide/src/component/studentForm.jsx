
import { useForm,} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import { FaIdBadge, FaUser, FaBriefcaseMedical, FaPhoneAlt, FaPercentage, FaCalendarAlt, FaBook, FaUniversity, FaHome, FaCity, FaUserGraduate } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";


const schema = yup.object().shape({
  rollNo: yup.string().required("Roll No is required"),
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().matches(/^\d{10}$/, "Phone must be 10 digits").required(),
  marks: yup.number().positive().integer().required("Marks are required"),
  enrollmentDate: yup.date().required("Enrollment date is required"),
  department: yup.string().required("Department is required"),
  course: yup.string().required("Course Name is required"),
yearOfStudy: yup.number().positive().integer().required("Year of Study is required"),
prevQualification: yup.string().required("Previous Qualification is required"),
prevMarks: yup.number().positive().integer().required("Previous Marks are required"),
permAddress: yup.string().required("Permanent Address is required"),
currAddress: yup.string().required("Current Address is required"),
city: yup.string().required("City is required"),
state: yup.string().required("State is required"),
zip: yup.string().required("ZIP Code is required"),
country: yup.string().required("Country is required"),
fatherName: yup.string().required("Father's Name is required"),
motherName: yup.string().required("Mother's Name is required"),
guardianContact: yup.string().matches(/^\d{10}$/, "Guardian Contact must be 10 digits").required(),
parentOccupation: yup.string().required("Parent Occupation is required"),
aadharNumber: yup.string().required("Aadhar Number is required"),
category: yup.string().required("Category is required"),
medicalCondition: yup.string().notRequired(),
// hostelRequired: yup.string().required("Hostel selection is required"),
// transportRequired: yup.string().required("Transport selection is required"),
aadhar: yup.mixed().required("Aadhar card upload is required"),
image: yup.mixed().required("Profile image upload is required"),
});


const StudentEnrollmentForm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const existingStudent = location.state?.student || null;

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Prefill the form if editing an existing student
  useEffect(() => {
    if (existingStudent) {
      Object.keys(existingStudent).forEach((key) => {
        setValue(key, existingStudent[key]); // Update form values dynamically
      });
    }
  }, [existingStudent, setValue]);

  const onSubmit = async (data) => {
    try {
      if (existingStudent) {
        console.log(existingStudent);
        await axios.put(`http://localhost:5000/api/students/${existingStudent._id}`, data);
        alert("Student updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/students", data);
        alert("Student added successfully!");
      }
  
      reset(); 
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    }
  };
    
  const fields = [
    { name: "rollNo", label: "Roll No", icon: <FaIdBadge />, type: "text" },
    { name: "name", label: "Name", icon: <FaUser />, type: "text" },
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
const parentFields = [
  { name: "fatherName", label: "Father's Name", icon : <FaUserGraduate />, type: "text" },
  { name: "motherName", label: "Mother's Name", icon: <FaUser Graduate />, type: "text" },
  { name: "guardianContact", label: "Guardian Contact", icon: <FaPhoneAlt />, type: "text" },
  { name: "parentOccupation", label: "Parent Occupation", icon: <FaBriefcaseMedical />, type: "text" },
];
const addressFields = [
  { name: "permAddress", label: "Permanent Address", icon: <FaHome />, type: "text" },
  { name: "currAddress", label: "Current Address", icon: <FaHome />, type: "text" },
  { name: "city", label: "City", icon: <FaCity />, type: "text" },
  { name: "state", label: "State", icon: <MdLocationOn />, type: "text" },
  { name: "zip", label: "ZIP Code", icon: <MdLocationOn />, type: "text" },
  { name: "country", label: "Country", icon: <MdLocationOn />, type: "text" },
];

const additionalFields = [
  { name: "aadharNumber", label: "Aadhar Number", icon: <FaIdBadge />, type: "text" },
  { name: "category", label: "Category", icon: <FaUser Graduate />, type: "text" },
  { name: "medicalCondition", label: "Medical Condition", icon: <FaBriefcaseMedical />, type: "text" },
];

  return (
      <div className=" max-w-full ms-20 p-6 mt-10">
        <Breadcrumbs />
        <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">
          Add New Student <FaUserGraduate className="text-3xl" />
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {fields.map(({ name, label, icon, type }) => (
            <div key={name} className="relative">
              <span className="absolute left-3 top-4 text-gray-500 text-lg">
              {/* top-1/2 -translate-y-1/2 */}
                {icon}
              </span>
    
              <input
                type={type}
                {...register(name)}
                className="peer w-full pl-12 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder=" "
              />
    
              <label
                className={`absolute left-10   px-1 bg-white transition-all duration-300 
                  transform -translate-y-3 scale-100 origin-top-left 
                  peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                  peer-focus:-translate-y-3 peer-focus:scale-100 peer-focus:text-sm peer-focus:text-indigo-500
                  peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-indigo-500
                  ${errors[name] ? "text-red-500" : ""}`}
              >
                {label}
              </label>
    
              <p className="text-red-500">{errors[name]?.message}</p>
            </div>
          ))}
          <div className="sm:col-span-2">
            <select
              {...register("department")}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Department (CSE/ECE/etc..)</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
            </select>
            <p className="text-red-500">{errors.department?.message}</p>
          </div>
          <h3 className="text-lg font-semibold col-span-full">Academic Details</h3>
          {academicFields.map(({ name, label, icon, type }) => (
            <div key={name} className="relative">
              <span className="absolute left-3 top-3 text-gray-500 text-lg">
                {icon}
              </span>
    
              <input
                type={type}
                {...register(name)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none"
                placeholder=" "
              />
    
              <label
                className={`absolute left-10 px-1 bg-white transition-all duration-300 
                  transform -translate-y-3 scale-100 origin-top-left 
                  peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                  peer-focus:-translate-y-3 peer-focus:scale-100 peer-focus:text-sm peer-focus:text-indigo-500
                  peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-indigo-500
                  ${errors[name] ? "text-red-500" : ""}`}
              >
                {label}
              </label>
    
              <p className="text-red-500">{errors[name]?.message}</p>
            </div>
          ))}
          <h3 className="text-lg font-semibold col-span-full">Address Details</h3>
          {addressFields.map(({ name, label, icon, type }) => (
            <div key={name} className="relative">
              <span className="absolute left-3 top-3 text-gray-500 text-lg">
                {icon}
              </span>
    
              <input
                type={type}
                {...register(name)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none"
                placeholder=" "
              />
    
              <label
                className={`absolute left-10 px-1 bg-white transition-all duration-300 
                  transform -translate-y-3 scale-100 origin-top-left 
                  peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                  peer-focus:-translate-y-3 peer-focus:scale-100 peer-focus:text-sm peer-focus:text-indigo-500
                  peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-indigo-500
                  ${errors[name] ? "text-red-500" : ""}`}
              >
                {label}
              </label>
    
              <p className="text-red-500">{errors[name]?.message}</p>
            </div>
          ))}
          <h3 className="text-lg font-semibold col-span-full">Parent Details</h3>
          {parentFields.map(({ name, label, icon, type }) => (
            <div key={name} className="relative">
              <span className="absolute left-3 top-3 text-gray-500 text-lg">
                {icon}
              </span>
    
              <input
                type={type}
                {...register(name)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none"
                placeholder=" "
              />
    
              <label
                className={`absolute left-10 px-1 bg-white transition-all duration-300 
                  transform -translate-y-3 scale-100 origin-top-left 
                  peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                  peer-focus:-translate-y-3 peer-focus:scale-100 peer-focus:text-sm peer-focus:text-indigo-500
                  peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-indigo-500
                  ${errors[name] ? "text-red-500" : ""}`}
              >
                {label}
              </label>
    
              <p className="text-red-500">{errors[name]?.message}</p>
            </div>
          ))}
          <h3 className="text-lg font-semibold col-span-full">Other Details</h3>
          {additionalFields.map(({ name, label, icon, type }) => (
            <div key={name} className="relative">
              <span className="absolute left-3 top-3 text-gray-500 text-lg">
                {icon}
              </span>
    
              <input
                type={type}
                {...register(name)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 peer outline-none"
                placeholder=" "
              />
    
              <label
                className={`absolute left-10 px-1 bg-white transition-all duration-300 
                  transform -translate-y-3 scale-100 origin-top-left 
                  peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                  peer-focus:-translate-y-3 peer-focus:scale-100 peer-focus:text-sm peer-focus:text-indigo-500
                  peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-indigo-500
                  ${errors[name] ? "text-red-500" : ""}`}
              >
                {label}
              </label>
    
              <p className="text-red-500">{errors[name]?.message}</p>
            </div>
          ))}
<div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Transport Required */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700">Transport Required</label>
    <select
      {...register("transportRequired")}
      className="p-3 w-full border rounded-lg focus:ring-2 focus:ring-indigo-400"
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
    <p className="text-red-500">{errors.transportRequired?.message}</p>
  </div>

  {/* Hostel Required */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700">Hostel Required</label>
    <select
      {...register("hostelRequired")}
      className="p-3 w-full border rounded-lg focus:ring-2 focus:ring-indigo-400"
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
    <p className="text-red-500">{errors.hostelRequired?.message}</p>
  </div>

  {/* Aadhar Card */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700">Aadhar Card</label>
    <input
      type="file"
      {...register("aadhar")}
      className="p-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-400"
      accept=".pdf,.jpg,.jpeg,.png"
    />
    <p className="text-red-500">{errors.aadhar?.message}</p>
  </div>

  {/* Profile Image */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700">Profile Image</label>
    <input
      type="file"
      {...register("image")}
      className="p-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-400"
      accept="image/*"
    />
    <p className="text-red-500">{errors.image?.message}</p>
  </div>
</div>
<div className="sm:col-span-full ml-10 flex justify-end ">
         <button  type="submit" className="px-6 py-2 mx-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
           Submit
         </button>
         <button  onClick={() => reset()}  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
           Cancel
         </button>
       </div>
      </form>
    </div>
  );
};

export default StudentEnrollmentForm;





