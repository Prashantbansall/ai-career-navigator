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

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const handleSingleResumeUpload = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: "File upload error",
        details: err.message,
      });
    }

    next();
  });
};

router.post("/upload", handleSingleResumeUpload, uploadResume);
router.post("/extract", handleSingleResumeUpload, extractResume);
router.post("/analyze", handleSingleResumeUpload, analyzeResume);

export default router;
