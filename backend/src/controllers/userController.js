import supabase from "../config/db.js";

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
    const { id } = req.params;
  
    const { data, error } = await supabase
      .from("users")
      .select("id, username, tribes, badges, personality_traits, fun_stats")
      .eq("id", id)
      .single();
  
    if (error) {
      return res.status(400).json({ error: "User not found" });
    }
  
    res.json(data);
  };
  
  export const updateProfile = async (req, res) => {
    const { userId, tribes, badges, personalityTraits, funStats } = req.body;
  
    try {
      const formattedTraits = personalityTraits ? JSON.stringify(personalityTraits) : null;
      const formattedStats = funStats ? JSON.stringify(funStats) : null;
  
      const { data, error } = await supabase
        .from("users")
        .update({
          tribes,
          badges,
          personality_traits: formattedTraits,
          fun_stats: formattedStats,
        })
        .eq("id", userId)
        .select();
  
      if (error) return res.status(400).json({ error: "Update failed" });
  
      res.json({ message: "Profile updated successfully", data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  