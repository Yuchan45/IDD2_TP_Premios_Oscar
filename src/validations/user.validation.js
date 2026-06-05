const { body, checkExact, param } = require("express-validator");

const userIdValidation = [param("id").isUUID()];

const createUserValidation = checkExact([
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("firstName").isString().trim().notEmpty(),
  body("lastName").isString().trim().notEmpty(),
  body("roles").optional().isArray(),
  body("roles.*").optional().isString().trim().notEmpty()
]);

const updateUserValidation = checkExact([
  ...userIdValidation,
  body("email").optional().isEmail(),
  body("password").optional().isLength({ min: 6 }),
  body("firstName").optional().isString().trim().notEmpty(),
  body("lastName").optional().isString().trim().notEmpty(),
  body("isActive").optional().isBoolean(),
  body("roles").optional().isArray(),
  body("roles.*").optional().isString().trim().notEmpty()
]);

module.exports = {
  userIdValidation,
  createUserValidation,
  updateUserValidation
};
