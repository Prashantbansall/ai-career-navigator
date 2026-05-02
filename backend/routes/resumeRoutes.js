import express from "express";
import multer from "multer";
import {
  uploadResume,
  extractResume,
  analyzeResume,
} from "../controllers/resumeController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/extract", upload.single("resume"), extractResume);
router.post("/analyze", upload.single("resume"), analyzeResume);

export default router;
