import { Outlet } from "react-router-dom";

import Header from "./Header";
import StudentSidebar from "./StudentSideBar";


const Layout = () => {
  return (
    <div className="flex h-screen">
      <div className="fixed left-0 top-0 h-screen w-20 bg-gray-900 text-white z-50">
        <StudentSidebar/>
      </div>
      <div className="flex flex-col flex-1 ml-20">
        <div className="fixed top-0 w-[calc(100%-5rem)]  bg-white z-40 shadow-md">
          <Header pageTitle="Dashboard" />
        </div>
        <div className="mt-14  bg-gray-100 min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
