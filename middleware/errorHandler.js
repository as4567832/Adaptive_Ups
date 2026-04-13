function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({ error: err.message || "Internal server error" });
}

module.exports = errorHandler;
