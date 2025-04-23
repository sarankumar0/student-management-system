import React, { useState, useEffect, useCallback } from "react";
import Chart from "react-apexcharts"; // Using react-apexcharts
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faChevronLeft, faChevronRight, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'; // Added arrow icons

const AdminCharts = () => {
    // --- State Definitions ---
    const [pieOptions, setPieOptions] = useState({
        chart: { type: 'pie' },
        labels: [], // Initial empty labels
        responsive: [{ breakpoint: 480, options: { chart: { width: 250 }, legend: { position: 'bottom' } } }],
        dataLabels: { enabled: true, formatter: function (val, opts) { return opts.w.config.series[opts.seriesIndex]?.toFixed(0) || 0 } },
        legend: { position: 'bottom' }
    });
    const [pieSeries, setPieSeries] = useState([]);

    const [dailyLoginData, setDailyLoginData] = useState([]); // Raw daily data fetched from API
    const [barChartRange, setBarChartRange] = useState('day'); // 'day', 'month', 'year'
    const [currentPeriodEndDate, setCurrentPeriodEndDate] = useState(new Date()); // End date for the current view range
    const [barOptions, setBarOptions] = useState({
        chart: { type: 'bar', height: 250, toolbar: { show: false } }, // Hide default toolbar
        xaxis: {
            categories: [],
            title: { text: 'Period' }
        },
        yaxis: { title: { text: 'Logins' } },
        plotOptions: { bar: { horizontal: false } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: function (val) { return val + " logins" } } }
    });
    const [barSeries, setBarSeries] = useState([{ name: 'Logins', data: [] }]); // ApexCharts expects series as an array of objects

    const [loadingCharts, setLoadingCharts] = useState(true);
    const [chartError, setChartError] = useState(null);

    // --- Effect 1: Fetch RAW data from API on Component Mount ---
    useEffect(() => {
        console.log("--- Fetch Effect Running ---");
        let isMounted = true; // Flag to prevent state update if component unmounts
        setLoadingCharts(true);
        setChartError(null);
        // Reset states before fetching
        setPieSeries([]); setPieOptions(prev => ({ ...prev, labels: [] }));
        setDailyLoginData([]); setBarSeries([{ name: 'Logins', data: [] }]);
        setBarOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: [] } }));

        const fetchChartData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                if (isMounted) {
                    setChartError("Authentication required.");
                    setLoadingCharts(false);
                }
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const [pieResponse, barResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/stats/count-by-plan', config),
                    axios.get('http://localhost:5000/api/stats/login-stats', config)
                ]);

                if (!isMounted) return; // Don't update state if component unmounted

                // Process Pie Data
                if (pieResponse.data) {
                    console.log("Raw Pie data received:", pieResponse.data);
                    const pieData = pieResponse.data;
                    const desiredOrder = ['basic', 'classic', 'pro'];
                    const labels = desiredOrder.map(key => key.charAt(0).toUpperCase() + key.slice(1));
                    const series = desiredOrder.map(key => pieData[key] || 0);
                    setPieSeries(series);
                    setPieOptions(prev => ({ ...prev, labels: labels }));
                } else { console.warn("No Pie data"); }

                // Store RAW Daily Login Data
                if (barResponse.data && Array.isArray(barResponse.data)) {
                    console.log("Raw Daily Login data received:", barResponse.data);
                    const sortedDailyData = barResponse.data
                        .filter(item => item.date && typeof item.count === 'number')
                        .sort((a, b) => new Date(a.date) - new Date(b.date));
                    setDailyLoginData(sortedDailyData);
                } else { console.warn("No Daily Login data"); }

            } catch (error) {
                console.error("AdminCharts: Error fetching chart data:", error);
                if (isMounted) {
                    setChartError(error.response?.data?.message || error.message || "Failed to load chart data.");
                }
            } finally {
                // Loading is finished AFTER data is fetched and raw state is set
                if (isMounted) {
                    setLoadingCharts(false);
                    console.log("--- Fetch Effect Finished ---");
                }
            }
        };

        fetchChartData();

        // Cleanup function to set flag when component unmounts
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array means run once on mount

    // --- Effect 2: Process Daily Data whenever relevant state changes ---
    // useEffect(() => {
    //     // Prevent processing if initial data is still loading
    //     if (loadingCharts) {
    //         console.log("Processing Effect: Waiting for initial data load...");
    //         return;
    //     }

    //     console.log(`--- Processing Effect Triggered ---`);
    //     console.log(`Range: ${barChartRange}, EndDate: ${currentPeriodEndDate.toISOString().split('T')[0]}, Data Points: ${dailyLoginData.length}`);

    //     // Handle case where there's no data AFTER loading is done
    //     if (dailyLoginData.length === 0) {
    //         console.log("Processing Effect: No daily data available, resetting chart.");
    //         setBarSeries([{ name: 'Logins', data: [] }]);
    //         setBarOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: [] } }));
    //         return;
    //     }

    //     let categories = [];
    //     let seriesData = [];
    //     let xAxisTitle = 'Period'; // Default axis title
    //     const endDate = new Date(currentPeriodEndDate); // Use state for end date

    //     const endDateUTC = new Date(Date.UTC(
    //         currentPeriodEndDate.getUTCFullYear(),
    //         currentPeriodEndDate.getUTCMonth(),
    //         currentPeriodEndDate.getUTCDate()
    //     )); // Get UTC date part of the end date state
    //     // --- PROCESSING LOGIC PER RANGE ---
    //     if (barChartRange === 'day') {
    //         console.log("Processing 'day' range ending UTC:", endDateUTC.toISOString().split('T')[0]);
    //         const dateMap = new Map();
    //         dailyLoginData.forEach(item => {if(item.date) dateMap.set(item.date.split('T')[0], item.count);
    //     });
    //     console.log("Day range dateMap constructed:", dateMap);
    //         categories = []; seriesData = []; // Reset
    //         for (let i = 3; i >= 0; i--) { // Loop for 4 days ending on endDate
    //             const date = new Date(endDateUTC);
    //             date.setUTCDate(endDateUTC.getUTCDate() - i);
    //             const dateStringUTC = date.toISOString().split('T')[0]; // YYYY-MM-DD for map lookup
    //             const displayDate = date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }); // Format like "Apr 07"
    //             const count = dateMap.get(dateStringUTC) || 0;
    //             categories.push(displayDate);
    //             seriesData.push(count);
    //         }
    //         const displayDateLocal = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    //         const displayDateLabel = displayDateLocal.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });

    //         const count = dateMap.get(dateStringUTC) || 0; // Lookup using UTC date string
    //         categories.push(displayDateLabel);
    //         seriesData.push(count);
    //         console.log(` -> Checking UTC Date: ${dateStringUTC}, Display: ${displayDateLabel}, Found Count: ${count}`);
    //     }
    //     xAxisTitle = `Date (Ending ${endDateUTC.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`;

    //     } else if (barChartRange === 'month') {
    //         console.log("Processing 'month' range...");
    //         const targetYear = endDate.getFullYear(); // Use year from selected end date
    //         const monthlyCounts = {};
    //         dailyLoginData.forEach(item => {
    //             const itemDate = new Date(item.date);
    //             if (itemDate.getFullYear() === targetYear) {
    //                 const monthKey = String(itemDate.getMonth()).padStart(2, '0'); // 00-11 index
    //                 monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + item.count;
    //             }
    //         });
    //         const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //         categories = []; seriesData = []; // Reset
    //         for (let i = 0; i < 12; i++) {
    //             const monthKey = String(i).padStart(2, '0');
    //             categories.push(monthNames[i]);
    //             seriesData.push(monthlyCounts[monthKey] || 0);
    //         }
    //         xAxisTitle = `Month (${targetYearUTC})`;

    //     } else if (barChartRange === 'year') {
    //         console.log("Processing 'year' range...");
    //         const yearlyCounts = {};
    //         let minYear = Infinity, maxYear = -Infinity;
    //         dailyLoginData.forEach(item => {
    //             const year = new Date(item.date).getFullYear();
    //             yearlyCounts[year] = (yearlyCounts[year] || 0) + item.count;
    //             if (isFinite(year)) { // Ensure year is a number
    //                  minYear = Math.min(minYear, year);
    //                  maxYear = Math.max(maxYear, year);
    //              }
    //         });

    //         categories = []; seriesData = []; // Reset
    //         if (isFinite(minYear)) { // Check if any data was processed
    //             for (let y = minYear; y <= maxYear; y++) {
    //                 categories.push(y.toString());
    //                 seriesData.push(yearlyCounts[y] || 0);
    //             }
    //         }
    //         xAxisTitle = 'Year';
    //     }

    //     console.log(`Processed Categories:`, categories);
    //     console.log(`Processed Series Data:`, seriesData);

    //     // --- Update Chart State ---
    //     setBarSeries([{ name: 'Logins', data: seriesData }]);
    //     setBarOptions(prev => ({
    //         ...prev,
    //         xaxis: {
    //             ...prev.xaxis,
    //             categories: categories,
    //             title: { ...prev.xaxis?.title, text: xAxisTitle } // Update axis title
    //         }
    //     }));
    //     console.log(`--- Processing Effect Finished ---`);

    // // Dependencies: Run when raw data, selected range, end date, or loading state changes
    // }, [dailyLoginData, barChartRange, currentPeriodEndDate, loadingCharts]);

        // --- Effect 2: Process Daily Data whenever relevant state changes ---
        useEffect(() => {
            // Prevent processing if initial data is still loading
            if (loadingCharts) {
                console.log("Processing Effect: Waiting for initial data load...");
                // Optionally reset chart here if needed while loading
                // setBarSeries([{ name: 'Logins', data: [] }]);
                // setBarOptions(prev => ({ ...prev, xaxis: {...prev.xaxis, categories: []} }));
                return;
            }
    
            console.log(`--- Processing Effect Triggered ---`);
            console.log(`Range: ${barChartRange}, EndDate: ${currentPeriodEndDate.toISOString().split('T')[0]}, Data Points: ${dailyLoginData.length}`);
    
            // Handle case where there's no data AFTER loading is done
            if (dailyLoginData.length === 0) {
                console.log("Processing Effect: No daily data available, resetting chart.");
                setBarSeries([{ name: 'Logins', data: [] }]);
                setBarOptions(prev => ({ ...prev, xaxis: {...prev.xaxis, categories: []} }));
                return; // Exit early
            }
    
            // --- Initialize variables for processing ---
            let categories = [];
            let seriesData = [];
            let xAxisTitle = 'Period'; // Default axis title
            const endDate = new Date(currentPeriodEndDate); // Use state for end date
    
            // Create a Map for efficient lookup (key: 'YYYY-MM-DD', value: count)
            const dateMap = new Map();
            dailyLoginData.forEach(item => {
                // Ensure item.date is a valid string before splitting
                if (item.date && typeof item.date === 'string') {
                    dateMap.set(item.date.split('T')[0], item.count);
                }
            });
            console.log("Processing Effect: Date Map constructed:", dateMap);
    
            // --- PROCESSING LOGIC PER RANGE ---
            if (barChartRange === 'day') {
                console.log("Processing 'day' range...");
                // Use UTC date for calculations to match backend aggregation
                const endDateUTC = new Date(Date.UTC(
                    endDate.getUTCFullYear(),
                    endDate.getUTCMonth(),
                    endDate.getUTCDate()
                ));
    
                categories = []; // Reset for this range
                seriesData = []; // Reset for this range
                for (let i = 3; i >= 0; i--) { // Loop for 4 days ending on endDateUTC
                    const date = new Date(endDateUTC);
                    date.setUTCDate(endDateUTC.getUTCDate() - i); // Calculate past dates in UTC
    
                    const dateStringUTC = date.toISOString().split('T')[0]; // YYYY-MM-DD (UTC) for lookup
    
                    // Create a date object based on the UTC components for LOCALIZED display formatting
                    const displayDateLocal = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                    const displayDateLabel = displayDateLocal.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }); // e.g., "Apr 07"
    
                    const count = dateMap.get(dateStringUTC) || 0; // Lookup using UTC date string
                    categories.push(displayDateLabel);
                    seriesData.push(count);
                    console.log(` -> Checking UTC Date: ${dateStringUTC}, Display: ${displayDateLabel}, Found Count: ${count}`);
                }
                // Use local date for display in title
                // xAxisTitle = `Date (Ending ${endDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })})`;
    
            } else if (barChartRange === 'month') {
                console.log("Processing 'month' range...");
                const targetYear = endDate.getFullYear(); // Use year from state date
                const monthlyCounts = {}; // { 0: count, 1: count ... 11: count }
    
                // Aggregate counts per month for the targetYear
                dailyLoginData.forEach(item => {
                    // Ensure item.date is valid before creating Date object
                    if (item.date) {
                        try {
                            const itemDate = new Date(item.date);
                            // Check if Date object is valid
                            if (!isNaN(itemDate.getTime()) && itemDate.getFullYear() === targetYear) {
                                 const monthIndex = itemDate.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
                                 monthlyCounts[monthIndex] = (monthlyCounts[monthIndex] || 0) + item.count;
                             }
                        } catch(e) { console.error("Error parsing date:", item.date, e); }
                    }
                });
    
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                categories = []; // Reset
                seriesData = []; // Reset
                for (let i = 0; i < 12; i++) {
                    categories.push(monthNames[i]);
                    seriesData.push(monthlyCounts[i] || 0); // Use month index (0-11)
                }
                xAxisTitle = `Month (${targetYear})`;
    
            } else if (barChartRange === 'year') {
                console.log("Processing 'year' range...");
                const yearlyCounts = {}; // { 'YYYY': count }
                let minYear = Infinity, maxYear = -Infinity;
    
                dailyLoginData.forEach(item => {
                     if (item.date) {
                         try {
                             const year = new Date(item.date).getFullYear();
                             if (isFinite(year)) { // Check if year is valid number
                                 yearlyCounts[year] = (yearlyCounts[year] || 0) + item.count;
                                 minYear = Math.min(minYear, year);
                                 maxYear = Math.max(maxYear, year);
                             }
                         } catch(e) { console.error("Error parsing date:", item.date, e); }
                     }
                });
    
                categories = []; // Reset
                seriesData = []; // Reset
                if (isFinite(minYear) && isFinite(maxYear)) { // Check if any valid data was processed
                    for (let y = minYear; y <= maxYear; y++) {
                        categories.push(y.toString());
                        seriesData.push(yearlyCounts[y] || 0);
                    }
                }
                xAxisTitle = 'Year';
            }
    
            // --- Log final calculated data ---
            console.log(`Final Categories calculated: [${categories.join(', ')}]`);
            console.log(`Final Series Data calculated: [${seriesData.join(', ')}]`);
    
            // --- Update Chart State ---
            setBarSeries([{ name: 'Logins', data: seriesData }]);
            setBarOptions(prev => ({
                ...prev,
                xaxis: {
                    ...prev.xaxis, // Keep other xaxis settings like labels rotation etc.
                    categories: categories, // Update categories
                    title: { ...prev.xaxis?.title, text: xAxisTitle } // Update axis title
                }
            }));
            console.log(`--- Processing Effect Finished ---`);
    
        // --- Correct Dependencies ---
        // Run when raw data, selected range, end date, or loading state changes
        // Include state setters used inside (best practice for exhaustive-deps rule)
        }, [dailyLoginData, barChartRange, currentPeriodEndDate, loadingCharts, setBarOptions, setBarSeries]);

    // --- Handler for range dropdown ---
    const handleRangeChange = (event) => {
        setBarChartRange(event.target.value);
        // Optionally reset end date when range changes?
        setCurrentPeriodEndDate(new Date()); // Reset to today on range change
    };

    // --- Handler for Prev/Next arrows ---
    // Use useCallback as it's passed to buttons
    const handlePeriodChange = useCallback((direction) => {
        setCurrentPeriodEndDate(prevDate => {
            const newDate = new Date(prevDate);
            // Calculate the new date based on the CURRENTLY selected range
            if (barChartRange === 'day') {
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 4 : -4));
            } else if (barChartRange === 'month') {
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
            } else if (barChartRange === 'year') {
                newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
            }

            // Prevent navigating into the future beyond today
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set today to start of day for comparison
            if (newDate > today && direction === 'next') {
                console.log("Preventing navigation into the future.");
                return prevDate; // Keep the current date
            }
            return newDate;
        });
    }, [barChartRange]); // Dependency: Only need to recreate if barChartRange changes


    // --- Placeholder for Donut Chart ---
    const studentPerformanceOptions = {
        chart: { type: 'donut' },
        labels: ["Python", "JavaScript", "Java", "Oracle"],
        responsive: [{ breakpoint: 480, options: { chart: { width: 250 }, legend: { position: 'bottom' } } }],
        legend: { position: 'right' },
    };
    const studentPerformanceSeries = [42.1, 31.6, 15.8, 10.5];

    // --- JSX Render ---
    return (
        <div className="p-4 ms-10 md:p-6 rounded-lg bg-gray-50">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">Academic Overview</h1>

            {loadingCharts && (
                 <div className="text-center py-10 text-indigo-600">
                     <FontAwesomeIcon icon={faSpinner} spin size="2x" /> Loading chart data...
                 </div>
             )}
            {chartError && !loadingCharts && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                     <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2"/> Error: {chartError}
                 </div>
             )}

            {!loadingCharts && !chartError && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart Card */}
                    <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center h-[320px]">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">User Subscription Plans</h2>
                        {pieSeries.length > 0 ? (
                            <Chart options={pieOptions} series={pieSeries} type="pie" width="100%" height="250" />
                        ) : (<div className="flex-1 flex items-center justify-center text-gray-500">No data.</div>)}
                    </div>

                    {/* Bar Chart Card with Navigation */}
                    <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center h-[320px]">
                        <div className="w-full flex justify-between items-center mb-3">
                            {/* Arrow Buttons */}
                            <div className="flex items-center">
                                <button onClick={() => handlePeriodChange('prev')} className="p-1 text-gray-400 hover:text-indigo-600" title="Previous Period">
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <h2 className="text-lg font-semibold text-gray-800 mx-2">Logins</h2>
                                <button
                                    onClick={() => handlePeriodChange('next')}
                                    // Disable next button if the end date is today or later
                                    disabled={currentPeriodEndDate.setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
                                    className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Next Period"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                            {/* Dropdown */}
                            <select
                                value={barChartRange}
                                onChange={handleRangeChange}
                                className="text-xs border border-gray-300 rounded py-1 px-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="day">Last 4 Days</option>
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                            </select>
                        </div>
                        {/* Bar Chart */}
                        {(barSeries[0]?.data?.length ?? 0) > 0 ? (
                            <Chart options={barOptions} series={barSeries} type="bar" width="100%" height="250" />
                        ) : (<div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No login data for selected period.</div>)}
                    </div>

                    {/* Donut Chart Card (Static Data) */}
                    <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center h-[320px]">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Student Performance</h2>
                        <Chart options={studentPerformanceOptions} series={studentPerformanceSeries} type="donut" width="100%" height="250" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCharts;