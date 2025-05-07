// src/components/admin/ai/AIToolsLayout.jsx (New File)

import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faListCheck, faFileAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Add relevant icons

function AIToolsLayout() {
    const location = useLocation();

    // Define Tabs for AI Tools
    const tabs = [
        { name: 'AI Course Generator', path: 'course-generator', icon: faWandMagicSparkles },
        { name: 'Manage AI Courses', path: 'manage-courses', icon: faListCheck },
        // --- Future AI Tabs ---
        // { name: 'AI Assignment Ideas', path: 'assignment-generator', icon: faClipboardList },
        // { name: 'AI Quiz Questions', path: 'quiz-generator', icon: faFileAlt },
    ];

    const activeTabClass = "border-indigo-500 text-indigo-600 bg-indigo-50";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50";

    return (
        <div className="p-4 mt-5 ms-10 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">AI Content Tools</h1>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 md:space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.path} // Relative to /admin/ai-tools
                            className={({ isActive }) =>
                                `group inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg ${isActive ? activeTabClass : inactiveTabClass}`
                            }
                        >
                            <FontAwesomeIcon icon={tab.icon} className={`mr-2 h-4 w-4 ...`} />
                            <span>{tab.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Content Area for the selected AI tool tab */}
            <div className="mt-4">
                <Outlet />
            </div>
        </div>
    );
}

export default AIToolsLayout;