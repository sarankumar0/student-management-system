// src/components/common/DataTable.jsx
import React from 'react';

// Define expected props (using comments for JS, or interfaces for TS)
// interface ColumnDef<T> {
//   header: string;
//   accessorKey?: keyof T; // Optional: simple key access
//   cell?: (row: T, index: number) => React.ReactNode; // Custom cell rendering
//   id?: string; // Unique key for the column (optional, defaults to header)
//   headerClassName?: string; // Optional: Extra classes for TH
//   cellClassName?: string;   // Optional: Extra classes for TD
// }
// interface DataTableProps<T> {
//   columns: ColumnDef<T>[];
//   data: T[];
//   isLoading?: boolean;
//   error?: string | null;
//   keyField?: keyof T | string; // Field to use for unique row key (e.g., '_id')
//   wrapperClassName?: string; // Optional: classes for the outer div
// }

function DataTable({
  columns,
  data,
  isLoading = false,
  error = null,
  keyField = '_id', // Default to '_id' common in MongoDB
  wrapperClassName = "overflow-x-auto shadow-md sm:rounded-lg", // Default wrapper styles
}) {

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    // Use colSpan based on the number of columns for correct layout
    const colSpan = columns.length > 0 ? columns.length : 1;
    return (
      <div className={wrapperClassName}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id || column.header}
                  scope="col"
                  // Base styles + optional custom header classes
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             <tr>
               <td colSpan={colSpan} className="px-4 py-4 text-center text-gray-500">
                 No data available.
               </td>
             </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Function to get a unique key for each row
  const getRowKey = (row, index) => {
    // Try to use the specified keyField
    if (keyField && typeof keyField === 'string' && row[keyField]) {
      return row[keyField];
    }
    // Fallback to index if keyField doesn't work
    return index;
  };


  return (
    <div className={wrapperClassName}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id || column.header}
                scope="col"
                // Merge base styles with optional custom header classes
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.headerClassName || ''}`}
                // Example: Apply text-center if specified
                style={ column.headerClassName?.includes('text-center') ? { textAlign: 'center' } : {} }
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  // Use column id/header and row index for cell key
                  key={`${column.id || column.header}-${colIndex}`}
                  // Merge base styles with optional custom cell classes
                  className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${column.cellClassName || ''}`}
                   // Example: Apply text-center if specified
                   style={ column.cellClassName?.includes('text-center') ? { textAlign: 'center' } : {} }
                   >
                  {/* Render cell content */}
                  {column.cell
                    ? column.cell(row, rowIndex) // Use custom renderer
                    : column.accessorKey // Check if accessorKey exists
                    ? <span className="text-gray-700">{row[column.accessorKey]}</span> // Use accessorKey
                    : null // Fallback if neither cell nor accessorKey is provided
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;