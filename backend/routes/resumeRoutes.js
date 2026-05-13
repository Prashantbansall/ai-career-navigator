import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import {
  uploadResume,
  extractResume,
  analyzeResume,
} from "../controllers/resumeController.js";
import { uploadErrorHandler } from "../middleware/uploadErrorHandler.js";
import { validateTargetRole } from "../middleware/validateTargetRole.js";
import { protect } from "../middleware/authMiddleware.js";
import { getUploadDirectory, uploadConfig } from "../config/security.js";

const router = express.Router();

const uploadDirectory = getUploadDirectory();
fs.mkdirSync(uploadDirectory, { recursive: true });

const sanitizeFileName = (originalName = "resume.pdf") => {
  const parsed = path.parse(path.basename(originalName));
  const safeBaseName =
    parsed.name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "resume";

  return `${safeBaseName}.pdf`;
};

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${sanitizeFileName(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isAllowedMimeType = uploadConfig.allowedMimeTypes.includes(
    file.mimetype,
  );
  const isAllowedExtension = uploadConfig.allowedExtensions.includes(extension);

  if (!isAllowedMimeType || !isAllowedExtension) {
    return cb(new Error("Only PDF files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSizeMb * 1024 * 1024,
    files: 1,
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
  protect,
  upload.single("resume"),
  uploadErrorHandler,
  validateTargetRole,
  analyzeResume,
);

export default router;
