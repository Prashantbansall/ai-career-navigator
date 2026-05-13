/**
 * validateObjectId.js
 *
 * Validates MongoDB ObjectId route parameters before controllers run.
 */
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new AppError(
        "Invalid analysis id. Please provide a valid saved analysis id.",
        400,
        "INVALID_ANALYSIS_ID",
        { field: "id" },
      ),
    );
  }

  next();
};
