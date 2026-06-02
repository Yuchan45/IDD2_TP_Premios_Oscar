function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const payload = {
    error: {
      message: error.message || "Internal server error"
    }
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
