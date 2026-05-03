import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getAllAnalyses = asyncHandler(async (req, res) => {
  const { search = "", role = "All", page = 1, limit = 6 } = req.query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 6, 1), 20);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {};

  if (role && role !== "All") {
    query.targetRole = role;
  }

  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");

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

  const pages = Math.ceil(total / limitNumber);

  res.json({
    success: true,
    message: "Analysis history fetched successfully",
    count: analyses.length,
    total,
    page: pageNumber,
    pages,
    hasMore: pageNumber < pages,
    analyses,
  });
});

export const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);

  if (!analysis) {
    res.status(404);
    throw new Error("Analysis not found");
  }

  res.json({
    success: true,
    message: "Analysis fetched successfully",
    analysis,
  });
});

export const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findByIdAndDelete(req.params.id);

  if (!analysis) {
    res.status(404);
    throw new Error("Analysis not found");
  }

  res.json({
    success: true,
    message: "Analysis deleted successfully",
    deletedId: req.params.id,
  });
});
