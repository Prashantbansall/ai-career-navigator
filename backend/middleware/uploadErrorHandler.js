/**
 * uploadErrorHandler.js
 *
 * Converts Multer and upload validation errors into consistent API responses.
 */
import multer from "multer";
import AppError from "../utils/AppError.js";

export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(
          "Resume file is too large. Please upload a smaller PDF.",
          400,
          "FILE_TOO_LARGE",
          { field: err.field || "resume" },
        ),
      );
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new AppError(
          "Unexpected file field. Use 'resume' as the file field name.",
          400,
          "UNEXPECTED_FILE_FIELD",
          { expectedField: "resume", receivedField: err.field },
        ),
      );
    }

    return next(
      new AppError(err.message || "File upload failed.", 400, "UPLOAD_ERROR", {
        field: err.field || "resume",
      }),
    );
  }

  if (err) {
    const isUnsupportedFile = /pdf/i.test(err.message || "");

    return next(
      new AppError(
        err.message || "File upload failed.",
        400,
        isUnsupportedFile ? "UNSUPPORTED_FILE_TYPE" : "UPLOAD_ERROR",
        { allowedTypes: ["application/pdf"] },
      ),
    );
  }

  next();
};
