import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import authRoutes from "./src/routes/authRoutes.js"; // Import auth routes
import matchRoutes from "./src/routes/matchRoutes.js"; // Import match routes
import messagingRoutes from "./src/routes/messagingRoutes.js"; // Import messaging routes
import userRoutes from "./src/routes/userRoutes.js"; // Import user routes
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import db from "./src/config/db.js"; // Import the database connection
import rejectionRoutes from "./src/routes/rejectionRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend connections
    methods: ["GET", "POST"],
  },
});

// db.authenticate()
//   .then(() => console.log("✅ Database connected"))
//   .catch((err) => console.log("❌ Database connection error:", err));

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests

// routes
app.use("/api/auth", authRoutes);
// app.use("/matches", matchRoutes);
app.use("/messages", messagingRoutes);
app.use("/users", userRoutes);
app.use("/api", matchRoutes);
app.use("/api/rejections", rejectionRoutes);
app.use("/api/matches", matchRoutes);  //

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Store connected users
const connectedUsers = {};

// ✅ Authentication Routes
app.use("/api/auth", authRoutes); 

// 🚀 Test Route
app.get("/", (req, res) => {
  res.send("BlindConnect Backend Running!");
});

// ✅ Get All Users
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Create a New User
app.post("/users", async (req, res) => {
  const { email, name, gender, dob, bio } = req.body;
  const { data, error } = await supabase.from("users").insert([{ email, name, gender, dob, bio }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ✅ Get Matches for a User
app.get("/matches/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Send a Chat Message
app.post("/chats", async (req, res) => {
  const { match_id, sender_id, message } = req.body;
  const { data, error } = await supabase.from("chats").insert([{ match_id, sender_id, message }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.use("/match", matchRoutes); // Use Matching Routes

///////////////////////////////////////////
// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Store user ID when they join
  socket.on("join", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  // Handle message sending
  socket.on("sendMessage", async ({ match_id, sender_id, receiver_id, message }) => {
    const messageId = uuidv4();
    const { error } = await supabase
      .from("messages")
      .insert([{ id: messageId, match_id, sender_id, receiver_id, message }]);

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    console.log("Message stored in DB:", message);

    // Send message in real-time to receiver if online
    if (connectedUsers[receiver_id]) {
      io.to(connectedUsers[receiver_id]).emit("receiveMessage", {
        id: messageId,
        sender_id,
        receiver_id,
        message,
        created_at: new Date().toISOString(),
      });
    }
  });

  // Remove user when they disconnect
  socket.on("disconnect", () => {
    const userId = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
    if (userId) {
      delete connectedUsers[userId];
      console.log(`User ${userId} disconnected.`);
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
