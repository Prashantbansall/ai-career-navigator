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

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const validRoles = ["All", ...Object.keys(roleSkills)];

const parsePositiveNumber = (value, fallback) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return number;
};

const parseScoreNumber = (value, fallback) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, 0), 100);
};

const getSortOption = (sort = "newest") => {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "readiness-high": { jobReadiness: -1, createdAt: -1 },
    "readiness-low": { jobReadiness: 1, createdAt: -1 },
  };

  return sortMap[sort] || sortMap.newest;
};

/**
 * GET /api/analysis
 *
 * Fetches only the logged-in user's saved analyses.
 */
export const getAllAnalyses = asyncHandler(async (req, res) => {
  const {
    search = "",
    role = "All",
    minReadiness,
    maxReadiness,
    sort = "newest",
    page = 1,
    limit = 6,
  } = req.query;

  if (!req.user?._id) {
    throw new AppError("Not authorized, user missing", 401);
  }

  if (!validRoles.includes(role)) {
    throw new AppError(
      `Invalid role filter. Valid roles are: ${validRoles.join(", ")}`,
      400,
    );
  }

  const pageNumber = parsePositiveNumber(page, 1);
  const limitNumber = Math.min(parsePositiveNumber(limit, 6), 20);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {
    userId: req.user._id,
  };

  if (role !== "All") {
    query.targetRole = role;
  }

  const normalizedMinReadiness = parseScoreNumber(minReadiness, 0);
  const normalizedMaxReadiness = parseScoreNumber(maxReadiness, 100);

  if (minReadiness !== undefined || maxReadiness !== undefined) {
    query.jobReadiness = {
      $gte: Math.min(normalizedMinReadiness, normalizedMaxReadiness),
      $lte: Math.max(normalizedMinReadiness, normalizedMaxReadiness),
    };
  }

  const normalizedSearch = String(search).trim();

  if (normalizedSearch) {
    const safeSearch = escapeRegex(normalizedSearch);
    const searchRegex = new RegExp(safeSearch, "i");

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
    .sort(getSortOption(sort))
    .skip(skip)
    .limit(limitNumber)
    .select(
      "resumeName targetRole roleTitle jobReadiness roadmapSource aiProviderUsed createdAt userId",
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
 * Fetches one complete saved analysis only if it belongs to the logged-in user.
 */
export const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

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
 * Exports only the logged-in user's saved analysis as PDF.
 */
export const exportAnalysisPdf = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

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
 * Deletes only the logged-in user's saved analysis.
 */
export const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    throw new AppError("Analysis not found", 404);
  }

  await analysis.deleteOne();

  res.json({
    success: true,
    message: "Analysis deleted successfully",
    data: {
      deletedId: req.params.id,
    },
  });
});
