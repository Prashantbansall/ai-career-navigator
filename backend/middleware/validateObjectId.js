/**
 * validateObjectId.js
 *
 * Validates MongoDB ObjectId route parameters before controllers run.
 *
 * This prevents invalid IDs like "abc" from reaching Mongoose queries and
 * allows the API to return a clean 400 response instead of a database cast error.
 */

import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid analysis id", 400));
  }

  next();
};
