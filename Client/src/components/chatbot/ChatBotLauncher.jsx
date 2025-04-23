// Example using ChatBotLauncher.jsx structure

import { useState } from "react";
import ChatBotWindow from "./ChatBotWindow"; // Adjust import path/name if needed
import { MessageCircle } from "lucide-react"; // Or your preferred icon library

export function ChatBotLauncher() {
  const [open, setOpen] = useState(false); 
  const handleClose = () => {
    setOpen(false); 
  };

  return (
    <>
      {/* Launcher Button */}
      <div className="fixed bottom-4 right-4 z-40"> {/* Lower z-index than modal */}
        {!open && ( // Only show launcher button when chat is closed
           <button
             onClick={() => setOpen(true)} // Open the chat window
             className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-105 transition-all"
             aria-label="Open Chat"
            >
                <MessageCircle size={24} />
            </button>
        )}
      </div>
      {open && <ChatBotWindow onClose={handleClose} />} 
    </>
  );
}
