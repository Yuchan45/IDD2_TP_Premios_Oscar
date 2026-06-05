const { body, checkExact, param } = require("express-validator");

const userIdValidation = [param("id").isInt({ min: 1 }).toInt()];

const createUserValidation = checkExact([
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("nombre").isString().trim().notEmpty(),
  body("apellido").isString().trim().notEmpty(),
  body("rol").optional().isString().trim().notEmpty()
]);

const updateUserValidation = checkExact([
  ...userIdValidation,
  body("email").optional().isEmail(),
  body("password").optional().isLength({ min: 6 }),
  body("nombre").optional().isString().trim().notEmpty(),
  body("apellido").optional().isString().trim().notEmpty(),
  body("isActive").optional().isBoolean(),
  body("rol").optional().isString().trim().notEmpty()
]);

module.exports = {
  userIdValidation,
  createUserValidation,
  updateUserValidation
};
