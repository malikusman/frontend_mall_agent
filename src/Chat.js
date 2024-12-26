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
      // Optionally handle connect event...
    });

    socket.on("response", (data) => {
      setIsLoading(false);

      // 1) If there's a plain text "message" from the bot
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: data.message, sender: "bot" },
        ]);
      }

      // 2) If there's an error
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { type: "text", text: `Error: ${data.error}`, sender: "bot" },
        ]);
      }

      // 3) If we got structured products from parse_products
      if (data.products && data.products.length > 0) {
        setMessages((prev) => [
          ...prev,
          { type: "products", products: data.products, sender: "bot" },
        ]);
      }

      // 4) If there's an LLM text answer
      //    We'll remove the JSON chunk (if any) from the text
      if (data.response) {
        let cleanedText = data.response.replace(
          /PRODUCTS_JSON:\s*\[.*?\]/s, // Regex to match the entire JSON block
          ""
        );
        cleanedText = cleanedText.trim();

        // Only show leftover text if there's anything left
        if (cleanedText.length > 0) {
          setMessages((prev) => [
            ...prev,
            { type: "text", text: cleanedText, sender: "bot" },
          ]);
        }
      }
    });

    return () => {
      socket.off("response");
      socket.off("connect");
    };
  }, []);

  const handleSend = () => {
    // If we don't have the user's email yet...
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

    // If we don't have the user's name yet...
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

    // Otherwise, send the user's message to the backend
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
                    <div className="product-description">
                      {product.description}
                    </div>
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
