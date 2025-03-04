import express from "express";
import { getUserById } from "../controllers/userController.js";
import { updateProfile, getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", getUserById);
router.patch("/update-profile", updateProfile);  // Update user profile
router.get("/profile/:id", getUserProfile);  // Fetch user profile

export default router;
