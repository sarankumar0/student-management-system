import { useUser } from "../context/UserContext";

const AdminWelcomeCard = () => {
    const { user } = useUser();
    
    if (!user) return null; // Ensure user data is loaded

    return (
        <div className="bg-gradient-to-r mt-10 ms-16  from-blue-500 to-purple-600 text-white shadow-xl p-6 rounded-2xl flex items-center space-x-6 animate-fade-in">
            <img src={user.profileImg || "/default-avatar.png"} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
            <div>
                <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
                <p className="text-lg opacity-80">Role: <span className="font-semibold">{user.role.toUpperCase()}</span></p>
                <p className="text-lg opacity-80">Reg No: <span className="font-semibold">{user.registrationNumber}</span></p>
            </div>
        </div>
    );
};

export default AdminWelcomeCard;
