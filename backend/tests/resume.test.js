import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("Resume API Validation", () => {
  it("should reject analyze request without resume file", async () => {
    const res = await request(app)
      .post("/api/resume/analyze")
      .field("targetRole", "SDE");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid target role", async () => {
    const res = await request(app)
      .post("/api/resume/analyze")
      .field("targetRole", "Hacker");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Invalid target role");
  });
});
