
const Footer = () => {
  return (
    <div>
        <footer className="bg-gray-800 text-white p-10 ">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">Our platform provides a seamless student management experience.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="text-gray-300 space-y-2">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">Features</a></li>
              <li><a href="#" className="hover:underline">Pricing</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="text-gray-300 space-y-2">
              <li><a href="#" className="hover:underline">FAQ</a></li>
              <li><a href="#" className="hover:underline">Help Center</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-300">Email: support@dashboard.com</p>
            <p className="text-gray-300">Phone: +1 234 567 890</p>
          </div>
        </div>
        <div className="text-center text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Footer