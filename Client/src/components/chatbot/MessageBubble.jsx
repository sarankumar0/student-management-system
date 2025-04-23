export function MessageBubble({ type, text }) {
    const isUser = type === "user";
    return (
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs px-4 py-2 rounded-xl shadow ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-black rounded-bl-none"
          }`}
        >
          {text}
        </div>
      </div>
    );
  }
  