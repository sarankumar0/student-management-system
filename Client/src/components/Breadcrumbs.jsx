import { Link } from "react-router-dom";

const Breadcrumbs = () => {
  return (
    <nav className="text-md text-gray-500 mb-6 ml-2 sm:ml-4">
      <ol className="flex items-center space-x-2">
        {/* Table Link */}
        <li className="flex items-center">
          <Link to="/admin/Students" className="text-indigo-500 hover:underline">
            Cancel form
          </Link>
          <span className="mx-1 text-gray-400">{">"}</span>
        </li>

        {/* Student Form Text */}
        <li>
          <span className="text-gray-600">Student Form</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
