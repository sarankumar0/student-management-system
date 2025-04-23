// src/components/admin/TestSectionLayout.jsx (New Component)
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import AdminQuizList from '../AdminQuizList';

function TestHome() {
    const activeClassName = "bg-indigo-100 text-indigo-700"; // Style for active link
    const inactiveClassName = "text-gray-600 hover:bg-gray-200 hover:text-gray-800";

  return (
    <div className="p-4 ms-12 mt-6 md:p-6"> {/* Padding for the whole test section */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Management</h1>

      {/* Sub-navigation for Add Test / View Results */}

      <div className="mb-6 border-b border-gray-300">
      
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
        <NavLink to="list" className={({ isActive }) =>
               `whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm rounded-t-md ${isActive ? `border-indigo-500 ${activeClassName}` : `border-transparent ${inactiveClassName}`}`
             }
          >
             Manage Quiz
          </NavLink>
          {/* <NavLink
            to="add-test" // Relative path to '/admin/test/add-test'
            className={({ isActive }) =>
               `whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm rounded-t-md ${isActive ? `border-indigo-500 ${activeClassName}` : `border-transparent ${inactiveClassName}`}`
            }
          >
            Add New Test
          </NavLink> */}
          <NavLink
             to="results" // Relative path to '/admin/test/results'
             className={({ isActive }) =>
               `whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm rounded-t-md ${isActive ? `border-indigo-500 ${activeClassName}` : `border-transparent ${inactiveClassName}`}`
             }
          >
            View Results
          </NavLink>
          {/* Add more tabs here if needed */}
        </nav>
      </div>

      {/* Outlet renders the specific component (CreateQuizForm or Results Component) */}
      <Outlet />
    </div> 
  );
}

export default TestHome;