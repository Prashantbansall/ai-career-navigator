import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

fs.mkdirSync("uploads", { recursive: true });

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
