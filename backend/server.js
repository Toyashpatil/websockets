const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // ✅ change this to your frontend URL/port
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
    console.log(socket.id)
    socket.on("chat", (msg) => {
        console.log(` Received message from ${socket.id}: ${msg}`);
        socket.broadcast.emit("chat", msg);
    });
});

httpServer.listen(3000, () => {
    console.log("Server staterd for socket")
});