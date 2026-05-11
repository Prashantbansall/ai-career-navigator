// One-time development migration script. Do not run in production casually.

import dotenv from "dotenv";
import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";
import User from "../models/User.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in backend/.env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const assignOldAnalysesToUser = async () => {
  try {
    await connectDB();

    const email = process.argv[2];

    if (!email) {
      console.error(
        "Please provide user email. Example: node scripts/assignOldAnalysesToUser.js abcd@example.com",
      );
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.error(`No user found with email: ${normalizedEmail}`);
      process.exit(1);
    }

    const oldAnalysesCount = await Analysis.countDocuments({
      $or: [{ userId: { $exists: false } }, { userId: null }],
    });

    console.log(`Found ${oldAnalysesCount} old analyses without userId.`);

    if (oldAnalysesCount === 0) {
      console.log("No old analyses need migration.");
      process.exit(0);
    }

    const result = await Analysis.updateMany(
      {
        $or: [{ userId: { $exists: false } }, { userId: null }],
      },
      {
        $set: {
          userId: user._id,
        },
      },
    );

    console.log("Migration completed successfully.");
    console.log(`Assigned analyses to: ${user.name} <${user.email}>`);
    console.log(`Matched records: ${result.matchedCount}`);
    console.log(`Updated records: ${result.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};

assignOldAnalysesToUser();
