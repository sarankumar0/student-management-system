// Breadcrumbs.jsx (Simplified Text Version)

import React from 'react';
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  let pathnames = location.pathname.split("/").filter(Boolean); // Filter out empty strings

  // Remove the 'admin' segment if it exists
  if (pathnames.length > 0 && pathnames[0].toLowerCase() === "admin") {
    pathnames = pathnames.slice(1); // Remove the first element ('admin')
  }

  // If after removing 'admin', there are no segments left, don't render anything
  if (pathnames.length === 0) {
    return null; // Or return a default link like Dashboard if needed
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6 ml-2 sm:ml-4">
      <ol className="flex items-center space-x-2">
        {pathnames.map((value, index) => {
          // Construct the full path for the link (including /admin)
          const to = `/admin/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          // Prepare display text (replace hyphens, capitalize)
          const displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          return (
            <li key={to} className="flex items-center">
              {/* Add Separator (>) before every item except the first one */}
              {index > 0 && (
                <span className="mx-2 text-gray-400">{">"}</span>
              )}

              {/* Render Link or Text */}
              {!isLast ? (
                <Link
                  to={to} // Link uses the full path
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {displayValue} {/* Display processed text */}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium" aria-current="page">
                  {displayValue} {/* Display last item as non-linked text */}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;