/**
 * validateTargetRole.js
 *
 * Validates the targetRole sent with resume analysis requests.
 *
 * This prevents unsupported roles from reaching the resume analysis service
 * and gives the frontend a clear error message when an invalid role is sent.
 */

import AppError from "../utils/AppError.js";
import {
  isValidTargetRole,
  getValidTargetRolesMessage,
} from "../utils/roleConstants.js";

export const validateTargetRole = (req, res, next) => {
  const targetRole = req.body.targetRole || "SDE";

  if (!isValidTargetRole(targetRole)) {
    return next(
      new AppError(
        `Invalid target role. Valid roles are: ${getValidTargetRolesMessage()}`,
        400,
      ),
    );
  }

  // Normalize targetRole on req.body so downstream controllers/services can
  // safely use it without repeating default-role logic.
  req.body.targetRole = targetRole;

  next();
};
