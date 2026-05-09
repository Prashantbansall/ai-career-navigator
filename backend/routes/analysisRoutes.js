import express from "express";
import {
  getAllAnalyses,
  getAnalysisById,
  exportAnalysisPdf,
  deleteAnalysis,
} from "../controllers/analysisController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getAllAnalyses);

// Backend PDF export route.
router.get("/:id/pdf", validateObjectId, exportAnalysisPdf);

router.get("/:id", validateObjectId, getAnalysisById);
router.delete("/:id", validateObjectId, deleteAnalysis);

export default router;
