/**
 * validateTargetRole.js
 *
 * Validates and normalizes the targetRole sent with resume analysis requests.
 */
import AppError from "../utils/AppError.js";
import {
  isValidTargetRole,
  getValidTargetRolesMessage,
} from "../utils/roleConstants.js";

export const validateTargetRole = (req, res, next) => {
  const targetRole = String(req.body.targetRole || "SDE").trim();

  if (!isValidTargetRole(targetRole)) {
    return next(
      new AppError(
        `Invalid target role. Valid roles are: ${getValidTargetRolesMessage()}`,
        400,
        "INVALID_TARGET_ROLE",
        {
          field: "targetRole",
          validRoles: getValidTargetRolesMessage().split(", "),
        },
      ),
    );
  }

  req.body.targetRole = targetRole;

  next();
};
