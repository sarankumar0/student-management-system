// src/components/chatbot/ChatBotWidget.jsx (or appropriate path)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaCommentDots, FaTimes } from 'react-icons/fa';
import { Send } from 'lucide-react'; 

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I help you today? 🎓' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom whenever messages change or the widget opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Function to handle closing the chat window
  const handleClose = () => {
    setIsOpen(false);
  };

  // Function to handle sending a message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return; // Prevent sending empty or while loading

    const userMessage = { from: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]); 
    setInput('');
    setIsLoading(true); 

    try {
      // API Call to Flask backend
      console.log("Sending query to backend:", trimmedInput);
      const response = await axios.post('http://localhost:5001/api/chatbot/query', {
        query: trimmedInput
      }, );
      console.log("Received response from backend:", response.data);

      const botAnswer = response.data?.answer || "Sorry, I couldn't find an answer for that.";
      setMessages((prev) => [...prev, { from: 'bot', text: botAnswer }]);

    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      let errorText = "Sorry, I encountered an error. Please try again.";
      if (error.response) {
        console.error("Error data:", error.response.data);
        errorText = error.response.data?.error || `Error: ${error.response.status}`;
      } else if (error.request) {
        errorText = "Could not connect to the chatbot service.";
      }
      setMessages((prev) => [...prev, { from: 'bot', text: errorText }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow sending message with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for new line
      e.preventDefault(); // Prevent default form submission/new line
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Launcher Bubble (only shows when closed) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)} // Opens the window
            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition transform hover:scale-105"
            aria-label="Open Chat"
          >
            <FaCommentDots size={24} />
          </button>
        )}
      </div>
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-[90%] sm:w-[350px] md:w-[400px] max-h-[calc(100vh-5rem)] bg-white shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden border border-gray-300 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-indigo-600 text-white flex-shrink-0">
            <h2 className="text-base font-semibold">Student ChatBot</h2>
            <button
              onClick={handleClose} // ** This now correctly calls handleClose **
              className="text-white hover:text-indigo-200"
              aria-label="Close Chat"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm break-words ${ // Added break-words
                  msg.from === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  {/* Simple rendering, assumes text doesn't contain HTML */}
                   {msg.text.split('\n').map((line, i, arr) => ( // Handle potential line breaks
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                </div>
              </div>
            ))}
            {/* Invisible div to target for scrolling */}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={isLoading ? "Waiting..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} // Use onKeyDown for Enter key
              disabled={isLoading}
              aria-label="Chat Input"
            />
            <button
              onClick={handleSend}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-opacity ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
              aria-label="Send Message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;