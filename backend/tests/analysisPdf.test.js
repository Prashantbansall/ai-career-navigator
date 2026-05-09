// backend/tests/analysisPdf.test.js

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import Analysis from "../models/Analysis.js";
import { generateAnalysisPdfBuffer } from "../services/pdfReportService.js";

vi.mock("../services/pdfReportService.js", () => ({
  generateAnalysisPdfBuffer: vi.fn(),
}));

describe("GET /api/analysis/:id/pdf", () => {
  let analysisId;

  beforeEach(async () => {
    vi.clearAllMocks();

    const analysis = await Analysis.create({
      resumeName: "test-resume.pdf",
      targetRole: "Frontend Developer",
      roleTitle: "Frontend Developer",
      jobReadiness: 85,
      readinessReason: "Strong frontend foundation with some minor gaps.",
      extractedSkills: ["HTML", "CSS", "JavaScript", "React"],
      requiredSkills: ["HTML", "CSS", "JavaScript", "React", "TypeScript"],
      matchedSkills: ["HTML", "CSS", "JavaScript", "React"],
      missingSkills: ["TypeScript"],
      roadmap: [
        {
          week: "Week 1",
          skill: "TypeScript",
          learn: "Learn TypeScript fundamentals.",
          howToLearn: "Practice types, interfaces, and generics.",
          resource: "TypeScript Handbook",
          project: "Convert a React component to TypeScript.",
          difficulty: "Medium",
          timeEstimate: "5-7 hours",
        },
      ],
      aiRoadmap: [
        {
          week: "Week 1",
          skill: "TypeScript",
          learn: "Learn TypeScript fundamentals.",
          howToLearn: "Practice types, interfaces, and generics.",
          resource: "TypeScript Handbook",
          project: "Convert a React component to TypeScript.",
          difficulty: "Medium",
          timeEstimate: "5-7 hours",
        },
      ],
      aiEnabled: true,
      aiSummary: "Candidate is close to frontend readiness.",
      aiRecommendations: [
        "Improve TypeScript fundamentals.",
        "Build one medium-sized TypeScript project.",
      ],
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
      aiModelUsed: "gemini-2.5-flash",
      promptVersion: "v1",
    });

    analysisId = analysis._id.toString();

    generateAnalysisPdfBuffer.mockResolvedValue(
      Buffer.from("%PDF-1.4 mock pdf content"),
    );
  });

  afterEach(async () => {
    await Analysis.deleteMany({});
  });

  it("should export a saved analysis as a PDF", async () => {
    const res = await request(app).get(`/api/analysis/${analysisId}/pdf`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain(".pdf");

    expect(generateAnalysisPdfBuffer).toHaveBeenCalledTimes(1);
    expect(generateAnalysisPdfBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        resumeName: "test-resume.pdf",
        targetRole: "Frontend Developer",
        jobReadiness: 85,
      }),
    );
  });

  it("should return 404 when analysis does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).get(`/api/analysis/${fakeId}/pdf`);

    expect(res.statusCode).toBe(404);
    expect(generateAnalysisPdfBuffer).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid analysis id", async () => {
    const res = await request(app).get("/api/analysis/invalid-id/pdf");

    expect(res.statusCode).toBe(400);
    expect(generateAnalysisPdfBuffer).not.toHaveBeenCalled();
  });
});
