// import supabase from "../../supabase.js"; // Adjust path as needed

// export const findBestMatch = async (userId) => {


//   // Fetch the user from the database
//   const { data: user, error: userError } = await supabase
//   .from("users")
//   .select("id, gender, location, hobbies, answers, dob, age, last_active, reputation, tribes, badges")
//   .eq("id", userId)
//   .single();

// if (userError) {
//   console.error("❌ Error fetching user:", userError);
//   return { error: "User not found" };
// }


//   console.log("🔍 Fetching Rejected Users...");
//   const { data: rejections, error: rejectionError } = await supabase
//     .from("rejections")
//     .select("rejected_user_id")
//     .eq("user_id", userId);

//   if (rejectionError) {
//     console.error("❌ Error fetching rejections:", rejectionError);
//     return { error: "Error retrieving rejected users" };
//   }

//   const rejectedUserIds = rejections.map((r) => r.rejected_user_id);

//   console.log("🔍 Fetching Past Matches...");
//   const { data: pastMatches, error: pastMatchesError } = await supabase
//     .from("matches")
//     .select("user1_id, user2_id")
//     .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

//   if (pastMatchesError) {
//     console.error("❌ Error fetching past matches:", pastMatchesError);
//     return { error: "Error retrieving match history" };
//   }

//   const pastMatchIds = pastMatches.flatMap(match => [match.user1_id, match.user2_id]);

//   console.log("📌 Fetching Potential Matches...");
//   const { data: matches, error: matchError } = await supabase
//     .from("users")
//     .select("id, gender, location, hobbies, answers, birth_year, last_active, reputation, tribes, badges")
//     .neq("id", user.id)
//     .neq("gender", user.gender)
//     .not("id", "in", `(${[...pastMatchIds, ...rejectedUserIds].join(",")})`);

//   if (matchError) {
//     console.error("❌ Error fetching matches:", matchError);
//     return { error: "Error finding matches" };
//   }

//   console.log("📌 Potential Matches:", matches);
//   if (matches.length === 0) {
//     return { error: "No available matches found." };
//   }

//   const userHobbies = user.hobbies ? user.hobbies.split(",").map(h => h.trim().toLowerCase()) : [];
//   const userTribes = user.tribes ? user.tribes.split(",").map(t => t.trim().toLowerCase()) : [];
//   const userBadges = user.badges ? user.badges.split(",").map(b => b.trim().toLowerCase()) : [];
//   const currentYear = new Date().getFullYear();
//   const userAge = user.birth_year ? currentYear - user.birth_year : null;
  
//   let bestMatch = null;
//   let highestScore = 0;

//   matches.forEach((match) => {
//     const matchHobbies = match.hobbies ? match.hobbies.split(",").map(h => h.trim().toLowerCase()) : [];
//     const matchTribes = match.tribes ? match.tribes.split(",").map(t => t.trim().toLowerCase()) : [];
//     const matchBadges = match.badges ? match.badges.split(",").map(b => b.trim().toLowerCase()) : [];
//     let score = 0;

//     // ✅ Hobby Matching
//     const sharedHobbies = matchHobbies.filter(hobby => userHobbies.includes(hobby)).length;
//     score += sharedHobbies * 2;

//     // ✅ Tribe Matching
//     const sharedTribes = matchTribes.filter(tribe => userTribes.includes(tribe)).length;
//     score += sharedTribes * 3;

//     // ✅ Badge Matching
//     const sharedBadges = matchBadges.filter(badge => userBadges.includes(badge)).length;
//     score += sharedBadges * 2;

//     // ✅ Personality Matching
//     if (user.answers && match.answers) {
//       score += Object.keys(user.answers).reduce((acc, key) => acc + (user.answers[key] === match.answers[key] ? 1 : 0), 0);
//     }

//     // ✅ Location Matching
//     if (user.location === match.location) {
//       score += 5;
//     } else if (user.location.split(",")[1] === match.location.split(",")[1]) { // Same state
//       score += 3;
//     } else if (user.location.split(",")[2] === match.location.split(",")[2]) { // Same country
//       score += 1;
//     }

//     // ✅ Age Matching
//     const matchAge = match.birth_year ? currentYear - match.birth_year : null;
//     if (userAge && matchAge) {
//       const ageDiff = Math.abs(userAge - matchAge);
//       if (ageDiff <= 2) {
//         score += 5;
//       } else if (ageDiff <= 5) {
//         score += 3;
//       } else if (ageDiff <= 10) {
//         score += 1;
//       }
//     }

//     // ✅ Activity Matching
//     const lastActiveDiff = (new Date() - new Date(match.last_active)) / (1000 * 60 * 60 * 24);
//     if (lastActiveDiff <= 3) {
//       score += 5;
//     } else if (lastActiveDiff <= 7) {
//       score += 3;
//     } else if (lastActiveDiff <= 14) {
//       score += 1;
//     }

//     // ✅ Reputation Score
//     score += match.reputation * 2;

//     console.log(`🎯 Match Score for ${match.id}:`, score);
//     if (score > highestScore) {
//       highestScore = score;
//       bestMatch = match;
//     }
//   });

//   if (!bestMatch || highestScore === 0) {
//     bestMatch = matches[Math.floor(Math.random() * matches.length)];
//   }

//   return { match: bestMatch };
// };




