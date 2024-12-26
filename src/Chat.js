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
  
      // 1) If there's a plain text message from the bot
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: data.message, sender: "bot" },
        ]);
      }
  
      // 2) If there's an LLM text answer
      if (data.response) {
        // Here, you might see the raw JSON output in the text,
        // but let's keep it for debugging or user reading
        setMessages((prev) => [
          ...prev,
          { type: "text", text: data.response, sender: "bot" },
        ]);
      }
  
      // 3) If there's an error
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: `Error: ${data.error}`, sender: "bot" },
        ]);
      }
  
      // 4) **If we got structured products** from parse_products
      if (data.products && data.products.length > 0) {
        setMessages((prev) => [
          ...prev,
          { type: "products", products: data.products, sender: "bot" },
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
    {messages.map((msg, index) => {
      if (msg.type === "text") {
        // Normal text bubble
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
        // Product carousel
        return (
          <div key={index} className="product-list-container bot-message">
            {msg.products.map((product, i) => (
              <div className="product-card" key={i}>
                <img
                  className="product-image"
                  src={product.image_url}
                  alt={product.name}
                />
                <div className="product-name">{product.name}</div>
                <div className="product-price">{product.price} AED</div>
                <div className="product-description">{product.description}</div>
                <button className="buy-now-button">Buy Now</button>
              </div>
            ))}
          </div>
        );
      }
      return null;
    })}

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
