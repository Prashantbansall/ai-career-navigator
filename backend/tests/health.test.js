import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("Health API", () => {
  it("should return API health status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("ok");
    expect(res.body.message).toBe("AI Career Navigator API running");
  });

  it("should return 404 for unknown route", async () => {
    const res = await request(app).get("/api/unknown-route");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Route not found");
  });
});
