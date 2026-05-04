import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../services/resumeService.js", () => {
  return {
    parsePDF: vi.fn().mockResolvedValue("Mock resume text"),
    analyzeText: vi.fn().mockResolvedValue({
      targetRole: "SDE",
      roleTitle: "Software Development Engineer",
      extractedSkills: ["Java", "React", "SQL"],
      requiredSkills: ["Java", "React", "Node.js"],
      matchedSkills: ["Java", "React"],
      missingSkills: ["Node.js"],
      jobReadiness: 67,
      readinessReason: "You match 2 out of 3 required skills for SDE.",
      roadmap: [
        {
          week: "Week 1",
          skill: "Node.js",
          learn: "Node runtime and modules",
          howToLearn: "Build small APIs",
          resource: "freeCodeCamp Node.js Course",
          project: "Notes API",
          difficulty: "Intermediate",
          timeEstimate: "6-8 hours",
        },
      ],
      aiSummary: "Good foundation. Improve backend skills.",
      aiRecommendations: ["Learn Node.js", "Build APIs", "Practice DSA"],
      aiRoadmap: [
        {
          week: "Week 1",
          skill: "Node.js",
          learn: "Node runtime and modules",
          howToLearn: "Build small APIs",
          resource: "freeCodeCamp Node.js Course",
          project: "Notes API",
          difficulty: "Intermediate",
          timeEstimate: "6-8 hours",
        },
      ],
      aiEnabled: true,
      aiError: "",
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
      aiModelUsed: "gemini-2.5-flash",
      promptVersion: "career-roadmap-v1",
    }),
  };
});

import app from "../app.js";

describe("Resume Analyze Success API", () => {
  it("should analyze resume successfully with mocked parsing and AI analysis", async () => {
    const res = await request(app)
      .post("/api/resume/analyze")
      .field("targetRole", "SDE")
      .attach("resume", Buffer.from("fake pdf content"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Resume analyzed successfully");

    const analysis = res.body.data.analysis;

    expect(analysis.targetRole).toBe("SDE");
    expect(analysis.jobReadiness).toBe(67);
    expect(analysis.extractedSkills).toContain("React");
    expect(analysis.missingSkills).toContain("Node.js");
    expect(analysis.aiProviderUsed).toBe("gemini");
  });
});
