import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import protectSocket from "./middleware/socketAuth.js";

dotenv.config();

await connectDB();

// Server setup
const app = express();
const server = http.createServer(app);

// Socket.io server
export const io = new Server(server, {
  cors: { 
    origin: "http://127.0.0.1:5173",
    credentials: true,
  },
});

// Store Online users
export const userSocketMap = {}; // { userId: socketId }

io.use(protectSocket);

// Socket.io connection
io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log("user Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

// Server connection
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
