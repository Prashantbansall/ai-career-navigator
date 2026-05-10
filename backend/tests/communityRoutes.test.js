import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import app from "../app.js";
import Analysis from "../models/Analysis.js";

vi.mock("../models/Analysis.js", () => ({
  default: {
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

describe("Community Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/community/stats should return community analytics data", async () => {
    Analysis.countDocuments.mockResolvedValue(10);

    Analysis.aggregate
      .mockResolvedValueOnce([{ averageScore: 68 }])
      .mockResolvedValueOnce([
        {
          role: "SDE",
          roleTitle: "Software Development Engineer",
          count: 4,
        },
      ])
      .mockResolvedValueOnce([
        {
          skill: "System Design",
          count: 5,
        },
      ])
      .mockResolvedValueOnce([
        {
          skill: "Node.js",
          count: 6,
        },
      ]);

    const res = await request(app).get("/api/community/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.totalAnalyses).toBe(10);
    expect(res.body.data.averageReadinessScore).toBe(68);

    expect(res.body.data.mostPopularTargetRole).toEqual({
      role: "SDE",
      roleTitle: "Software Development Engineer",
      count: 4,
    });

    expect(res.body.data.mostCommonMissingSkill).toEqual({
      skill: "System Design",
      count: 5,
    });

    expect(res.body.data.topRoadmapSkill).toEqual({
      skill: "Node.js",
      count: 6,
    });

    expect(res.body.data.popularTargetRoles).toHaveLength(1);
    expect(res.body.data.commonMissingSkills).toHaveLength(1);
    expect(res.body.data.popularRoadmapSkills).toHaveLength(1);
  });

  it("GET /api/community/stats should return safe empty values when no data exists", async () => {
    Analysis.countDocuments.mockResolvedValue(0);

    Analysis.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await request(app).get("/api/community/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data.totalAnalyses).toBe(0);
    expect(res.body.data.averageReadinessScore).toBe(0);
    expect(res.body.data.mostPopularTargetRole).toBe(null);
    expect(res.body.data.mostCommonMissingSkill).toBe(null);
    expect(res.body.data.topRoadmapSkill).toBe(null);
    expect(res.body.data.popularTargetRoles).toEqual([]);
    expect(res.body.data.commonMissingSkills).toEqual([]);
    expect(res.body.data.popularRoadmapSkills).toEqual([]);
  });
});
