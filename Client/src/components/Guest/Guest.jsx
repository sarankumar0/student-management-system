import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IoMdMenu, IoMdClose } from 'react-icons/io';
import { Link } from 'react-router-dom';
import Footer from './Footer';

import {  FaUsers, FaLock, FaChartBar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: 'Manjusha, 29',
    text: 'I love mentor jilia! This is an amazing service and it has saved me and my small business so much time. I plan to use it for a long time to come.',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    name: 'Rahul, 23',
    text: 'The platform is extremely user-friendly and helps me manage my tasks effectively.',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    name: 'Anjali, 32',
    text: 'Great tool! It has streamlined my work process.',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 4,
    name: 'Prakash, 40',
    text: 'I have recommended this service to all my colleagues.',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 5,
    name: 'Sneha, 28',
    text: 'Absolutely love the experience. Highly recommended!',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 6,
    name: 'Amit, 34',
    text: 'Fantastic customer support and easy to use.',
    image: 'https://via.placeholder.com/150',
  },
];
function Guest() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
    const nextSlide = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };
  
    const prevSlide = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
      );
    };
  
    useEffect(() => {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }, []);
  
    const getCardStyle = (index) => {
      if (index === currentIndex) return 'z-20 scale-105 opacity-100';
      if (index === (currentIndex + 1) % testimonials.length)
        return 'z-10 translate-x-20 opacity-60';
      if (index === (currentIndex - 1 + testimonials.length) % testimonials.length)
        return 'z-10 -translate-x-20 opacity-60';
      return 'opacity-50';
    };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const Register = () => {
    navigate('/Pricing');
  };
  const Login = () => {
    navigate('/Login');
  };

  return (
    <div>
      <div
        className="h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('../../assets/GuestPoster1.jpg')" }}
      >

          <div className="h-screen bg-cover bg-center flex flex-col items-center justify-center px-6">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div
              className={`sticky top-0 left-0 w-full z-50 flex justify-between items-center p-4 border-2 border-indigo-900 rounded-full bg-transparent backdrop-blur-lg bg-opacity-80 transition duration-300 transform -translate-y-40 md:-translate-y-60 md:mt-4 ${
                isScrolled ? 'rounded-none' : 'rounded-full'
              }`}
            >
              {' '}
              {/* Logo (Hidden on md and below, shown in lg) */}
              <div className="relative text-white text-xl font-bold hidden md:block">
                <img
                  src="../../assets/elearning_13445589.png"
                  alt="Logo"
                  width="50px"
                />{' '}
              </div>
              {/* Hamburger (Only visible in md and below) */}
              <button
                className="md:hidden text-white text-2xl"
                onClick={() => setMenuOpen(true)}
              >
                <IoMdMenu />
              </button>
              <nav className="hidden md:flex space-x-10 text-white font-medium">
                {['Home', 'About', 'Pricing', 'Contact'].map((item) => (
                  <Link
                    key={item}
                    to={`/${item.toLowerCase()}`}
                    className={`relative group ${
                      location.pathname === `/${item.toLowerCase()}`
                        ? 'text-indigo-400'
                        : ''
                    }`}
                  >
                    {item}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-indigo-900 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>
              <div className="flex space-x-4">
                <button
                  onClick={Login}
                  className="px-4 py-2 rounded-full text-white hover:bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold  transition duration-300"
                >
                  Login
                </button>
                <button
                  onClick={Register}
                  className="px-4 py-2 hover:bg-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full   hover:text-white transition duration-300"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Sidebar (Only in md and below) */}
            {/* Sidebar (Only in md and below) */}
            <div
              className={`fixed top-0 left-0 h-full w-64 z-[100] bg-black bg-opacity-90 text-white transform ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              } transition-transform duration-300 ease-in-out`}
            >
              {/* Header with Close Button */}
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold"></span>
                {/* <img src="../../assets/SampleLogo.jpg" alt="Logo" width="100px"/> */}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white text-2xl"
                >
                  <IoMdClose />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-1">Welcome To Oxford</h2>
                <p className="mt-1 mb-4 text-lg drop-shadow-md">
                  School Of Success
                </p>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4 text-center font-medium">
                  {['Home', 'About', 'Pricing', 'Contact'].map((item) => (
                    <Link
                      key={item}
                      to={`/${item.toLowerCase()}`}
                      className={`relative group px-4 py-2 ${
                        location.pathname === `/${item.toLowerCase()}`
                          ? 'text-indigo-400'
                          : ''
                      }`}
                    >
                      {item}
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-indigo-900 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="relative text-start text-white transform md:-translate-x-80">
              <h1 className="text-5xl font-bold drop-shadow-lg">
                Welcome to Oxford
              </h1>
              <p className="mt-4 text-lg max-w-xl mx-auto drop-shadow-md">
                Empowering students with knowledge, innovation, and excellence.
              </p>
              <div className="mt-6 flex space-x-4">
                <button onClick={Register} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition">
                  Apply Now
                </button>
                <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:scale-105 transition">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        
      </div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 my-10">
        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-3xl font-bold text-indigo-500">5K+</h3>
          <p className="text-gray-600">Students Enrolled</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-3xl font-bold text-green-500">98%</h3>
          <p className="text-gray-600">Satisfaction Rate</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-3xl font-bold text-yellow-500">50+</h3>
          <p className="text-gray-600">Courses Offered</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 shadow-lg mx-10 items-center min-h-screen">
        <div className="w-full lg:w-1/2 lg:pr-14 lg:ms-40">
          <h2 className="font-sans-wide text-sm uppercase tracking-wider mb-4 font-bold text-brand-primary-700">
            Student Information System
          </h2>
          <h3 className="text-2xl font-bold mb-2 lg:text-6xl">
            An SIS that can do <strong>everything</strong>
          </h3>
          <p className="leading-6 my-5">
            Infinite Campus is the #1 trending student information system,
            offering over 1,500 tools for unmatched functionality. But we’re
            more than just an SIS. Whether you need a robust SIS or a complete
            all-in-one solution, we tailor our offerings to meet the unique
            needs of your district.
          </p>
          <button className="bg-black text-white px-6 py-2 rounded-sm font-semibold uppercase tracking-wide hover:bg-primary hover:text-brand-primary-800 transition duration-300">
            Learn More
          </button>
        </div>
        <div>
          <img
            src="https://a-us.storyblok.com/f/1021711/901x901/4aa27a124e/product-wheel-2024-2025-smaller-logo-8-29.png/m/560x0/smart/filters:format(webp):quality(70)"
            className="w-3/4 h-auto object-cover max-w-full rounded-sm"
            alt="Product Wheel"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 my-10">
        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
          <FaUsers className="text-4xl text-blue-500" />
          <h3 className="text-xl font-semibold mt-4">Student Management</h3>
          <p className="text-gray-600 text-center">
            Easily add, edit, and remove student records.
          </p>
        </div>

        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
          <FaChartBar className="text-4xl text-green-500" />
          <h3 className="text-xl font-semibold mt-4">Reports</h3>
          <p className="text-gray-600 text-center">
            Generate insightful reports on student performance.
          </p>
        </div>

        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg ">
          <FaLock className="text-4xl text-red-500" />
          <h3 className="text-xl font-semibold mt-4">Secure Data</h3>
          <p className="text-gray-600 text-center">
            Keep student information safe and protected.
          </p>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="p-8 bg-gray-100 rounded-lg shadow-md mt-6 mx-10">
        <h2 className="text-2xl font-bold mb-4">Announcements</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>New semester enrollment starts from March 10th</li>
          <li>System maintenance scheduled for March 5th</li>
          <li>Updated grading system for the next academic year</li>
        </ul>
        <ul className="list-disc pl-6 text-gray-700">
          <li>New semester enrollment starts from March 10th</li>
          <li>System maintenance scheduled for March 5th</li>
          <li>Updated grading system for the next academic year</li>
        </ul>
        <ul className="list-disc pl-6 text-gray-700">
          <li>New semester enrollment starts from March 10th</li>
          <li>System maintenance scheduled for March 5th</li>
          <li>Updated grading system for the next academic year</li>
        </ul>
      </section>

      {/* Testimonials Section */}
      <section className="bg-indigo-100 min-h-screen flex items-center justify-center py-10">
      <div className="w-full max-w-4xl px-4">
        <h2 className="text-center text-3xl font-bold mb-2">Testimonials</h2>
        <p className="text-center text-gray-600 mb-6">Our student reviews</p>

        <div className="relative overflow-hidden">
          <div className="flex items-center justify-center space-x-4 relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`absolute transform transition-all duration-500 ease-in-out bg-white shadow-xl rounded-2xl p-6 max-w-xs ${getCardStyle(index)}`}
                >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                    />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.text}</p>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200 z-30"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200 z-30"
            >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>

      {/* Footer Section */}
      <Footer />
    </div>
  )};
  
  export default Guest;
