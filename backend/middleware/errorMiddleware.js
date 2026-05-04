export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate resource found";
  }

  const response = {
    success: false,
    error: message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
