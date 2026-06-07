const { logger } = require("../config/logger");

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

  const activeLogger = req && req.log ? req.log : logger;

  if (status >= 500) {
    activeLogger.error(
      {
        err: error,
        status,
        method: req.method,
        url: req.originalUrl
      },
      "Unhandled request error"
    );
  } else if (status >= 400) {
    activeLogger.warn(
      {
        status,
        method: req.method,
        url: req.originalUrl,
        message: error.message
      },
      "Handled request error"
    );
  }

  res.status(status).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
