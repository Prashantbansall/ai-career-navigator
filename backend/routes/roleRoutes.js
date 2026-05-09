/**
 * roleRoutes.js
 *
 * Defines API routes for supported target roles.
 *
 * The frontend uses this route to populate the target-role dropdown on the
 * upload/analyze flow.
 */

import express from "express";
import { getRoles } from "../controllers/roleController.js";

const router = express.Router();

// GET /api/roles
router.get("/", getRoles);

export default router;
