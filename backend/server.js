import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

connectDB();
fs.mkdirSync("uploads", { recursive: true });

const allowedOrigins = (
  process.env.CLIENT_URLS || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  }),
);

app.use(helmet());

app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.JSON_LIMIT || "1mb",
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "AI Career Navigator API running",
  });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/analysis", analysisRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
