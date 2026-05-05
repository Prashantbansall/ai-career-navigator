/**
 * errorMiddleware.js
 *
 * Centralized error handling for the Express backend.
 *
 * Benefits:
 * - keeps API error responses consistent
 * - avoids repeated try/catch response logic inside controllers
 * - converts common database errors into clean client-friendly messages
 * - hides stack traces outside development mode
 */

/**
 * Handles unknown API routes.
 *
 * If no route matches the request, this middleware creates a 404 error and
 * forwards it to the global error handler.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Final Express error handler.
 *
 * All operational errors should eventually pass through this middleware,
 * including AppError instances, Mongoose errors, Multer upload errors, and
 * unknown runtime errors.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose CastError usually means an invalid MongoDB ObjectId was used.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // Mongoose ValidationError can include multiple field-level messages.
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // MongoDB duplicate key error.
  // Useful if unique fields are added later, such as email or username.
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate resource found";
  }

  const response = {
    success: false,
    error: message,
  };

  // Stack traces are helpful during development but should not be exposed in production.
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
