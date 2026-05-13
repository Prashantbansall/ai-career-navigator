import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const normalizeEmail = (email = "") => String(email).toLowerCase().trim();

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegisterInput = ({ name, email, password }) => {
  const details = [];

  if (!name?.trim()) {
    details.push({ field: "name", message: "Name is required." });
  }

  if (!email?.trim()) {
    details.push({ field: "email", message: "Email is required." });
  } else if (!validateEmail(normalizeEmail(email))) {
    details.push({ field: "email", message: "Enter a valid email address." });
  }

  if (!password) {
    details.push({ field: "password", message: "Password is required." });
  } else if (password.length < 6) {
    details.push({
      field: "password",
      message: "Password must be at least 6 characters.",
    });
  }

  if (details.length) {
    throw new AppError(
      "Please fix the highlighted signup fields.",
      400,
      "AUTH_VALIDATION_ERROR",
      details,
    );
  }
};

const validateLoginInput = ({ email, password }) => {
  const details = [];

  if (!email?.trim()) {
    details.push({ field: "email", message: "Email is required." });
  } else if (!validateEmail(normalizeEmail(email))) {
    details.push({ field: "email", message: "Enter a valid email address." });
  }

  if (!password) {
    details.push({ field: "password", message: "Password is required." });
  }

  if (details.length) {
    throw new AppError(
      "Please enter your email and password to sign in.",
      400,
      "AUTH_VALIDATION_ERROR",
      details,
    );
  }
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  validateRegisterInput({ name, email, password });

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError(
      "An account already exists with this email. Please sign in instead.",
      409,
      "EMAIL_ALREADY_EXISTS",
      { field: "email" },
    );
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateLoginInput({ email, password });

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throw new AppError(
      "Invalid email or password. Please check your credentials.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError(
      "Invalid email or password. Please check your credentials.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Current user fetched successfully",
    user: sanitizeUser(req.user),
  });
});

/**
 * @desc    Get logged-in user profile summary and account stats
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfileSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [stats] = await Analysis.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        averageReadinessScore: { $avg: "$jobReadiness" },
        highestReadinessScore: { $max: "$jobReadiness" },
      },
    },
  ]);

  const latestAnalysis = await Analysis.findOne({ userId })
    .sort({ createdAt: -1 })
    .select(
      "resumeName targetRole roleTitle jobReadiness roadmapSource aiProviderUsed createdAt",
    );

  const roleBreakdown = await Analysis.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$targetRole",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        role: { $ifNull: ["$_id", "Not specified"] },
        count: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "User profile summary fetched successfully",
    data: {
      profile: {
        user: sanitizeUser(req.user),
        totalAnalyses: stats?.totalAnalyses || 0,
        averageReadinessScore: Math.round(stats?.averageReadinessScore || 0),
        highestReadinessScore: Math.round(stats?.highestReadinessScore || 0),
        mostRecentTargetRole: latestAnalysis?.targetRole || "Not available",
        mostRecentRoleTitle:
          latestAnalysis?.roleTitle ||
          "Create an analysis to personalize this profile",
        latestAnalysis,
        roleBreakdown,
      },
    },
  });
});
