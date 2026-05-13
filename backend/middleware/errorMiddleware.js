/**
 * errorMiddleware.js
 *
 * Centralized error handling for the Express backend.
 *
 * Every API error response follows this shape:
 * {
 *   success: false,
 *   message: "Human friendly message",
 *   error: "Human friendly message", // kept for existing frontend compatibility
 *   code: "STABLE_ERROR_CODE",
 *   details: {...optional}
 * }
 */
import AppError from "../utils/AppError.js";

export const notFound = (req, res, next) => {
  next(
    new AppError(
      `Route not found - ${req.originalUrl}`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};

const normalizeError = (err) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "SERVER_ERROR";
  let details = err.details || null;

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
    code = "INVALID_RESOURCE_ID";
    details = {
      field: err.path,
      value: err.value,
    };
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed. Please check the submitted data.";
    code = "VALIDATION_ERROR";
    details = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate resource found.";
    code = "DUPLICATE_RESOURCE";
    details = {
      fields: Object.keys(err.keyValue || {}),
    };
  }

  if (statusCode < 400) {
    statusCode = 500;
  }

  if (statusCode === 500 && !err.isOperational) {
    message = "Something went wrong on the server. Please try again.";
    code = "SERVER_ERROR";
  }

  return { statusCode, message, code, details };
};

export const errorHandler = (err, req, res, next) => {
  const { statusCode, message, code, details } = normalizeError(err);

  const response = {
    success: false,
    message,
    // `error` is preserved so existing frontend parseResponse logic keeps working.
    error: message,
    code,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
