import { parsePDF, analyzeText } from "../services/resumeService.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    res.json({
      message: "Resume uploaded successfully",
      file: req.file.filename,
      path: req.file.path,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
};

export const extractResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const text = await parsePDF(req.file.path);

    res.json({
      message: "Text extracted successfully",
      extractedText: text.substring(0, 2000),
    });
  } catch (err) {
    console.error("Extraction error:", err);
    res.status(500).json({
      error: "Extraction failed",
      details: err.message,
    });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const selectedRole = req.body.targetRole || "SDE";

    const text = await parsePDF(req.file.path);
    const result = analyzeText(text, selectedRole);

    res.json({
      message: "Resume analyzed successfully",
      ...result,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({
      error: "Analysis failed",
      details: err.message,
    });
  }
};
