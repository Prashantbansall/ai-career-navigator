import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import Analysis from "../models/Analysis.js";

const TEST_USER_ID = "665f123456789abcdef12345";
const OTHER_USER_ID = "777f123456789abcdef12345";
const AUTH_HEADER = "Bearer test-token";

const createAnalysis = async ({
  userId = TEST_USER_ID,
  resumeName = "test-resume.pdf",
  targetRole = "SDE",
  roleTitle = "Software Development Engineer",
  jobReadiness = 67,
  roadmapSource = "ai",
  aiProviderUsed = "gemini",
} = {}) => {
  return Analysis.create({
    userId,
    resumeName,
    targetRole,
    roleTitle,
    extractedSkills: ["Java", "React", "SQL"],
    requiredSkills: ["Java", "React", "Node.js"],
    matchedSkills: ["Java", "React"],
    missingSkills: ["Node.js"],
    jobReadiness,
    readinessReason: `You match required skills for ${targetRole}.`,
    roadmapSource,
    aiProviderUsed,
  });
};

describe("Analysis API", () => {
  beforeEach(async () => {
    await Analysis.deleteMany({});

    await createAnalysis({
      resumeName: "sde-resume.pdf",
      targetRole: "SDE",
      roleTitle: "Software Development Engineer",
      jobReadiness: 67,
      aiProviderUsed: "gemini",
    });

    await createAnalysis({
      resumeName: "frontend-resume.pdf",
      targetRole: "Frontend",
      roleTitle: "Frontend Developer",
      jobReadiness: 82,
      aiProviderUsed: "openai",
    });

    await createAnalysis({
      resumeName: "devops-resume.pdf",
      targetRole: "DevOps",
      roleTitle: "DevOps Engineer",
      jobReadiness: 55,
      roadmapSource: "fallback",
      aiProviderUsed: "",
    });

    await createAnalysis({
      userId: OTHER_USER_ID,
      resumeName: "other-user-resume.pdf",
      targetRole: "SDE",
      roleTitle: "Software Development Engineer",
      extractedSkills: ["Python"],
      requiredSkills: ["Java"],
      matchedSkills: [],
      missingSkills: ["Java"],
      jobReadiness: 10,
      readinessReason: "Other user's private analysis.",
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
    });
  });

  it("should fetch analysis history only for logged-in user", async () => {
    const res = await request(app)
      .get("/api/analysis")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(3);
    expect(res.body.data.total).toBe(3);

    expect(
      res.body.data.analyses.some(
        (analysis) => analysis.resumeName === "other-user-resume.pdf",
      ),
    ).toBe(false);
  });

  it("should support pagination with page and limit", async () => {
    const res = await request(app)
      .get("/api/analysis?page=1&limit=2")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.pages).toBe(2);
    expect(res.body.data.total).toBe(3);
  });

  it("should return second page results", async () => {
    const res = await request(app)
      .get("/api/analysis?page=2&limit=2")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(1);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.pages).toBe(2);
    expect(res.body.data.total).toBe(3);
  });

  it("should support role filter", async () => {
    const res = await request(app)
      .get("/api/analysis?role=Frontend")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(1);
    expect(res.body.data.analyses[0].targetRole).toBe("Frontend");
  });

  it("should support search filter by resume name", async () => {
    const res = await request(app)
      .get("/api/analysis?search=devops")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(1);
    expect(res.body.data.analyses[0].resumeName).toBe("devops-resume.pdf");
  });

  it("should support search filter by role title", async () => {
    const res = await request(app)
      .get("/api/analysis?search=Frontend Developer")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(1);
    expect(res.body.data.analyses[0].roleTitle).toBe("Frontend Developer");
  });

  it("should return empty results for unmatched search", async () => {
    const res = await request(app)
      .get("/api/analysis?search=blockchain")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.analyses).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it("should return empty history for a user with no analyses", async () => {
    await Analysis.deleteMany({});

    await createAnalysis({
      userId: OTHER_USER_ID,
      resumeName: "only-other-user-resume.pdf",
      targetRole: "AI/ML",
      roleTitle: "AI/ML Engineer",
      jobReadiness: 40,
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
    });

    const res = await request(app)
      .get("/api/analysis")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analyses).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it("should return 400 for invalid MongoDB id when fetching analysis", async () => {
    const res = await request(app)
      .get("/api/analysis/invalid-id")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Invalid");
  });

  it("should return 404 for valid but non-existing MongoDB id", async () => {
    const res = await request(app)
      .get("/api/analysis/507f1f77bcf86cd799439011")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Analysis not found");
  });

  it("should not allow a user to access another user's analysis", async () => {
    const otherUserAnalysis = await createAnalysis({
      userId: OTHER_USER_ID,
      resumeName: "private-other-user-resume.pdf",
      targetRole: "DevOps",
      roleTitle: "DevOps Engineer",
      jobReadiness: 50,
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
    });

    const res = await request(app)
      .get(`/api/analysis/${otherUserAnalysis._id}`)
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Analysis not found");
  });

  it("should return 400 when deleting invalid MongoDB id", async () => {
    const res = await request(app)
      .delete("/api/analysis/invalid-id")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Invalid");
  });

  it("should return 404 when deleting valid but non-existing MongoDB id", async () => {
    const res = await request(app)
      .delete("/api/analysis/507f1f77bcf86cd799439011")
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Analysis not found");
  });

  it("should not allow a user to delete another user's analysis", async () => {
    const otherUserAnalysis = await createAnalysis({
      userId: OTHER_USER_ID,
      resumeName: "delete-protected-resume.pdf",
      targetRole: "Frontend",
      roleTitle: "Frontend Developer",
      jobReadiness: 60,
      roadmapSource: "ai",
      aiProviderUsed: "gemini",
    });

    const res = await request(app)
      .delete(`/api/analysis/${otherUserAnalysis._id}`)
      .set("Authorization", AUTH_HEADER);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Analysis not found");

    const stillExists = await Analysis.findById(otherUserAnalysis._id);

    expect(stillExists).not.toBe(null);
  });

  it("should delete an existing analysis", async () => {
    const historyRes = await request(app)
      .get("/api/analysis")
      .set("Authorization", AUTH_HEADER);

    const id = historyRes.body.data.analyses[0]._id;

    const deleteRes = await request(app)
      .delete(`/api/analysis/${id}`)
      .set("Authorization", AUTH_HEADER);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toBe("Analysis deleted successfully");
    expect(deleteRes.body.data.deletedId).toBe(id);

    const finalHistoryRes = await request(app)
      .get("/api/analysis")
      .set("Authorization", AUTH_HEADER);

    expect(finalHistoryRes.body.data.total).toBe(2);
    expect(finalHistoryRes.body.data.analyses).toHaveLength(2);
  });
});
