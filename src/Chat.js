import React, { useState, useEffect } from "react";
import "./Chat.css";
import io from "socket.io-client";

// Initialize the WebSocket connection outside the component
const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket"], // Force WebSocket
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("response", (data) => {
      setMessages((prev) => [
        ...prev,
        { text: data.response || data.error, sender: "bot" },
      ]);
    });

    return () => {
      socket.off("response"); // Clean up the listener on unmount
    };
  }, []);

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      socket.emit("chat", { query: input });
      setInput(""); // Clear input field
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Mall Chatbot</div>
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
