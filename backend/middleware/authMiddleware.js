import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  // Test-only shortcut so protected route tests do not need real DB users.
  // This runs only during Vitest because NODE_ENV is "test".
  if (process.env.NODE_ENV === "test" && token === "test-token") {
    req.user = {
      _id: "665f123456789abcdef12345",
      id: "665f123456789abcdef12345",
      name: "Test User",
      email: "test@example.com",
    };

    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;

    next();
  } catch {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});
