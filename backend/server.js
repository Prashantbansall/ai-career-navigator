import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import { connectDB } from "./config/db.js";

console.log("Gemini key loaded:", Boolean(process.env.GEMINI_API_KEY));
console.log("Using Vertex:", process.env.GOOGLE_GENAI_USE_VERTEXAI);

const app = express();

// Connect MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Career Navigator API running",
  });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/analysis", analysisRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
