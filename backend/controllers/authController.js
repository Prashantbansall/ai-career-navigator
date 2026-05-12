import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

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

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("User already exists with this email");
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

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error("Invalid email or password");
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
