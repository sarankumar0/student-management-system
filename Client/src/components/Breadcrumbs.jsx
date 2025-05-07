// // Breadcrumbs.jsx (Simplified Text Version)

// import React from 'react';
// import { Link, useLocation } from "react-router-dom";

// const Breadcrumbs = () => {
//   const location = useLocation();
//   let pathnames = location.pathname.split("/").filter(Boolean); // Filter out empty strings

//   // Remove the 'admin' segment if it exists
//   if (pathnames.length > 0 && pathnames[0].toLowerCase() === "admin") {
//     pathnames = pathnames.slice(1); // Remove the first element ('admin')
//   }

//   // If after removing 'admin', there are no segments left, don't render anything
//   if (pathnames.length === 0) {
//     return null; // Or return a default link like Dashboard if needed
//   }

//   return (
//     <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6 ml-2 sm:ml-4">
//       <ol className="flex items-center space-x-2">
//         {pathnames.map((value, index) => {
//           // Construct the full path for the link (including /admin)
//           const to = `/admin/${pathnames.slice(0, index + 1).join("/")}`;
//           const isLast = index === pathnames.length - 1;

//           // Prepare display text (replace hyphens, capitalize)
//           const displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

//           return (
//             <li key={to} className="flex items-center">
//               {/* Add Separator (>) before every item except the first one */}
//               {index > 0 && (
//                 <span className="mx-2 text-gray-400">{">"}</span>
//               )}

//               {/* Render Link or Text */}
//               {!isLast ? (
//                 <Link
//                   to={to} // Link uses the full path
//                   className="text-indigo-600 hover:text-indigo-800 hover:underline"
//                 >
//                   {displayValue} {/* Display processed text */}
//                 </Link>
//               ) : (
//                 <span className="text-gray-700 font-medium" aria-current="page">
//                   {displayValue} {/* Display last item as non-linked text */}
//                 </span>
//               )}
//             </li>
//           );
//         })}
//       </ol>
//     </nav>
//   );
// };

// export default Breadcrumbs;

import React from 'react';
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  // 1. Get all path segments
  let allPathnames = location.pathname.split("/").filter(Boolean); // Filter out empty strings

  // 2. Remove the initial 'admin' segment if present
  if (allPathnames.length > 0 && allPathnames[0].toLowerCase() === "admin") {
    allPathnames = allPathnames.slice(1);
  }

  // 3. Optional: Filter out trailing IDs (e.g., numeric or UUIDs)
  //    Adjust the regex if your IDs have a different format (e.g., UUID)
  let pathSegmentsForDisplay = [...allPathnames];
  if (
    pathSegmentsForDisplay.length > 0 &&
    /^\d+$/.test(pathSegmentsForDisplay[pathSegmentsForDisplay.length - 1]) // Checks if last segment is purely numeric
     // Add other checks like UUID if needed: || /^[0-9a-fA-F]{8}-.../.test(lastSegment)
     ) {
    pathSegmentsForDisplay = pathSegmentsForDisplay.slice(0, -1); // Remove the last segment if it looks like an ID
  }

  // 4. Determine the segments to actually render (max last two)
  const segmentsToRender = pathSegmentsForDisplay.slice(-2);

  // 5. If no segments are left to render, return null
  if (segmentsToRender.length === 0) {
    return null;
  }

  // 6. Calculate the starting index in the *original* `allPathnames`
  //    This helps map the limited render loop back to the full path for links.
   // Example: allPathnames = ['users', 'edit', '123'], segmentsToRender = ['users', 'edit'] -> length 2
   // startIndex should be allPathnames.length(3) - segmentsToRender.length(2) = 1. (Incorrect logic here)
   // Let's rethink: We need to iterate through `allPathnames` but skip rendering the early ones.

   // Find the index of the *first segment we want to render* within `allPathnames`
   let startIndex = 0;
   if (allPathnames.length > segmentsToRender.length) {
     startIndex = allPathnames.findIndex(path => path === segmentsToRender[0]);
     // Handle cases where findIndex might fail unexpectedly, default to showing last two logical segments
     if (startIndex === -1) {
       startIndex = Math.max(0, allPathnames.length - segmentsToRender.length);
     }
   }

   // If after ID filtering, the path becomes empty, handle it
   if (allPathnames.length > 0 && segmentsToRender.length === 0) {
       // This might happen if path was like /admin/users/123 -> leaves just 'users'
       // which might be okay, let's reconsider step 5 based on pathSegmentsForDisplay
       if (pathSegmentsForDisplay.length === 0) return null;
       // If pathSegmentsForDisplay still has items, recalculate segmentsToRender
       // This logic is getting complex, let's simplify the slice approach.

       // --- Simpler Slice Approach ---
       // Iterate only over the segmentsToRender, but calculate 'to' carefully
  }


  // --- Revised Simpler Approach ---

  // Iterate directly over the final segments we want to display
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6 ml-2 sm:ml-4">
      <ol className="flex items-center space-x-2">
        {segmentsToRender.map((value, index) => {
          const isLast = index === segmentsToRender.length - 1;

          // Calculate the correct 'to' path using the original `allPathnames`
          // Find the position of the current 'value' in the original path to link correctly
          // This requires knowing how many original segments correspond to this displayed segment
          const originalSegmentsCount = allPathnames.length - segmentsToRender.length + index + 1;
          const to = `/admin/${allPathnames.slice(0, originalSegmentsCount).join("/")}`;


          // Prepare display text (replace hyphens, capitalize)
          const displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          return (
            <li key={to + index} className="flex items-center"> {/* Added index to key for robustness */}
              {/* Add Separator (>) before every item except the first one */}
              {index > 0 && (
                <span className="mx-2 text-gray-400">{">"}</span>
              )}

              {/* Render Link or Text */}
              {!isLast ? (
                <Link
                  to={to} // Link uses the carefully calculated path
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {displayValue}
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