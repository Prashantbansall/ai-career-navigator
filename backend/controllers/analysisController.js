import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { roleSkills } from "../utils/roleSkills.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const validRoles = ["All", ...Object.keys(roleSkills)];

export const getAllAnalyses = asyncHandler(async (req, res) => {
  const { search = "", role = "All", page = 1, limit = 6 } = req.query;

  if (!validRoles.includes(role)) {
    throw new AppError(
      `Invalid role filter. Valid roles are: ${validRoles.join(", ")}`,
      400,
    );
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 6, 1), 20);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {};

  if (role && role !== "All") {
    query.targetRole = role;
  }

  if (search.trim()) {
    const safeSearch = escapeRegex(search.trim());
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
      pages,
      hasMore: pageNumber < pages,
      analyses,
    },
  });
});

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
