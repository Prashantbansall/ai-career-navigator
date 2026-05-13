import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";
import AppError from "../utils/AppError.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw new AppError(
      "Authentication required. Please sign in to continue.",
      401,
      "AUTH_TOKEN_MISSING",
    );
  }

  // Test-only shortcut so protected route tests do not need real DB users.
  if (process.env.NODE_ENV === "test" && token === "test-token") {
    req.user = {
      _id: "665f123456789abcdef12345",
      id: "665f123456789abcdef12345",
      name: "Test User",
      email: "test@example.com",
    };

    return next();
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "Authentication is not configured correctly on the server.",
      500,
      "JWT_SECRET_MISSING",
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError(
        "Your session is no longer valid. Please sign in again.",
        401,
        "AUTH_USER_NOT_FOUND",
      );
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Your session has expired or is invalid. Please sign in again.",
      401,
      "AUTH_TOKEN_INVALID",
    );
  }
});
