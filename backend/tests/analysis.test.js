import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import Analysis from "../models/Analysis.js";

describe("Analysis API", () => {
  beforeEach(async () => {
    await Analysis.create({
      resumeName: "test-resume.pdf",
      targetRole: "SDE",
      roleTitle: "Software Development Engineer",
      extractedSkills: ["Java", "React", "SQL"],
      requiredSkills: ["Java", "React", "Node.js"],
      matchedSkills: ["Java", "React"],
      missingSkills: ["Node.js"],
      jobReadiness: 67,
      readinessReason: "You match 2 out of 3 required skills for SDE.",
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
    });
  });

  it("should fetch analysis history", async () => {
    const res = await request(app).get("/api/analysis");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analyses).toHaveLength(1);
    expect(res.body.data.analyses[0].targetRole).toBe("SDE");
  });

  it("should support role filter", async () => {
    const res = await request(app).get("/api/analysis?role=SDE");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analyses).toHaveLength(1);
  });

  it("should support search filter", async () => {
    const res = await request(app).get("/api/analysis?search=test-resume");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analyses).toHaveLength(1);
  });

  it("should return 400 for invalid MongoDB id", async () => {
    const res = await request(app).get("/api/analysis/invalid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Invalid");
  });

  it("should return 404 for valid but non-existing MongoDB id", async () => {
    const res = await request(app).get(
      "/api/analysis/507f1f77bcf86cd799439011",
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Analysis not found");
  });

  it("should delete an analysis", async () => {
    const historyRes = await request(app).get("/api/analysis");
    const id = historyRes.body.data.analyses[0]._id;

    const deleteRes = await request(app).delete(`/api/analysis/${id}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toBe("Analysis deleted successfully");

    const finalHistoryRes = await request(app).get("/api/analysis");
    expect(finalHistoryRes.body.data.analyses).toHaveLength(0);
  });
});
