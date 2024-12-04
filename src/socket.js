import io from "socket.io-client";

const socket = io("http://127.0.0.1:5000", {
    transports: ["websocket"], // Force WebSocket
});

socket.on("connect", () => {
    console.log("Connected to server via WebSocket");
});

socket.on("response", (data) => {
    console.log("Received response:", data);
});

const handleSend = () => {
    if (input.trim() !== "") {
        socket.emit("chat", { query: input });
        setInput(""); // Clear input field
    }
};
