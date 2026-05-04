import fs from "fs";
import { parsePDF, analyzeText } from "../services/resumeService.js";
import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const validateUploadedFile = (req) => {
  if (!req.file) {
    throw new AppError("No resume file uploaded", 400);
  }

  if (req.file.mimetype !== "application/pdf") {
    throw new AppError("Only PDF resumes are allowed", 400);
  }
};

export const uploadResume = asyncHandler(async (req, res) => {
  try {
    validateUploadedFile(req);

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        file: req.file.filename,
        originalName: req.file.originalname,
      },
    });
  } finally {
    deleteUploadedFile(req.file?.path);
  }
});

export const extractResume = asyncHandler(async (req, res) => {
  try {
    validateUploadedFile(req);

    const text = await parsePDF(req.file.path);

    res.json({
      success: true,
      message: "Text extracted successfully",
      data: {
        extractedText: text.substring(0, 3000),
      },
    });
  } finally {
    deleteUploadedFile(req.file?.path);
  }
});

export const analyzeResume = asyncHandler(async (req, res) => {
  try {
    validateUploadedFile(req);

    const selectedRole = req.body.targetRole || "SDE";

    const text = await parsePDF(req.file.path);
    const result = await analyzeText(text, selectedRole);

    const savedAnalysis = await Analysis.create({
      resumeName: req.file.originalname,
      ...result,
    });

    const analysisResponse = {
      analysisId: savedAnalysis._id,
      _id: savedAnalysis._id,
      resumeName: savedAnalysis.resumeName,
      createdAt: savedAnalysis.createdAt,
      ...result,
    };

    res.json({
      success: true,
      message: "Resume analyzed successfully",
      data: {
        analysis: analysisResponse,
      },
    });
  } finally {
    deleteUploadedFile(req.file?.path);
  }
});
