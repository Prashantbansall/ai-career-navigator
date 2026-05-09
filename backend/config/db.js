/**
 * db.js
 *
 * Handles MongoDB connection setup using Mongoose.
 *
 * The backend requires MONGO_URI in the environment. If the connection fails,
 * the server exits immediately because the app depends on MongoDB for saved
 * analysis history and PDF report export.
 */

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Exit with failure code so deployment platforms know startup failed.
    process.exit(1);
  }
};
