/**
 * roleController.js
 *
 * Controller for exposing supported target roles to the frontend.
 *
 * Keeping roles backend-driven avoids hardcoding the dropdown only on the
 * frontend and ensures validation + UI options stay consistent.
 */

import { TARGET_ROLES } from "../utils/roleConstants.js";

/**
 * GET /api/roles
 *
 * Returns all supported target roles.
 */
export const getRoles = (req, res) => {
  res.json({
    success: true,
    message: "Target roles fetched successfully",
    data: {
      roles: TARGET_ROLES,
    },
  });
};
