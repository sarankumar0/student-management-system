import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import * as Accordion from "@radix-ui/react-accordion";
import GuestNavBar from "./GuesstNavBar";
import Footer from "./Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <>
   <GuestNavBar />
 
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800">Get in Touch</h1>
        <p className="text-gray-600 mt-2">We’d love to hear from you!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Contact Form */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg mb-3"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg mb-3"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg mb-3"
              rows="4"
              required
            ></textarea>
            <button
              type="submit"
              className="p-5 ms-32 mb-5 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
          <div className="flex items-center gap-3">
            <FaPhoneAlt className="text-blue-600" />
            <span>+123 456 7890</span>
          </div>
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-blue-600" />
            <span>contact@example.com</span>
          </div>
          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-blue-600" />
            <span>123 Street, City, Country</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col gap-4">
        <iframe
          className="h-full rounded-lg shadow-lg"
          // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093747!2d144.95373631531666!3d-37.81627974202154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce7e33!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sin!4v1602583751042!5m2!1sen!2sin"
          allowFullScreen=""
          loading="lazy"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.4399821072866!2d77.76849727502432!3d9.470404590609625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cf005974e399%3A0xe3bab55ba785b3a0!2sSkillmine%20Technology%20Consulting%20Pvt%20Ltd%2C%20Sivakasi!5e0!3m2!1sen!2sin!4v1746594865067!5m2!1sen!2sin" ></iframe>
      </div>
        </div>

        {/* Contact Details */}

      {/* Google Maps */}
      <div className="max-w-5xl mx-auto mt-10">
      </div>

      {/* FAQ Section */}
      <div className="max-w-8xl mb-5 mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion.Root type="single" collapsible>
        <Accordion.Item value="item-1">
        <Accordion.Trigger className="font-semibold">How can I contact support?</Accordion.Trigger>
        <Accordion.Content className="text-gray-600">
         You can reach us via email at support@example.com or call us at +123 456 7890.
        </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger className="bg-gray-100 p-3 w-full text-left font-semibold rounded-md mt-2">
            What is your response time?
          </Accordion.Trigger>
          <Accordion.Content className="p-3 text-gray-600">
            Our team typically responds within 24 hours.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      </div>
<Footer />
    </div>
    </>
  );
}
