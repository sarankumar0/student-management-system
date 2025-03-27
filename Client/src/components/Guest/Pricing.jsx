import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate hook
import GuestNavBar from "./GuesstNavBar";
import Footer from "./Footer";

const PricingCard = ({ title, price, duration, description, features, cta, bgColor, planType }) => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate(`/register?plan=${planType}`); // ✅ Redirect with selected plan in URL
  };

  return (
    <div className={`p-6 border rounded-2xl ${bgColor} mx-10 shadow-lg hover:scale-105 transition-transform duration-300`}>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="text-4xl font-extrabold text-gray-900 my-2">
        {price}<span className="text-lg">/{duration}</span>
      </p>
      <p className="text-gray-600">{description}</p>
      
      <button 
        className="w-full py-3 mt-4 shadow-lg bg-none text-black rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
        onClick={handleSelectPlan} // ✅ Clicking redirects to register page
      >
        {cta}
      </button>

      <ul className="mt-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-700">
            <FaCheckCircle className="text-green-500" size={18} /> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Pricing = () => {
  const plans = [
    {
      title: "Basic",
      price: "$0",
      duration: "month/user",
      description: "Good for individuals who just need essentials.",
      features: ["1 user", "Unlimited calendars", "Workflows", "Stripe Integration"],
      cta: "Get Started",
      bgColor: "bg-gradient-to-b from-red-100 to-white",
      planType: "basic", // ✅ Added plan type
    },
    {
      title: "Classic",
      price: "$12",
      duration: "month/user",
      description: "Best for small teams to boost productivity.",
      features: ["1 team", "Team Scheduling", "Fixed-Round-Robin"],
      cta: "Get Started",
      bgColor: "bg-gradient-to-b from-blue-100 to-white",
      planType: "classic", // ✅ Added plan type
    },
    {
      title: "Pro",
      price: "$15k",
      duration: "year",
      description: "For large organizations with advanced needs.",
      features: ["Unlimited Teams", "Advanced Routing", "24/7 Support"],
      cta: "Contact Us",
      bgColor: "bg-gradient-to-b from-green-100 to-white",
      planType: "pro", // ✅ Added plan type
    },
  ];

  return (
    <>
      <GuestNavBar />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col justify-center items-center overflow-hidden">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 relative">Choose the Best Plan for You!</h2>
        <p className="text-lg text-gray-600 mb-8 relative">Simple, transparent pricing for every team size.</p>
        <div className="flex flex-wrap justify-center items-center gap-6 p-10 relative z-10">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pricing;
