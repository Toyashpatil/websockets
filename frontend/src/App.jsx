import { io } from "socket.io-client";
import React, { useEffect } from "react";

const socket = io("http://localhost:3000");

const App = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("chat", (msg) => {
      console.log("Received from another client:", msg);
    });

    // Cleanup socket on unmount
    return () => {
      socket.off("connect");
      socket.off("chat");
    };
  }, []);

  const handleSend = () => {
    socket.emit("chat", "hi");
  };

  return (
    <div>
      <h1>WebSocket Chat</h1>
      <button onClick={handleSend}>Send "hi"</button>
    </div>
  );
};

export default App;
