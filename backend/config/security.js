/**
 * security.js
 *
 * Centralized backend security configuration.
 * Keeping CORS, rate limits, upload limits, and environment checks here makes
 * deployment settings easier to audit before production.
 */
import path from "path";

const parseCsv = (value, fallback = "") =>
  (value || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const allowedOrigins = parseCsv(
  process.env.CLIENT_URLS,
  "http://localhost:5173,http://127.0.0.1:5173",
);

export const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients like Postman, curl, and server-side tests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error("This origin is not allowed by CORS.");
    error.statusCode = 403;
    error.code = "CORS_ORIGIN_NOT_ALLOWED";
    return callback(error);
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
};

export const jsonLimit = process.env.JSON_LIMIT || "1mb";

export const apiRateLimit = {
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 150,
};

export const authRateLimit = {
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 25,
};

export const uploadConfig = {
  directory: process.env.UPLOAD_DIR || "uploads",
  maxFileSizeMb: Number(process.env.MAX_RESUME_FILE_SIZE_MB) || 5,
  allowedMimeTypes: ["application/pdf"],
  allowedExtensions: [".pdf"],
};

export const getUploadDirectory = () =>
  path.resolve(process.cwd(), uploadConfig.directory);

export const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const requiredVars = ["MONGO_URI", "JWT_SECRET", "CLIENT_URLS"];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missingVars.join(", ")}`,
    );
  }

  if (
    process.env.JWT_SECRET === "your_jwt_secret_here" ||
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must be changed to a strong secret before production deployment.",
    );
  }
};
