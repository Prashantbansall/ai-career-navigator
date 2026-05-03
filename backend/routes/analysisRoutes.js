import express from "express";
import {
  getAllAnalyses,
  getAnalysisById,
  deleteAnalysis,
} from "../controllers/analysisController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getAllAnalyses);
router.get("/:id", validateObjectId, getAnalysisById);
router.delete("/:id", validateObjectId, deleteAnalysis);

export default router;
