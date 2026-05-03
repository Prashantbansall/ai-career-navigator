export const uploadErrorHandler = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "File upload failed",
    });
  }

  next();
};
