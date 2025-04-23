import { useState,useEffect } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
const GuestNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); 
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); 
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <div className={`sticky top-0 left-0 w-full z-50 flex justify-between items-center p-4 ${
    isScrolled ? "bg-white shadow-md" : "bg-transparent"
  } transition-all duration-300`}>

        <div className="relative text-white text-xl font-bold hidden md:block">
          <img src="../../assets/elearning_13445589.png" alt="Logo" width="50px" />
        </div>
        <button
          className="md:hidden text-black text-2xl"
          onClick={() => setMenuOpen(true)}
        >
          <IoMdMenu />
        </button>

        <nav className="hidden md:flex space-x-10 text-grey-500 font-medium">
          {["Home", "About", "Pricing", "Contact"].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className={`relative group ${location.pathname === `/${item.toLowerCase()}` ? "text-indigo-400" : ""}`}
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-indigo-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="flex space-x-4  ">

          
          {location.pathname !== "/pricing" && (
  <Link
    to="/pricing"
    className={`px-4 py-2 rounded-full transition duration-300 ${
      location.pathname === "/Pricing"
        ? "hidden"
        : "text-black hover:bg-indigo-500 hover:text-white hover:border hover:border-white hover:text-indigo-900"
    }`}
  >
    Register
  </Link>
)}
          <Link
            to="/login"
            className={`px-4 py-2    transition duration-300 ${
              location.pathname === "/login" ? "bg-indigo-700 text-white rounded-full" : "hover:bg-indigo-500 hover:border hover:border-white hover:text-white hover:rounded-full"
            }`}
          >
            Login
          </Link>

        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-[100] bg-black bg-opacity-90 text-white transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex justify-between items-center">
          <span className="text-xl font-bold">Oxford</span>
          <button onClick={() => setMenuOpen(false)} className="text-white text-2xl">
            <IoMdClose />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-1">Welcome To Oxford</h2>
          <p className="mt-1 mb-4 text-lg max-w-xl mx-auto drop-shadow-md">
            School Of Success
          </p>
          <nav className="flex mt-4 flex-col space-y-4 text-white font-medium">
            {["Home", "About", "Pricing", "Contact"].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-left">
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default GuestNavBar;
