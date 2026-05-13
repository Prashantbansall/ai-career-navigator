import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("Backend security hardening", () => {
  it("does not expose the Express powered-by header", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows configured frontend origins through CORS", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("rejects unknown browser origins through CORS", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "https://malicious.example.com");

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("CORS_ORIGIN_NOT_ALLOWED");
  });

  it("rejects files that are not PDF resumes by extension and MIME type", async () => {
    const res = await request(app)
      .post("/api/resume/upload")
      .attach("resume", Buffer.from("fake resume"), {
        filename: "resume.txt",
        contentType: "text/plain",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNSUPPORTED_FILE_TYPE");
  });
});
