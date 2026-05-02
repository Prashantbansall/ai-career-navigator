import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: 'Return only this JSON: {"status":"ok"}',
    });

    console.log(response.text);
  } catch (error) {
    console.error("Gemini test failed:", error.message);
  }
}

testGemini();
