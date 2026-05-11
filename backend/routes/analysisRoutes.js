import express from "express";
import {
  getAllAnalyses,
  getAnalysisById,
  exportAnalysisPdf,
  deleteAnalysis,
} from "../controllers/analysisController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllAnalyses);
router.get("/:id/pdf", protect ,validateObjectId, exportAnalysisPdf);
router.get("/:id", protect ,validateObjectId, getAnalysisById);
router.delete("/:id", protect ,validateObjectId, deleteAnalysis);

export default router;
