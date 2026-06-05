const { body, checkExact, param } = require("express-validator");

const categoryIdValidation = [param("id").isMongoId()];

const createCategoryValidation = checkExact([
  body("nombre").isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim()
]);

const updateCategoryValidation = checkExact([
  ...categoryIdValidation,
  body("nombre").optional().isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim()
]);

module.exports = {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation
};
