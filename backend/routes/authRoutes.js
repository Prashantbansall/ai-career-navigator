import express from "express";
import {
  getCurrentUser,
  getUserProfileSummary,
  loginUser,
  registerUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, getUserProfileSummary);

export default router;
