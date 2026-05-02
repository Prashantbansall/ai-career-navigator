import fs from "fs";
import { createRequire } from "module";
import { extractSkills } from "../utils/skillExtractor.js";
import { roleSkills } from "../utils/roleSkills.js";
import { generateRoadmap } from "./roadmapService.js";
import { generateAIRoadmap } from "./aiRoadmapService.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

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

export const analyzeText = async (text, selectedRole = "SDE") => {
  if (!roleSkills[selectedRole]) {
    const validRoles = Object.keys(roleSkills).join(", ");
    const error = new Error(
      `Invalid target role. Valid roles are: ${validRoles}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const extractedSkills = extractSkills(text);

  const roleData = roleSkills[selectedRole];
  const requiredSkills = roleData.requiredSkills;

  const matchedSkills = requiredSkills.filter((skill) =>
    extractedSkills.includes(skill),
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !extractedSkills.includes(skill),
  );

  const jobReadiness = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100,
  );

  const readinessReason = `You match ${matchedSkills.length} out of ${requiredSkills.length} required skills for ${selectedRole}.`;

  const fallbackRoadmap = generateRoadmap(missingSkills);

  let aiSummary = "";
  let aiRecommendations = [];
  let aiRoadmap = fallbackRoadmap;
  let aiEnabled = false;

  try {
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
  } catch (error) {
    console.error("AI roadmap generation failed:", error.message);
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
    roadmap: fallbackRoadmap,
    aiSummary,
    aiRecommendations,
    aiRoadmap,
    aiEnabled,
  };
};
