const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔗 Connected:", socket.id);

  // Let everyone know a new user has joined
  io.emit("user_connected", socket.id);

  // Handle a request for the current user list
  socket.on("get_users", () => {
    const allIds = Array.from(io.sockets.sockets.keys());
    // send back the full list (including requester)
    socket.emit("users", allIds);
  });

  // Handle a private message
  socket.on("private_message", ({ content, to }) => {
    console.log(`📩 ${socket.id} → ${to}: ${content}`);
    socket.to(to).emit("private_message", {
      content,
      from: socket.id
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Disconnected: ${socket.id} (${reason})`);
    // Notify everyone that this user left
    io.emit("user_disconnected", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("✅ Socket server started on port 3000");
});
