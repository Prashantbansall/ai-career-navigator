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

  req.body.targetRole = targetRole;
  next();
};
