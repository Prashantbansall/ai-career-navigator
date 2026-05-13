/**
 * AppError
 *
 * Small operational-error helper used by controllers and middleware.
 * It keeps backend failures predictable for the frontend by carrying:
 * - statusCode: HTTP status code
 * - code: stable machine-readable error code
 * - details: optional field-level/context details
 */
class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    code = "SERVER_ERROR",
    details = null,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
