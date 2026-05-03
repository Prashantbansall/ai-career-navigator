import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";

export const getAllAnalyses = async (req, res) => {
  try {
    const { search = "", role = "All", page = 1, limit = 6 } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    // Role filter
    if (role && role !== "All") {
      query.targetRole = role;
    }

    // Search filter
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch analysis history",
      details: error.message,
    });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid analysis ID",
      });
    }

    const analysis = await Analysis.findById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "Analysis not found",
      });
    }

    res.json({
      success: true,
      message: "Analysis fetched successfully",
      analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch analysis",
      details: error.message,
    });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid analysis ID",
      });
    }

    const analysis = await Analysis.findByIdAndDelete(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "Analysis not found",
      });
    }

    res.json({
      success: true,
      message: "Analysis deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete analysis",
      details: error.message,
    });
  }
};
