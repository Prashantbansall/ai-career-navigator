export const aiConfig = {
  provider: process.env.AI_PROVIDER || "gemini",
  fallbackProvider: process.env.AI_FALLBACK_PROVIDER || "openai",

  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.5",

  promptVersion: process.env.AI_PROMPT_VERSION || "career-roadmap-v1",
};
