// messagingRoutes.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Send a Message
router.post("/send", async (req, res) => {
  const { match_id, sender_id, receiver_id, message } = req.body;

  if (!match_id || !sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const { error } = await supabase.from("messages").insert([
    {
      match_id,
      sender_id,
      receiver_id,
      message,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Message sent!" });
});

// ✅ Get Chat History for a Match
router.get("/:match_id", async (req, res) => {
  const { match_id } = req.params;

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, message, created_at")
    .eq("match_id", match_id)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

export default router;