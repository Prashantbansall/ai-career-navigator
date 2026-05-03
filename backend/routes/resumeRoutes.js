import express from "express";
import multer from "multer";
import {
  uploadResume,
  extractResume,
  analyzeResume,
} from "../controllers/resumeController.js";
import { uploadErrorHandler } from "../middleware/uploadErrorHandler.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const safeFileName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeFileName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/upload",
  upload.single("resume"),
  uploadErrorHandler,
  uploadResume,
);

router.post(
  "/extract",
  upload.single("resume"),
  uploadErrorHandler,
  extractResume,
);

router.post(
  "/analyze",
  upload.single("resume"),
  uploadErrorHandler,
  analyzeResume,
);

export default router;
