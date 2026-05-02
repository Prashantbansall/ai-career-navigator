import fs from "fs";
import { createRequire } from "module";
import { extractSkills } from "../utils/skillExtractor.js";
import { roleSkills } from "../utils/roleSkills.js";
import { generateRoadmap } from "./roadmapService.js";

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

export const analyzeText = (text, selectedRole = "SDE") => {
  const extractedSkills = extractSkills(text);

  const roleData = roleSkills[selectedRole] || roleSkills.SDE;
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

  const roadmap = generateRoadmap(missingSkills);

  return {
    targetRole: selectedRole,
    roleTitle: roleData.title,
    extractedSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    jobReadiness,
    roadmap,
  };
};
