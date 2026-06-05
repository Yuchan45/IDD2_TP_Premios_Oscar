const { body, checkExact } = require("express-validator");

const loginValidation = checkExact([
  body("email").isEmail(),
  body("password").isString().notEmpty()
]);

module.exports = {
  loginValidation
};
