import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket"],
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("response", (data) => {
      console.log("Received socket data:", data); // Debug log

      if (data.response && data.products.length == 0) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: data.response, sender: "bot" },
        ]);
      }

      if (data.products && data.products.length > 0) {
        setMessages((prev) => [
          ...prev,
          { type: "products", products: data.products },
        ]);
      }
    });

    return () => {
      socket.off("response");
    };
  }, []);

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { type: "text", text: input, sender: "user" }]);
      socket.emit("chat", { query: input });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Mall Chatbot</div>
      <div className="chat-body">
        {messages.map((msg, index) => {
          if (msg.type === "text") {
            return (
              <div
                key={index}
                className={`chat-message ${
                  msg.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {msg.text}
              </div>
            );
          } else if (msg.type === "products") {
            return (
              <div key={index} className="product-list-container">
                {msg.products.map((product, idx) => (
                  <div key={idx} className="product-card">
                    <img
                      src={product.image_url || "placeholder.jpg"}
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-description">{product.description}</p>
                      <p className="product-price">{product.price} AED</p>
                      <button className="buy-now-button">Buy Now</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          } else {
            return null;
          }
        })}
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
