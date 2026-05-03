import mongoose from "mongoose";

const roadmapItemSchema = new mongoose.Schema(
  {
    week: String,
    skill: String,
    learn: String,
    howToLearn: String,
    resource: String,
    project: String,
    difficulty: String,
    timeEstimate: String,
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema(
  {
    resumeName: {
      type: String,
      default: "Untitled Resume",
    },

    targetRole: {
      type: String,
      required: true,
    },

    roleTitle: {
      type: String,
      default: "",
    },

    extractedSkills: {
      type: [String],
      default: [],
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    jobReadiness: {
      type: Number,
      default: 0,
    },

    readinessReason: {
      type: String,
      default: "",
    },

    roadmap: {
      type: [roadmapItemSchema],
      default: [],
    },

    aiSummary: {
      type: String,
      default: "",
    },

    aiRecommendations: {
      type: [String],
      default: [],
    },

    aiRoadmap: {
      type: [roadmapItemSchema],
      default: [],
    },

    aiEnabled: {
      type: Boolean,
      default: false,
    },

    aiError: {
      type: String,
      default: "",
    },

    roadmapSource: {
      type: String,
      default: "fallback",
    },

    aiProviderUsed: {
      type: String,
      default: "",
    },

    aiModelUsed: {
      type: String,
      default: "",
    },

    promptVersion: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
