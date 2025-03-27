import  { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const StudentWelcomeCard = () => {
    const { user } = useUser();
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        if (user && user.registrationNumber) {
            axios.get(`http://localhost:5000/api/students/${user.registrationNumber}`, { withCredentials: true })
                .then(response => {
                    setStudentData(response.data);
                })
                .catch(error => {
                    console.error("Error fetching student data:", error);
                });
        }
    }, [user]);

    if (!studentData) return <p className="text-center text-gray-500">Loading student details...</p>;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mx-auto mt-6">
            <h1 className="text-2xl font-bold text-gray-700">Welcome, {studentData.name} 👋</h1>
            <p className="text-gray-600">Course: <span className="font-semibold">{studentData.course}</span></p>
            <p className="text-gray-600">Batch: <span className="font-semibold">{studentData.batch}</span></p>
            <p className="text-gray-600">Email: <span className="font-semibold">{studentData.email}</span></p>
        </div>
    );
};

export default StudentWelcomeCard;
