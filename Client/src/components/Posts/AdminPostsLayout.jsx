// src/components/admin/posts/AdminPostsLayout.jsx (New File)

import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faBook, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'; // Example icons

function AdminPostsLayout() {
    const location = useLocation();

    // Define Tabs
    const tabs = [
        { name: 'Assignments', path: 'assignments', icon: faClipboardList },
        { name: 'Subjects', path: 'subjects', icon: faBook }, // For future use
        { name: 'Timetable', path: 'timetable', icon: faCalendarAlt }, // For future use
        // Add more content types here as needed
    ];

    // Style for active/inactive tabs (Tailwind classes)
    const activeTabClass = "border-indigo-500 text-indigo-600 bg-indigo-50";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50";

    return (
        <div className="p-4 ms-10 mt-8  md:p-6"> {/* Main padding for the content area */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Post Details</h1>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 md:space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            // Use relative path from the parent route (/admin/posts)
                            // Check if current location pathname ENDS with the tab path OR if it's the index route default
                            // Need careful matching if index route differs or edit routes exist under tabs
                            to={tab.path}
                            className={({ isActive }) =>
                                // A simple isActive works if routes are direct children.
                                // For index route mapping, might need location check.
                                // Let's start with simple isActive. Adjust if index matching fails.
                                `group inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg ${isActive ? activeTabClass : inactiveTabClass}`
                            }
                        >
                            <FontAwesomeIcon icon={tab.icon} className={`mr-2 h-4 w-4 ${location.pathname.includes(tab.path) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" />
                            <span>{tab.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Content Area for the selected tab */}
            {/* The Outlet renders the component matched by the nested route */}
            {/* e.g., renders ManageAssignments when route is /admin/posts/assignments */}
            <div className="mt-4">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminPostsLayout;