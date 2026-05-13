import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import {
  getUploadDirectory,
  validateProductionEnv,
} from "./config/security.js";

const PORT = process.env.PORT || 5000;

validateProductionEnv();

fs.mkdirSync(getUploadDirectory(), { recursive: true });

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
