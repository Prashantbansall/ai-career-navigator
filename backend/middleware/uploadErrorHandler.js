import AppError from "../utils/AppError.js";

export const uploadErrorHandler = (err, req, res, next) => {
  if (err) {
    return next(new AppError(err.message || "File upload failed", 400));
  }

  next();
};
