/**
 * uploadErrorHandler.js
 *
 * Handles file-upload related errors before they reach controllers.
 *
 * This middleware converts upload errors into AppError instances so the global
 * error handler can return a consistent JSON response format.
 *
 * Common upload errors:
 * - file too large
 * - unsupported file type
 * - wrong file field name
 */

import multer from "multer";
import AppError from "../utils/AppError.js";

/**
 * Converts Multer or custom upload errors into clean API errors.
 *
 * This keeps file upload failures consistent with the rest of the backend.
 */
export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError("Resume file is too large. Max size is 5 MB.", 400),
      );
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new AppError(
          "Unexpected file field. Use 'resume' as the file field name.",
          400,
        ),
      );
    }

    return next(new AppError(err.message || "File upload failed.", 400));
  }

  if (err) {
    return next(new AppError(err.message || "File upload failed.", 400));
  }

  next();
};
