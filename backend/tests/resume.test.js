import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

const AUTH_HEADER = "Bearer test-token";

describe("Resume API Validation", () => {
  it("should reject analyze request without resume file", async () => {
    const res = await request(app)
      .post("/api/resume/analyze")
      .set("Authorization", AUTH_HEADER)
      .field("targetRole", "SDE");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("RESUME_FILE_REQUIRED");
    expect(res.body.details).toEqual(
      expect.objectContaining({ field: "resume" }),
    );
  });

  it("should reject invalid target role", async () => {
    const res = await request(app)
      .post("/api/resume/analyze")
      .set("Authorization", AUTH_HEADER)
      .field("targetRole", "Hacker");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Invalid target role");
    expect(res.body.code).toBe("INVALID_TARGET_ROLE");
    expect(res.body.details).toEqual(
      expect.objectContaining({ field: "targetRole" }),
    );
  });
});
