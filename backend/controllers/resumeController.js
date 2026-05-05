/**
 * resumeController.js
 *
 * Handles resume-related API endpoints:
 * - Upload resume
 * - Extract text from resume
 * - Analyze resume and save result to MongoDB
 *
 * Controllers should stay thin:
 * complex parsing, skill extraction, AI generation, and roadmap logic belong
 * inside service files.
 */

import fs from "fs";
import { parsePDF, analyzeText } from "../services/resumeService.js";
import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

/**
 * Deletes a temporary uploaded file from the server.
 *
 * Uploaded resumes are only needed during request processing. Cleaning them
 * prevents the uploads folder from growing forever during local/deployed usage.
 */
const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Validates that the request contains a PDF resume file.
 *
 * Multer handles the upload, but this extra controller-level validation keeps
 * API responses clear and consistent.
 */
const validateUploadedFile = (req) => {
  if (!req.file) {
    throw new AppError("No resume file uploaded", 400);
  }

  if (req.file.mimetype !== "application/pdf") {
    throw new AppError("Only PDF resumes are allowed", 400);
  }
};

/**
 * POST /api/resume/upload
 *
 * Test/helper endpoint that verifies resume upload works.
 * The file is deleted immediately after confirmation because this project
 * processes resumes during extract/analyze requests instead of storing files.
 */
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
    // Always clean uploaded files after processing to avoid filling disk space.
    deleteUploadedFile(req.file?.path);
  }
});

/**
 * POST /api/resume/extract
 *
 * Extracts readable text from a PDF resume.
 * This endpoint is useful for testing PDF parsing separately from full analysis.
 */
export const extractResume = asyncHandler(async (req, res) => {
  try {
    validateUploadedFile(req);

    const text = await parsePDF(req.file.path);

    res.json({
      success: true,
      message: "Text extracted successfully",
      data: {
        // Limit preview text so API responses do not become unnecessarily large.
        extractedText: text.substring(0, 3000),
      },
    });
  } finally {
    // Always clean uploaded files after processing to avoid filling disk space.
    deleteUploadedFile(req.file?.path);
  }
});

/**
 * POST /api/resume/analyze
 *
 * Receives a PDF resume and target role, extracts resume text, analyzes skills,
 * generates roadmap data, saves the result to MongoDB, and returns the saved
 * analysis object to the frontend dashboard.
 */
export const analyzeResume = asyncHandler(async (req, res) => {
  try {
    validateUploadedFile(req);

    const selectedRole = req.body.targetRole || "SDE";

    // PDF parsing and resume analysis are kept in services so this controller
    // remains focused on HTTP request/response handling.
    const text = await parsePDF(req.file.path);
    const result = await analyzeText(text, selectedRole);

    // Save every analysis so users can reopen it from History later.
    const savedAnalysis = await Analysis.create({
      resumeName: req.file.originalname,
      ...result,
    });

    // Return frontend-friendly fields while preserving MongoDB id and timestamp.
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
    // Always clean uploaded files after processing to avoid filling disk space.
    deleteUploadedFile(req.file?.path);
  }
});
