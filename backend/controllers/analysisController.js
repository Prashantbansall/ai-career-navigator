/**
 * analysisController.js
 *
 * Handles saved resume analysis history:
 * - list analyses with search, role filter, and pagination
 * - get a single saved analysis by MongoDB ID
 * - delete a saved analysis by MongoDB ID
 *
 * This controller powers the History page and Dashboard recent analyses.
 */

import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { roleSkills } from "../utils/roleSkills.js";
import { generateAnalysisPdfBuffer } from "../services/pdfReportService.js";

/**
 * Escapes user search input before creating a RegExp.
 *
 * This prevents special regex characters like *, ?, [, ], (, ) from breaking
 * search behavior or causing unexpected regex matching.
 */
const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// "All" is used by the frontend to disable role filtering.
const validRoles = ["All", ...Object.keys(roleSkills)];

/**
 * Converts query parameters into safe positive numbers.
 *
 * If the user sends invalid values like page=abc or limit=-5, we fallback to
 * safe defaults instead of crashing or creating invalid database queries.
 */
const parsePositiveNumber = (value, fallback) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return number;
};

/**
 * GET /api/analysis
 *
 * Fetches saved analysis history with:
 * - search by resume name, target role, role title, AI provider, or source
 * - role filtering
 * - pagination using page and limit
 *
 * Example:
 * /api/analysis?search=sde&role=SDE&page=1&limit=6
 */
export const getAllAnalyses = asyncHandler(async (req, res) => {
  const { search = "", role = "All", page = 1, limit = 6 } = req.query;

  // Validate role filter so invalid role names return a clear API error.
  if (!validRoles.includes(role)) {
    throw new AppError(
      `Invalid role filter. Valid roles are: ${validRoles.join(", ")}`,
      400,
    );
  }

  // Clamp pagination values to safe limits.
  // Maximum limit is capped to prevent large database reads.
  const pageNumber = parsePositiveNumber(page, 1);
  const limitNumber = Math.min(parsePositiveNumber(limit, 6), 20);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {};

  if (role !== "All") {
    query.targetRole = role;
  }

  const normalizedSearch = String(search).trim();

  if (normalizedSearch) {
    const safeSearch = escapeRegex(normalizedSearch);
    const searchRegex = new RegExp(safeSearch, "i");

    // Search across the fields shown in history cards.
    query.$or = [
      { resumeName: searchRegex },
      { targetRole: searchRegex },
      { roleTitle: searchRegex },
      { aiProviderUsed: searchRegex },
      { roadmapSource: searchRegex },
    ];
  }

  const total = await Analysis.countDocuments(query);

  const analyses = await Analysis.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .select(
      "resumeName targetRole roleTitle jobReadiness roadmapSource aiProviderUsed createdAt",
    );

  const pages = Math.max(Math.ceil(total / limitNumber), 1);

  res.json({
    success: true,
    message: "Analysis history fetched successfully",
    data: {
      count: analyses.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      pages,
      hasMore: pageNumber < pages,
      analyses,
    },
  });
});

/**
 * GET /api/analysis/:id
 *
 * Fetches one complete saved analysis for:
 * - opening old results in Dashboard
 * - showing Analysis Detail page
 */
export const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);

  if (!analysis) {
    throw new AppError("Analysis not found", 404);
  }

  res.json({
    success: true,
    message: "Analysis fetched successfully",
    data: {
      analysis,
    },
  });
});

/**
 * GET /api/analysis/:id/pdf
 *
 * Generates and downloads a PDF report for a saved analysis.
 *
 * This is the backend PDF export version using Puppeteer.
 * Unlike frontend screenshot-based PDF export, this generates a cleaner,
 * print-friendly PDF directly from saved MongoDB analysis data.
 */
export const exportAnalysisPdf = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);

  if (!analysis) {
    throw new AppError("Analysis not found", 404);
  }

  const pdfBuffer = await generateAnalysisPdfBuffer(analysis);

  if (!pdfBuffer || !pdfBuffer.length) {
    throw new AppError("PDF generation failed. Please try again.", 500);
  }

  const createSafeFilePart = (value = "") => {
    return String(value)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  };

  const createTimestamp = () => {
    const now = new Date();

    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5).replace(":", "");

    return `${date}-${time}`;
  };

  const safeResumeName = createSafeFilePart(
    analysis.resumeName || "resume-report",
  );

  const safeTargetRole = createSafeFilePart(
    analysis.targetRole || "career-roadmap",
  );

  const fileName = `ai-career-navigator-${safeResumeName}-${safeTargetRole}-${createTimestamp()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", pdfBuffer.length);

  res.send(pdfBuffer);
});

/**
 * DELETE /api/analysis/:id
 *
 * Deletes a saved analysis from MongoDB history.
 * This does not affect uploaded files because resume PDFs are already cleaned
 * after processing.
 */
export const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findByIdAndDelete(req.params.id);

  if (!analysis) {
    throw new AppError("Analysis not found", 404);
  }

  res.json({
    success: true,
    message: "Analysis deleted successfully",
    data: {
      deletedId: req.params.id,
    },
  });
});
