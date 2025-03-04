import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { findBestMatch, getAllMatches, deleteMatch } from "../controllers/matchController.js";
import { getUserMatches } from "../controllers/matchController.js";

dotenv.config();
const router = express.Router();

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Get All Matches
router.get("/", getAllMatches);

// ✅ Delete a Match
router.delete("/:id", deleteMatch);
// router.get("/:userId", getUserMatches);

// ✅ API route to get matches for a user
router.get("/matches/:userId", getUserMatches);////////

// ✅ Find Best Match for a User
router.get("/find/:userId", async (req, res) => {
  const { userId } = req.params;
  const match = await findBestMatch(userId);
  res.json(match);
});

// ✅ Match using the matchController, interest-based
router.get("/find-match/:userId", async (req, res) => {
  const { userId } = req.params;
  const bestMatch = await findBestMatch(userId);

  if (!bestMatch) {
    return res.status(404).json({ message: "No match found." });
  }

  res.json(bestMatch);
});

// ✅ Randomly Match Users
router.post("/match", async (req, res) => {
  const { user1_id, user2_id } = req.body;

  // Create a match
  const { data: newMatch, error: matchError } = await supabase
    .from("matches")
    .insert([{ user1_id, user2_id, status: "pending" }])
    .select("*")
    .single();

  if (matchError) return res.status(500).json({ error: matchError.message });

  res.json({ message: "Match created!", match_id: newMatch.id });
});

// ✅ Accept a Match
router.post("/match/accept", async (req, res) => {
  const { match_id } = req.body;

  const { error } = await supabase
    .from("matches")
    .update({ status: "matched" })
    .eq("id", match_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Match accepted!" });
});

// ✅ Reject a Match
router.post("/match/reject", async (req, res) => {
  const { match_id } = req.body;

  const { error } = await supabase
    .from("matches")
    .update({ status: "rejected" })
    .eq("id", match_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Match rejected!" });
});

// ✅ Smart Matching with Rotation
router.post("/match-lobby", async (req, res) => {
  try {
    // Fetch users sorted by time in lobby (oldest first)
    const { data: users, error } = await supabase
      .from("users")
      .select("id, gender, joined_lobby_at")
      .eq("in_lobby", true)
      .order("joined_lobby_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Separate users by gender
    let males = users.filter((user) => user.gender === "male");
    let females = users.filter((user) => user.gender === "female");

    let matchedPairs = [];

    // Pair up users based on who waited the longest
    while (males.length > 0 && females.length > 0) {
      let male = males.shift(); // Take the longest-waiting male
      let female = females.shift(); // Take the longest-waiting female

      const { data: match, error: matchError } = await supabase.from("matches").insert([
        {
          user1_id: male.id,
          user2_id: female.id,
          status: "matched",
        },
      ]);

      if (matchError) return res.status(500).json({ error: matchError.message });

      // Update in_lobby to false for matched users
      await supabase
        .from("users")
        .update({ in_lobby: false })
        .or(`id.eq.${male.id},id.eq.${female.id}`);

      matchedPairs.push({ male: male.id, female: female.id });
    }

    // Update timestamp for remaining users so they get priority next time
    for (let user of [...males, ...females]) {
      await supabase
        .from("users")
        .update({ joined_lobby_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    res.json({
      message: "Matching completed",
      matchedPairs,
      remainingMales: males.map((m) => m.id),
      remainingFemales: females.map((f) => f.id),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Matched User Profile with Reveal System
router.get("/match-profile/:match_id/:user_id", async (req, res) => {
  const { match_id, user_id } = req.params;

  // Fetch match and user in a single request
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("user1_id, user2_id, messages_exchanged, users!inner(id, name, age, bio, hobbies)")
    .eq("id", match_id)
    .single();

  if (matchError || !match) return res.status(404).json({ error: "Match not found" });

  // Find the matched user
  const matchedUser = match.user1_id == user_id ? match.users[1] : match.users[0];

  // Apply reveal rules
  let revealData = {
    age: matchedUser.age,
    hobbies: matchedUser.hobbies,
  };

  if (match.messages_exchanged >= 5) revealData.name = matchedUser.name;
  if (match.messages_exchanged >= 10) revealData.profile_picture = matchedUser.profile_picture;
  if (match.messages_exchanged >= 15) revealData.bio = matchedUser.bio;

  res.json(revealData);
});

// Route to fetch a random icebreaker question
router.get("/icebreaker", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("icebreaker_questions")
      .select("*")
      .limit(1)
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ question: data.length > 0 ? data[0].question : "No questions available." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/findBestMatch", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const result = await findBestMatch(userId);
  res.json(result);
});

router.patch("/updateStatus", async (req, res) => {
  try {
    const { matchId, status } = req.body;

    if (!matchId || !status) {
      return res.status(400).json({ error: "matchId and status are required" });
    }

    const { data, error } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId)
      .select();

    if (error) {
      console.error("Error updating match status:", error);
      return res.status(500).json({ error: "Error updating match status" });
    }

    res.json({ message: "Match status updated", match: data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// (async () => {
//   const result = await findBestMatch("df3cbe3d-6f87-4793-a991-6818838919e0");
//   console.log("🔍 Match Result:", result);
// })();
// async function fetchUser(userId) {
//   const { data: user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", userId)
//       .single();

//   if (error) {
//       console.error("❌ Error fetching user:", error);
//       return;
//   }

//   console.log("✅ User data:", user);
// }

// // Replace with a valid user ID from your database
// fetchUser("68f7a345-9455-4733-9ffc-4ab7ab87a5af");

// async function fetchLobbyUsers() {
//   const { data: users, error } = await supabase
//       .from("users")
//       .select("id, name, gender, in_lobby")
//       .eq("in_lobby", true);

//   if (error) {
//       console.error("❌ Error fetching lobby users:", error);
//       return;
//   }

//   console.log("✅ Users in Lobby:", users);
// }

// fetchLobbyUsers();

// async function fetchTopUsersByCompatibility() {
//   const { data: users, error } = await supabase
//       .from("users")
//       .select("id, name, ai_compatibility_score")
//       .order("ai_compatibility_score", { ascending: false })
//       .limit(10);

//   if (error) {
//       console.error("❌ Error fetching AI compatibility scores:", error);
//       return;
//   }

//   console.log("✅ Top 5 Compatible Users:", users);
// }

// fetchTopUsersByCompatibility();


export default router;
