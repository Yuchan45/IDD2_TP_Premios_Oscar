const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: {
      message: "Validation error",
      details: result.array()
    }
  });
}

module.exports = validateRequest;
