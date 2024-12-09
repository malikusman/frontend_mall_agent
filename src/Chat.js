import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Chat.css";

const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket"],
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [pickupDate, setPickupDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {
    socket.on("response", (data) => {
      setIsLoading(false); // Stop loading when response is received
      if (data.response && data.products.length === 0) {
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

  const handleBuyNow = (product) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "payment",
        productName: product.name,
        paymentLink: "https://stripe.com",
      },
    ]);
  };

  const handlePaymentClick = () => {
    setMessages((prev) => [
      ...prev,
      { type: "text", text: "Payment done!", sender: "bot" },
    ]);
    setShowCalendar(true);
  };

  const handleDateSelect = (date) => {
    setPickupDate(date);
    setMessages((prev) => [
      ...prev,
      { type: "text", text: `Pickup scheduled for ${date.toLocaleString()}`, sender: "bot" },
      { type: "text", text: "Thanks for shopping with us!", sender: "bot" },
    ]);
    setShowCalendar(false);
  };

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { type: "text", text: input, sender: "user" }]);
      setIsLoading(true); // Start loading when query is sent
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
                      <button
                        className="buy-now-button"
                        onClick={() => handleBuyNow(product)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          } else if (msg.type === "payment") {
            return (
              <div key={index} className="payment-message">
                <p className="heading">Pay for {msg.productName}:</p>
                <a
                  href={msg.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="payment-link"
                  onClick={handlePaymentClick}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1024px-Stripe_Logo%2C_revised_2016.svg.png"
                    alt="Stripe"
                    className="stripe-logo"
                  />
                  Pay Now
                </a>
              </div>
            );
          }
        })}

        {/* Loading animation */}
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading, please wait...</p>
          </div>
        )}

        {showCalendar && (
          <div className="calendar-container">
            <p className="heading">Please select your pickup date and time:</p>
            <DatePicker
              selected={pickupDate}
              onChange={handleDateSelect}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="date-picker"
            />
          </div>
        )}
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
