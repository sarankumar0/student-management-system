import { useState } from "react";
import { Send } from "lucide-react";

const ChatBotWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: "I'm still learning. Please try again later!" }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-20 right-6 w-[350px] md:w-[400px] max-h-[90vh] bg-white shadow-2xl border rounded-2xl flex flex-col z-50">
      
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <h2 className="font-semibold">Need Help?</h2>
        <button onClick={onClose} className="text-white text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
              msg.from === "user"
                ? "bg-indigo-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBotWindow;
