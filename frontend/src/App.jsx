import { io } from "socket.io-client";
import React, { useEffect, useState, useRef } from "react";

const socket = io("http://localhost:3000");

export default function App() {
  const [me, setMe] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([]);
  const endRef = useRef();

  // Handle connection and user list
  useEffect(() => {
    socket.on("connect", () => {
      setMe(socket.id);
      socket.emit("get_users");
    });

    socket.on("users", (list) => {
      // exclude self
      const others = list.filter((id) => id !== socket.id);
      setUsers(others);
      // auto-select first if none selected
      if (!selectedUser && others.length) {
        setSelectedUser(others[0]);
      }
    });

    socket.on("user_connected", (id) => {
      setUsers((prev) => [...prev, id]);
    });

    socket.on("user_disconnected", (id) => {
      setUsers((prev) => prev.filter((u) => u !== id));
      if (selectedUser === id) {
        setSelectedUser("");
      }
    });

    socket.on("private_message", ({ content, from }) => {
      // only show if from or to selected
      if (from === selectedUser) {
        setMsgs((m) => [...m, { content, from, self: false }]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("users");
      socket.off("user_connected");
      socket.off("user_disconnected");
      socket.off("private_message");
    };
  }, [selectedUser]);

  const sendPrivate = () => {
    console.log(selectedUser)
    if (!input.trim() || !selectedUser) return;
    socket.emit("private_message", {
      content: input,
      to: selectedUser,
    });
    setMsgs((m) => [...m, { content: input, from: me, self: true }]);
    setInput("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  return (
    <div className="flex h-screen">
      {/* Sidebar of users */}
      <aside className="w-1/4 bg-white border-r overflow-y-auto">
        <div className="p-4 font-bold">Contacts</div>
        {users.map((user) => (
          <div
            key={user}
            className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
              selectedUser === user ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              setSelectedUser(user);
              setMsgs([]);
            }}
          >
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">
              {user.substring(0, 2)}
            </div>
            <div className="flex-1 truncate">{user}</div>
          </div>
        ))}
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <header className="bg-blue-600 text-white p-4 flex justify-between">
          <span>Your ID: <code>{me || "connecting..."}</code></span>
          <span>Chatting with: <strong>{selectedUser || "—"}</strong></span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-md px-3 py-2 rounded-lg self-start ${
                m.self ? "bg-blue-500 text-white self-end" : "bg-white text-gray-800"
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {m.self ? "You" : m.from}
              </div>
              {m.content}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-white space-y-2">
          <div className="flex">
            <input
              type="text"
              placeholder="Type your message…"
              className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrivate()}
            />
            <button
              onClick={sendPrivate}
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
