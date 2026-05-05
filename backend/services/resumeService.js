/**
 * resumeService.js
 *
 * Handles the core resume analysis workflow:
 * 1. Extract text from uploaded PDF resumes
 * 2. Detect skills using the skill extractor utility
 * 3. Compare extracted skills against target role requirements
 * 4. Calculate job readiness score
 * 5. Generate a rule-based fallback roadmap
 * 6. Optionally enhance output using AI roadmap generation
 *
 * This service keeps business logic separate from controllers so API handlers
 * remain thin and easier to test.
 */

import fs from "fs";
import { createRequire } from "module";
import { extractSkills } from "../utils/skillExtractor.js";
import { roleSkills } from "../utils/roleSkills.js";
import { generateRoadmap } from "./roadmapService.js";
import { generateAIRoadmap } from "./aiRoadmapService.js";
import AppError from "../utils/AppError.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Extracts readable text from an uploaded PDF resume.
 *
 * This function is intentionally separated from analysis logic so PDF parsing
 * can be tested, debugged, or replaced independently in the future.
 */
export const parsePDF = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Uploaded file not found: " + filePath);
  }

  const buffer = fs.readFileSync(filePath);

  if (!buffer || buffer.length === 0) {
    throw new Error("Uploaded file is empty");
  }

  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error("No readable text found in PDF");
  }

  return data.text;
};

/**
 * Analyzes extracted resume text for a selected target role.
 *
 * Flow:
 * 1. Validate selected target role
 * 2. Extract skills from resume text
 * 3. Load required skills for selected role
 * 4. Calculate matched and missing skills
 * 5. Calculate job readiness score
 * 6. Generate fallback roadmap from missing skills
 * 7. Try AI roadmap generation
 * 8. Return AI-enhanced result if available, otherwise fallback result
 */
export const analyzeText = async (text, selectedRole = "SDE") => {
  // Keep backend validation here as a safety net even though route middleware
  // also validates targetRole before calling the service.
  if (!roleSkills[selectedRole]) {
    throw new AppError("Invalid target role", 400);
  }

  // Skill extraction is handled by a dedicated utility so aliases and
  // normalization rules stay centralized.
  const extractedSkills = extractSkills(text);

  const roleData = roleSkills[selectedRole];
  const requiredSkills = roleData.requiredSkills;

  // Matched skills are the required role skills already detected in the resume.
  const matchedSkills = requiredSkills.filter((skill) =>
    extractedSkills.includes(skill),
  );

  // Missing skills become the main input for roadmap generation.
  const missingSkills = requiredSkills.filter(
    (skill) => !extractedSkills.includes(skill),
  );

  // Readiness score is based on how many required skills are matched.
  // Example: 8 matched skills out of 11 required skills = 73%.
  const jobReadiness = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100,
  );

  const readinessReason = `You match ${matchedSkills.length} out of ${requiredSkills.length} required skills for ${selectedRole}.`;

  // Fallback roadmap ensures the app still returns useful guidance if AI
  // providers fail, timeout, or API keys are missing.
  const fallbackRoadmap = generateRoadmap(missingSkills);

  let aiSummary = "";
  let aiRecommendations = [];
  let aiRoadmap = fallbackRoadmap;
  let aiEnabled = false;
  let aiError = "";
  let roadmapSource = "fallback";
  let aiProviderUsed = "";
  let aiModelUsed = "";
  let promptVersion = "";

  try {
    // AI generation is optional. If it succeeds, the dashboard shows richer
    // recommendations. If it fails, the catch block keeps the fallback result.
    const aiResult = await generateAIRoadmap({
      targetRole: selectedRole,
      roleTitle: roleData.title,
      extractedSkills,
      requiredSkills,
      matchedSkills,
      missingSkills,
      jobReadiness,
    });

    aiSummary = aiResult.aiSummary || "";
    aiRecommendations = aiResult.aiRecommendations || [];
    aiRoadmap = aiResult.aiRoadmap || fallbackRoadmap;
    aiEnabled = true;
    aiProviderUsed = aiResult.aiProviderUsed || "unknown";
    aiModelUsed = aiResult.aiModelUsed || "";
    promptVersion = aiResult.promptVersion || "";
    roadmapSource = "ai";
  } catch (error) {
    console.error("AI roadmap generation failed:", error.message);

    aiError =
      "AI roadmap generation failed, so a rule-based fallback roadmap was used.";
  }

  return {
    targetRole: selectedRole,
    roleTitle: roleData.title,
    extractedSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    jobReadiness,
    readinessReason,

    // `roadmap` always stores the deterministic fallback roadmap for reliability.
    roadmap: fallbackRoadmap,

    // AI fields are used by the dashboard when AI generation succeeds.
    aiSummary,
    aiRecommendations,
    aiRoadmap,
    aiEnabled,
    aiError,
    roadmapSource,
    aiProviderUsed,
    aiModelUsed,
    promptVersion,
  };
};
