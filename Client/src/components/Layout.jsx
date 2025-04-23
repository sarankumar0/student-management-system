import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./NavBar";
import { useState,useEffect } from "react";
import ChatBotWidget from "./chatbot/ChatBotWidget" // Adjust path if needed

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  useEffect(() => {
    console.log("Updated isCollapsed state:", isCollapsed);
  }, [isCollapsed]);


  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
         <main
          className={`p-6 transition-all duration-700 w-full`}
          style={{
            marginLeft: isCollapsed ? "5px" : "135px", 
          }}
        >
          <Outlet />
        </main>
        </div>
      <ChatBotWidget />
    </div>

  );
};

export default Layout;

