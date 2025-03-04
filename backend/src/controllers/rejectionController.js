import supabase from "../../supabase.js"; // Adjust path as needed

// Store a rejected match
export const rejectMatch = async (req, res) => {
    const { user_id, rejected_user_id } = req.body;

    if (!user_id || !rejected_user_id) {
        return res.status(400).json({ error: "Both user_id and rejected_user_id are required." });
    }

    const { data, error } = await supabase
        .from("rejected_matches")
        .insert([{ user_id, rejected_user_id }]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Match rejected successfully!", data });
};

// Get rejected matches for a user
export const getRejectedMatches = async (req, res) => {
    const { userId } = req.params;

    const { data, error } = await supabase
        .from("rejected_matches")
        .select("rejected_user_id")
        .eq("user_id", userId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data.map(rejection => rejection.rejected_user_id));
};
