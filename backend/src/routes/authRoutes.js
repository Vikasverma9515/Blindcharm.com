import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Signup Route (Only Email & Password, Profile Created Later)
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // Add empty profile in `users` table
  const { error: dbError } = await supabase.from("users").insert([
    { id: data.user.id, email }, // Only storing email for now
  ]);

  if (dbError) return res.status(500).json({ error: dbError.message });

  res.json({ message: "Signup successful!", user: data.user });
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: error.message });

  res.json({ message: "Login successful!", session: data.session });
});

// ✅ Get Current User (Requires Authorization Header)
router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token

  if (!token) return res.status(401).json({ error: "No token provided" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ error: error.message });

  res.json(data);
});

// ✅ Logout Route
router.post("/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Logged out successfully!" });
});

// ✅ Update User Profile
router.put("/profile", async (req, res) => {
  const { id, name, gender, dob, bio } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ name, gender, dob, bio })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Profile updated successfully!" });
});

export default router;
