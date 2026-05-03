import express from "express";
import {
  getAllAnalyses,
  getAnalysisById,
  deleteAnalysis,
} from "../controllers/analysisController.js";

const router = express.Router();

router.get("/", getAllAnalyses);
router.get("/:id", getAnalysisById);
router.delete("/:id", deleteAnalysis);

export default router;
