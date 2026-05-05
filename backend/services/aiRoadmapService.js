/**
 * aiRoadmapService.js
 *
 * Handles AI-powered roadmap generation using multiple providers.
 *
 * Current strategy:
 * 1. Build a strict JSON prompt from resume analysis data
 * 2. Try the primary AI provider first
 * 3. If the primary provider fails, try the fallback provider
 * 4. Parse and validate the AI response before returning it
 *
 * This service is intentionally isolated so the rest of the backend can keep
 * working even if AI providers change later.
 */

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { aiConfig } from "../config/aiConfig.js";

/**
 * Creates a Gemini client using the API key from environment variables.
 *
 * Keeping client creation in a function allows tests and runtime checks to fail
 * clearly when the API key is missing.
 */
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

/**
 * Creates an OpenAI client using the API key from environment variables.
 *
 * OpenAI can be used either as the primary provider or as a fallback provider.
 */
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

/**
 * Safely extracts JSON from AI-generated text.
 *
 * AI models sometimes return JSON inside markdown code fences, or include small
 * extra text around the JSON. This helper strips code fences and extracts the
 * first valid JSON object block before parsing.
 */
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

/**
 * Normalizes the AI result into the exact structure expected by the frontend.
 *
 * This prevents missing or malformed AI fields from breaking the dashboard.
 * If the AI omits a field, we provide a sensible default.
 */
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
          timeEstimate: item.timeEstimate || "10-15 hours",
        }))
      : [],
  };
};

/**
 * Builds the AI prompt for roadmap generation.
 *
 * The prompt strongly asks for valid JSON only because the backend parses the
 * model output and sends structured data to the React dashboard.
 */
const buildRoadmapPrompt = ({
  targetRole,
  roleTitle,
  extractedSkills,
  requiredSkills,
  matchedSkills,
  missingSkills,
  jobReadiness,
}) => {
  return `
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
      "resource": "one or two free resource name",
      "project": "mini project idea",
      "difficulty": "Beginner | Intermediate | Advanced",
      "timeEstimate": "estimated time like 10-15 hours"
    }
  ]
}

Rules:
- Generate roadmap only for missing skills.
- Maximum 12 weeks.
- Group related skills when useful.
- Keep it practical for a college student.
- Use free learning resources only.
- Mini projects should be resume-worthy.
- Avoid vague advice.
- Every field must be a string except arrays.
`;
};

/**
 * Generates roadmap text using Gemini.
 *
 * The response is returned as raw text first, then parsed by extractJsonFromText.
 */
const generateWithGemini = async (prompt) => {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: aiConfig.geminiModel,
    contents: prompt,
  });

  return response.text;
};

/**
 * Generates roadmap text using OpenAI.
 *
 * This can be configured as primary provider or fallback provider.
 */
const generateWithOpenAI = async (prompt) => {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: aiConfig.openaiModel,
    input: prompt,
  });

  return response.output_text;
};

/**
 * Routes generation to the selected provider.
 *
 * Adding another provider later only requires adding another branch here and
 * updating aiConfig.
 */
const generateWithProvider = async (provider, prompt) => {
  if (provider === "gemini") {
    return generateWithGemini(prompt);
  }

  if (provider === "openai") {
    return generateWithOpenAI(prompt);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
};

/**
 * Generates an AI roadmap for the missing skills in the selected target role.
 *
 * If there are no missing skills, this returns a positive summary without
 * calling an external AI provider. Otherwise, it tries configured providers in
 * order and returns the first successful validated response.
 */
export const generateAIRoadmap = async ({
  targetRole,
  roleTitle,
  extractedSkills,
  requiredSkills,
  matchedSkills,
  missingSkills,
  jobReadiness,
}) => {
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
      aiProviderUsed: "none",
      aiModelUsed: "none",
      promptVersion: aiConfig.promptVersion,
    };
  }

  const prompt = buildRoadmapPrompt({
    targetRole,
    roleTitle,
    extractedSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    jobReadiness,
  });

  // Multi-provider fallback:
  // Try primary provider first, then fallback provider if configured.
  // This improves reliability during demos and production usage.
  const providersToTry = [aiConfig.provider, aiConfig.fallbackProvider].filter(
    Boolean,
  );

  const errors = [];

  for (const provider of providersToTry) {
    try {
      const text = await generateWithProvider(provider, prompt);
      const parsed = extractJsonFromText(text);
      const validated = validateAIResult(parsed);

      return {
        ...validated,
        aiProviderUsed: provider,
        aiModelUsed:
          provider === "gemini" ? aiConfig.geminiModel : aiConfig.openaiModel,
        promptVersion: aiConfig.promptVersion,
      };
    } catch (error) {
      console.error(`${provider} roadmap generation failed:`, error.message);
      errors.push(`${provider}: ${error.message}`);
    }
  }

  const error = new Error(`All AI providers failed. ${errors.join(" | ")}`);
  error.providerErrors = errors;
  throw error;
};
