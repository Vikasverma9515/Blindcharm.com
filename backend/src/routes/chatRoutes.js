import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Send a Chat Message and Track Progress
router.post("/chats", async (req, res) => {
  const { match_id, sender_id, message } = req.body;

  // Insert chat message
  const { error: chatError } = await supabase
    .from("chats")
    .insert([{ match_id, sender_id, message }]);

  if (chatError) return res.status(500).json({ error: chatError.message });

  // Increase message count in matches table
  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("messages_exchanged")
    .eq("id", match_id)
    .single();

  if (matchError) return res.status(500).json({ error: matchError.message });

  const newMessageCount = matchData.messages_exchanged + 1;

  // Update message count
  const { error: updateError } = await supabase
    .from("matches")
    .update({ messages_exchanged: newMessageCount })
    .eq("id", match_id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  // Determine Profile Reveal Progress
  let revealStage = "basic"; // Default
  if (newMessageCount >= 5) revealStage = "name";
  if (newMessageCount >= 10) revealStage = "profile_picture";
  if (newMessageCount >= 15) revealStage = "full_profile";

  // Send updated status
  res.json({ message: "Message sent!", messages_exchanged: newMessageCount, revealStage });
});

export default router;