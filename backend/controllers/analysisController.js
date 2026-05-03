import Analysis from "../models/Analysis.js";

export const getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .select(
        "resumeName targetRole roleTitle jobReadiness roadmapSource aiProviderUsed createdAt",
      );

    res.json({
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch analysis history",
      details: error.message,
    });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        error: "Analysis not found",
      });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch analysis",
      details: error.message,
    });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        error: "Analysis not found",
      });
    }

    res.json({
      message: "Analysis deleted successfully",
      deletedId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete analysis",
      details: error.message,
    });
  }
};
