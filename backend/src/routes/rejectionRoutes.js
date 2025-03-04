import express from "express";
import { rejectMatch, getRejectedMatches } from "../controllers/rejectionController.js";

const router = express.Router();

router.post("/", rejectMatch);
router.get("/:userId", getRejectedMatches);

export default router;
