import { GoogleGenAI } from "@google/genai";
import { aiConfig } from "../config/aiConfig.js";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  return new GoogleGenAI({ apiKey });
};

const extractJsonFromText = (text) => {
  if (!text) {
    throw new Error("Empty response from AI model");
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain valid JSON");
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Invalid AI JSON:", jsonString);
    throw new Error("AI returned invalid JSON format");
  }
};

const validateAIResult = (result) => {
  return {
    aiSummary:
      result.aiSummary ||
      "AI generated a roadmap, but no summary was provided.",

    aiRecommendations: Array.isArray(result.aiRecommendations)
      ? result.aiRecommendations
      : [],

    aiRoadmap: Array.isArray(result.aiRoadmap)
      ? result.aiRoadmap.map((item, index) => ({
          week: item.week || `Week ${index + 1}`,
          skill: item.skill || "General Skill",
          learn: item.learn || "Learn the fundamentals of this topic.",
          howToLearn:
            item.howToLearn ||
            "Follow official documentation, watch free tutorials, and practice with small tasks.",
          resource:
            item.resource ||
            "Use freeCodeCamp, official documentation, or beginner-friendly YouTube tutorials.",
          project:
            item.project || "Build a small practical project using this skill.",
          difficulty: item.difficulty || "Beginner",
          timeEstimate: item.timeEstimate || "5-7 hours",
        }))
      : [],
  };
};

export const generateAIRoadmap = async ({
  targetRole,
  roleTitle,
  extractedSkills,
  requiredSkills,
  matchedSkills,
  missingSkills,
  jobReadiness,
}) => {
  if (aiConfig.provider !== "gemini") {
    throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
  }

  const ai = getGeminiClient();

  if (missingSkills.length === 0) {
    return {
      aiSummary:
        "Your resume already matches the selected role well. Focus on building advanced projects, improving resume impact, and preparing for interviews.",
      aiRecommendations: [
        "Build one advanced project with deployment and GitHub documentation.",
        "Practice role-specific interview questions and revise fundamentals.",
        "Improve resume bullet points with measurable outcomes and technical depth.",
      ],
      aiRoadmap: [],
    };
  }

  const prompt = `
You are an expert AI career coach and technical mentor.

Create a personalized career roadmap for a student preparing for this target role.

Candidate target role:
${targetRole} - ${roleTitle}

Extracted resume skills:
${extractedSkills.join(", ") || "None detected"}

Required skills for target role:
${requiredSkills.join(", ")}

Matched skills:
${matchedSkills.join(", ") || "None"}

Missing skills:
${missingSkills.join(", ") || "None"}

Current job readiness score:
${jobReadiness}%

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation outside JSON.
Do not include code fences.

Required JSON format:
{
  "aiSummary": "2-3 sentence personalized summary about the candidate's current readiness and focus areas.",
  "aiRecommendations": [
    "specific recommendation 1",
    "specific recommendation 2",
    "specific recommendation 3"
  ],
  "aiRoadmap": [
    {
      "week": "Week 1",
      "skill": "skill name",
      "learn": "exact topics to learn",
      "howToLearn": "step-by-step learning method",
      "resource": "one free resource name",
      "project": "mini project idea",
      "difficulty": "Beginner | Intermediate | Advanced",
      "timeEstimate": "estimated time like 5-7 hours"
    }
  ]
}

Rules:
- Generate roadmap only for missing skills.
- Maximum 8 weeks.
- Group related skills when useful.
- Keep it practical for a college student.
- Use free learning resources only.
- Mini projects should be resume-worthy.
- Avoid vague advice.
- Every field must be a string except arrays.
`;

  const response = await ai.models.generateContent({
    model: aiConfig.geminiModel,
    contents: prompt,
  });

  const parsed = extractJsonFromText(response.text);
  return validateAIResult(parsed);
};
