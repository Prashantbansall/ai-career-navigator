import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();

console.log("Gemini key loaded:", Boolean(process.env.GEMINI_API_KEY));
console.log("Using Vertex:", process.env.GOOGLE_GENAI_USE_VERTEXAI);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Career Navigator API running",
  });
});

app.use("/api/resume", resumeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
