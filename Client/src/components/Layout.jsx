import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./NavBar";
import { useState,useEffect } from "react";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  useEffect(() => {
    console.log("Updated isCollapsed state:", isCollapsed);
  }, [isCollapsed]);


  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
         <main
          className={`p-6 transition-all duration-200 w-full`}
          style={{
            marginLeft: isCollapsed ? "5px" : "150px", // ✅ Adjusts near sidebar
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

