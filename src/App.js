import React, { useState } from "react";
import Chat from "./Chat";
import "./App.css";

function App() {
  const [showChat, setShowChat] = useState(false);

  const handleBubbleClick = () => {
    setShowChat(true);
  };

  return (
    <div className="App">
      {!showChat && (
        <>
          <header className="App-header">
            <h1>Welcome to Mall Chatbot</h1>
            <p>Your friendly mall assistant is here to help!</p>
          </header>
          <div className="chat-bubble" onClick={handleBubbleClick}>
            <img
              src="https://www.shutterstock.com/image-vector/chatbot-icon-line-vector-isolate-260nw-1841577400.jpg"
              alt="Chat Icon"
              className="chat-icon"
            />
          </div>
        </>
      )}
      {showChat && <Chat />}
    </div>
  );
}

export default App;
