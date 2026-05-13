import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import roleRoutes from "./routes/roleRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import {
  apiRateLimit,
  authRateLimit,
  corsOptions,
  jsonLimit,
} from "./config/security.js";

const app = express();

app.disable("x-powered-by");

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  express.json({
    limit: jsonLimit,
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: jsonLimit,
  }),
);

const createRateLimitMessage = (message, code) => ({
  success: false,
  message,
  error: message,
  code,
});

const apiLimiter = rateLimit({
  ...apiRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitMessage(
    "Too many requests. Please try again later.",
    "RATE_LIMIT_EXCEEDED",
  ),
});

const authLimiter = rateLimit({
  ...authRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: createRateLimitMessage(
    "Too many sign-in attempts. Please wait a few minutes and try again.",
    "AUTH_RATE_LIMIT_EXCEEDED",
  ),
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "AI Career Navigator API running",
  });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
