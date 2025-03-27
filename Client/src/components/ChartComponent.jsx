// import Chart from "react-apexcharts"; 

// const ChartComponent = ({ type, title, categories, series }) => {
//   const chartOptions = {
//     chart: {
//       type: type,
//       height: 350,
//       width: 350,
//     },
//     xaxis: type !== "pie" ? { categories } : { },
//     labels :type==="pie"?categories:[],
//     title: {
//       text: title,
//       align: "center",
//     },
//   };

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md w-full transform transition-transform duration-300">
//       <Chart options={chartOptions}  series={series} type={type} height={300} width={400}  />
//     </div>
//   );
// };

// export default ChartComponent;

import React from "react";
import Chart from "react-apexcharts";

const ChartComponent = ({ type, title, categories, series }) => {
  const options = {
    chart: {
      type: type || "donut",
      width: "100%",
    },
    labels: categories,
    responsive: [
      {
        breakpoint: 1024, // Tablets & smaller screens
        options: {
          chart: { width: 400 },
          legend: { position: "bottom" },
        },
      },
      {
        breakpoint: 768, // Mobile
        options: {
          chart: { width: 300 },
          legend: { position: "bottom" },
        },
      },
    ],
    title: {
      text: title,
      align: "center",
      style: { fontSize: "20px", fontWeight: "bold" },
    },
  };

  return (
    <div className="w-full flex justify-center">
     <Chart
      options={options}
      series={series}
      type="donut"
      width={window.innerWidth > 1024 ? 300 : "100%"} // Reduced width
      height={300} // Reduced height
    />
    </div>
  );
};

export default ChartComponent;

