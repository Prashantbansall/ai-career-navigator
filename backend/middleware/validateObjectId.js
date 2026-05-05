import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid analysis id", 400));
  }

  next();
};
