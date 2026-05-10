import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/**
 * @desc    Get community analytics from saved resume analyses
 * @route   GET /api/community/stats
 * @access  Public
 */
export const getCommunityStats = asyncHandler(async (req, res) => {
  const [
    totalAnalyses,
    averageReadiness,
    popularTargetRoles,
    commonMissingSkills,
    popularRoadmapSkills,
  ] = await Promise.all([
    // Total analyses count
    Analysis.countDocuments(),

    // Average job readiness score
    Analysis.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$jobReadiness" },
        },
      },
    ]),

    // Most selected target roles
    Analysis.aggregate([
      {
        $match: {
          targetRole: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$targetRole",
          count: { $sum: 1 },
          roleTitle: { $first: "$roleTitle" },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          role: "$_id",
          roleTitle: { $ifNull: ["$roleTitle", ""] },
          count: 1,
        },
      },
    ]),

    // Most common missing skills
    Analysis.aggregate([
      {
        $unwind: {
          path: "$missingSkills",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$missingSkills",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          _id: 0,
          skill: "$_id",
          count: 1,
        },
      },
    ]),

    // Popular roadmap skills from AI roadmap and fallback roadmap
    Analysis.aggregate([
      {
        $project: {
          combinedRoadmap: {
            $concatArrays: [
              { $ifNull: ["$aiRoadmap", []] },
              { $ifNull: ["$roadmap", []] },
            ],
          },
        },
      },
      {
        $unwind: {
          path: "$combinedRoadmap",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "combinedRoadmap.skill": { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$combinedRoadmap.skill",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          _id: 0,
          skill: "$_id",
          count: 1,
        },
      },
    ]),
  ]);

  const averageScore =
    averageReadiness.length > 0 && averageReadiness[0].averageScore
      ? Math.round(averageReadiness[0].averageScore)
      : 0;

  const mostPopularTargetRole = popularTargetRoles[0] || null;
  const mostCommonMissingSkill = commonMissingSkills[0] || null;
  const topRoadmapSkill = popularRoadmapSkills[0] || null;

  res.status(200).json({
    success: true,
    data: {
      totalAnalyses,
      averageReadinessScore: averageScore,
      mostPopularTargetRole,
      mostCommonMissingSkill,
      topRoadmapSkill,
      popularTargetRoles,
      commonMissingSkills,
      popularRoadmapSkills,
    },
  });
});
