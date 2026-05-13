import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import app from "../app.js";
import User from "../models/User.js";

vi.mock("../models/User.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test_jwt_secret";
    process.env.JWT_EXPIRES_IN = "7d";
  });

  it("POST /api/auth/register should register a new user", async () => {
    User.findOne.mockResolvedValue(null);

    User.create.mockResolvedValue({
      _id: "665f123456789abcdef12345",
      name: "Prashant Bansal",
      email: "prashant@example.com",
      createdAt: new Date("2026-05-10"),
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Prashant Bansal",
      email: "prashant@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("prashant@example.com");
  });

  it("POST /api/auth/register should reject duplicate email", async () => {
    User.findOne.mockResolvedValue({
      _id: "existing-user-id",
      email: "prashant@example.com",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Prashant Bansal",
      email: "prashant@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("POST /api/auth/register should return field-level validation details", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("AUTH_VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });

  it("POST /api/auth/login should login valid user", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "665f123456789abcdef12345",
        name: "Prashant Bansal",
        email: "prashant@example.com",
        password: hashedPassword,
        createdAt: new Date("2026-05-10"),
        comparePassword: async (enteredPassword) =>
          bcrypt.compare(enteredPassword, hashedPassword),
      }),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "prashant@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("prashant@example.com");
  });

  it("POST /api/auth/login should reject wrong credentials", async () => {
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("POST /api/auth/login should return predictable validation errors", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "Please enter your email and password to sign in.",
    );
    expect(res.body.code).toBe("AUTH_VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });
});
