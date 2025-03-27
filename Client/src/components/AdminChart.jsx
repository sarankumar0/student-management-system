import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import ChartComponent from "./ChartComponent";

const AdminCharts = () => {
    const [pieData, setPieData] = useState({ series: [], labels: [] });
    const [barData, setBarData] = useState({ categories: [], series: [] });

    useEffect(() => {
        // Fetch Pie Chart Data (User Plans Count)
        axios.get("http://localhost:5000/api/auth/count-by-plan", { withCredentials: true })
            .then(response => {
                setPieData({
                    series: Object.values(response.data),
                    labels: Object.keys(response.data)
                });
            })
            .catch(error => console.error("Error fetching pie chart data:", error));

        // Fetch Bar Chart Data (User Login Stats)
        axios.get("http://localhost:5000/api/auth/login-stats", { withCredentials: true })
            .then(response => {
                setBarData({
                    categories: Object.keys(response.data),
                    series: [{ name: "Logins", data: Object.values(response.data) }]
                });
            })
            .catch(error => console.error("Error fetching bar chart data:", error));
    }, []);

    const donutChartData = {
        type: "donut",
        title:"",
        categories: ["Python", "JavaScript", "Java", "Oracle"],
        series: [40, 30, 15, 10], // Adjust the values as needed
    };

    return (
        <div className="bg-white mt-10 ms-10 p-6 rounded-lg shadow-2xl">
    <h1 className="text-2xl font-bold mb-6">Academic Overview</h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white shadow-lg rounded-lg  flex flex-col items-center" style={{ height: "300px", width: "90%" }}>
            <h2 className="text-xl font-bold mb-4">User Subscription Plans</h2>
            <Chart options={{ labels: pieData.labels }} series={pieData.series} type="pie" width="100%" height="250px" />
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow-lg rounded-lg  flex flex-col items-center" style={{ height: "300px", width: "90%" }}>
            <h2 className="text-xl font-bold mb-4">Daily Logins</h2>
            <Chart options={{ xaxis: { categories: barData.categories } }} series={barData.series} type="bar" width="100%" height="250px" />
        </div>

        {/* Donut Chart */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center" style={{ height: "300px", width: "90%" }}>
            <h2 className="text-xl font-bold mb-4">Student Performance</h2>
            <ChartComponent {...donutChartData} />
        </div>
    </div>
</div>

    );
};

export default AdminCharts;