// export const getAllMatches = async (req, res) => {
//   try {
//     const { data: matches, error } = await supabase.from("matches").select("*");
//     if (error) return res.status(500).json({ error: error.message });
//     res.json(matches);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteMatch = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { data, error } = await supabase
//       .from("matches")
//       .delete()
//       .eq("id", id)
//       .select("*"); // ✅ Ensures deleted data is returned

//     if (error) return res.status(500).json({ error: error.message });
//     if (!data || data.length === 0) return res.status(404).json({ error: "Match not found" });

//     res.json({ message: "Match deleted successfully", deletedMatch: data });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getUserMatches = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const { data: matches, error } = await supabase
//       .from("matches")
//       .select("*")
//       .or(`user1_id.eq.${userId}, user2_id.eq.${userId}`);

//     if (error) {
//       console.error("❌ Error fetching matches:", error);
//       return res.status(500).json({ error: error.message });
//     }

//     res.json(matches);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




///////////////////////////

import supabase from "../../supabase.js"; // Adjust path as needed

// ✅ Find the Best Match for a User
export const findBestMatch = async (userId) => {
  try {
    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, gender, location, hobbies, answers, dob, age, last_active, reputation, tribes, badges")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError);
      return { error: "User not found" };
    }

    // Fetch rejected users
    const { data: rejections, error: rejectionError } = await supabase
      .from("rejections")
      .select("rejected_user_id")
      .eq("user_id", userId);

    if (rejectionError) {
      console.error("❌ Error fetching rejections:", rejectionError);
      return { error: "Error retrieving rejected users" };
    }

    const rejectedUserIds = rejections.map((r) => r.rejected_user_id);

    // Fetch past matches
    const { data: pastMatches, error: pastMatchesError } = await supabase
      .from("matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (pastMatchesError) {
      console.error("❌ Error fetching past matches:", pastMatchesError);
      return { error: "Error retrieving match history" };
    }

    const pastMatchIds = pastMatches.flatMap((match) => [match.user1_id, match.user2_id]);

    // Fetch potential matches
    const { data: matches, error: matchError } = await supabase
      .from("users")
      .select("id, gender, location, hobbies, answers, dob, age, last_active, reputation, tribes, badges")
      .neq("id", user.id)
      .neq("gender", user.gender)
      .not("id", "in", `(${[...pastMatchIds, ...rejectedUserIds].join(",")})`);

    if (matchError) {
      console.error("❌ Error fetching matches:", matchError);
      return { error: "Error finding matches" };
    }

    if (!matches || matches.length === 0) {
      return { error: "No available matches found." };
    }

    let bestMatch = null;
    let highestScore = 0;

    matches.forEach((match) => {
      let score = 0;

      // ✅ Hobby Matching
      const sharedHobbies = user.hobbies
        ? user.hobbies.split(",").filter((hobby) => match.hobbies?.split(",").includes(hobby)).length
        : 0;
      score += sharedHobbies * 2;

      // ✅ Tribe & Badge Matching
      const sharedTribes = user.tribes
        ? user.tribes.split(",").filter((tribe) => match.tribes?.split(",").includes(tribe)).length
        : 0;
      const sharedBadges = user.badges
        ? user.badges.split(",").filter((badge) => match.badges?.split(",").includes(badge)).length
        : 0;
      score += sharedTribes * 3 + sharedBadges * 2;

      // ✅ Personality Matching
      if (user.answers && match.answers) {
        Object.keys(user.answers).forEach((key) => {
          if (user.answers[key] === match.answers[key]) score++;
        });
      }

      // ✅ Location Matching
      if (user.location === match.location) score += 5;

      // ✅ Age Matching
      const userAge = user.dob ? new Date().getFullYear() - user.dob : null;
      const matchAge = match.dob ? new Date().getFullYear() - match.dob : null;
      if (userAge && matchAge) {
        const ageDiff = Math.abs(userAge - matchAge);
        if (ageDiff <= 2) score += 5;
        else if (ageDiff <= 5) score += 3;
        else if (ageDiff <= 10) score += 1;
      }

      // ✅ Active Status
      const lastActiveDiff = (new Date() - new Date(match.last_active)) / (1000 * 60 * 60 * 24);
      if (lastActiveDiff <= 3) score += 5;
      else if (lastActiveDiff <= 7) score += 3;
      else if (lastActiveDiff <= 14) score += 1;

      // ✅ Reputation
      score += match.reputation * 2;

      console.log(`🎯 Match Score for ${match.id}:`, score);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = match;
      }
    });

    if (!bestMatch || highestScore === 0) {
      bestMatch = matches[Math.floor(Math.random() * matches.length)];
    }

    return { match: bestMatch };
  } catch (error) {
    console.error("❌ Error finding best match:", error);
    return { error: "Internal server error" };
  }
};

// ✅ Get All Matches
export const getAllMatches = async (req, res) => {
  try {
    const { data: matches, error } = await supabase.from("matches").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Match
export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id)
      .select("*");

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: "Match not found" });

    res.json({ message: "Match deleted successfully", deletedMatch: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get User Matches
export const getUserMatches = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: matches, error } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${userId}, user2_id.eq.${userId}`);

    if (error) {
      console.error("❌ Error fetching matches:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Ensure exports are correct
export default {
  findBestMatch,
  getAllMatches,
  deleteMatch,
  getUserMatches,
};




