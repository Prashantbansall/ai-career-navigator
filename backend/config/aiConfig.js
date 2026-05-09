/**
 * aiConfig.js
 *
 * Central AI configuration for roadmap generation.
 *
 * Values can be controlled through environment variables, but safe defaults are
 * provided for local development. This keeps AI provider/model settings in one
 * place instead of hardcoding them across services.
 */

export const aiConfig = {
  // Primary AI provider used first when generating AI roadmap content.
  provider: process.env.AI_PROVIDER || "gemini",

  // Fallback provider used when the primary provider fails.
  fallbackProvider: process.env.AI_FALLBACK_PROVIDER || "openai",

  // Model names can be changed without modifying service code.
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.5",

  // Helps track which prompt structure generated a saved roadmap.
  promptVersion: process.env.AI_PROMPT_VERSION || "career-roadmap-v1",
};
