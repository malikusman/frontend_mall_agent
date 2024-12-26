import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket", "polling"],
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState({ email: "", name: "" }); // Session stores email and name

  useEffect(() => {
    socket.on("connect", () => {
      // setMessages((prev) => [
      //   ...prev,
      //   { type: "text", text: "Welcome! Please provide your email to continue.", sender: "bot" },
      // ]);
    });

    socket.on("response", (data) => {
      setIsLoading(false);
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: data.message, sender: "bot" },
        ]);
      }

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: data.response, sender: "bot" },
        ]);
      }

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: `Error: ${data.error}`, sender: "bot" },
        ]);
      }
    });

    return () => {
      socket.off("response");
      socket.off("connect");
    };
  }, []);

  const handleSend = () => {
    if (!session.email) {
      setSession({ ...session, email: input });
      setMessages((prev) => [
        ...prev,
        { type: "text", text: input, sender: "user" },
        { type: "text", text: "Please provide your name:", sender: "bot" },
      ]);
      setInput("");
      return;
    }

    if (!session.name) {
      setSession({ ...session, name: input });
      setMessages((prev) => [
        ...prev,
        { type: "text", text: input, sender: "user" },
        { type: "text", text: "Thank you! How can I help you today?", sender: "bot" },
      ]);
      setInput("");
      return;
    }

    if (input.trim() !== "") {
      setMessages((prev) => [
        ...prev,
        { type: "text", text: input, sender: "user" },
      ]);
      setIsLoading(true);
      socket.emit("chat", { query: input, session });
      setInput("");
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
        {isLoading && (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        )}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
