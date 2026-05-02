import fs from "fs";
import { parsePDF, analyzeText } from "../services/resumeService.js";

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const validateUploadedFile = (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No resume file uploaded" });
    return false;
  }

  if (req.file.mimetype !== "application/pdf") {
    deleteUploadedFile(req.file.path);
    res.status(400).json({ error: "Only PDF resumes are allowed" });
    return false;
  }

  return true;
};

export const uploadResume = async (req, res) => {
  try {
    if (!validateUploadedFile(req, res)) return;

    deleteUploadedFile(req.file.path);

    res.json({
      message: "Resume uploaded successfully",
      file: req.file.filename,
    });
  } catch (err) {
    console.error("Upload error:", err);

    if (req.file?.path) {
      deleteUploadedFile(req.file.path);
    }

    res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
};

export const extractResume = async (req, res) => {
  try {
    if (!validateUploadedFile(req, res)) return;

    const text = await parsePDF(req.file.path);

    deleteUploadedFile(req.file.path);

    res.json({
      message: "Text extracted successfully",
      extractedText: text.substring(0, 3000),
    });
  } catch (err) {
    console.error("Extraction error:", err);

    if (req.file?.path) {
      deleteUploadedFile(req.file.path);
    }

    res.status(err.statusCode || 500).json({
      error: "Extraction failed",
      details: err.message,
    });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    if (!validateUploadedFile(req, res)) return;

    const selectedRole = req.body.targetRole || "SDE";

    const text = await parsePDF(req.file.path);
    const result = await analyzeText(text, selectedRole);

    deleteUploadedFile(req.file.path);

    res.json({
      message: "Resume analyzed successfully",
      ...result,
    });
  } catch (err) {
    console.error("Analysis error:", err);

    if (req.file?.path) {
      deleteUploadedFile(req.file.path);
    }

    res.status(err.statusCode || 500).json({
      error: "Analysis failed",
      details: err.message,
    });
  }
};
