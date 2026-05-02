import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

const extractJsonFromText = (text) => {
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini response did not contain valid JSON");
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

  return JSON.parse(jsonString);
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
  const ai = getGeminiClient();

  if (missingSkills.length === 0) {
    return {
      aiSummary:
        "Your resume already matches the selected role well. Focus on advanced projects, interview practice, and improving your resume impact.",
      aiRecommendations: [
        "Build one advanced project related to your target role.",
        "Practice interview problems and revise fundamentals.",
        "Add measurable impact and deployment links to your resume.",
      ],
      aiRoadmap: [],
    };
  }

  const prompt = `
You are an expert AI career coach.

Create a personalized career improvement plan for this candidate.

Candidate target role:
${targetRole} - ${roleTitle}

Extracted resume skills:
${extractedSkills.join(", ") || "None detected"}

Required skills:
${requiredSkills.join(", ")}

Matched skills:
${matchedSkills.join(", ") || "None"}

Missing skills:
${missingSkills.join(", ") || "None"}

Job readiness score:
${jobReadiness}%

Return ONLY valid JSON. Do not include markdown, explanation, or code fences.

Required JSON format:
{
  "aiSummary": "short personalized summary",
  "aiRecommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ],
  "aiRoadmap": [
    {
      "week": "Week 1",
      "skill": "skill name",
      "learn": "what to learn",
      "howToLearn": "how to learn it",
      "resource": "one free resource",
      "project": "mini project idea"
    }
  ]
}

Rules:
- Generate roadmap only for missing skills.
- Maximum 8 weeks.
- Use free resources only.
- Keep it practical for a student.
- Keep every field as a string.
- Return valid JSON only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  console.log("Raw Gemini response:", response.text);

  return extractJsonFromText(response.text);
};
