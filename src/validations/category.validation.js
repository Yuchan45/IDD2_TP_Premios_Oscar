const { body, checkExact, param } = require("express-validator");

const CATEGORY_TIPOS = ["pelicula", "profesional"];

const categoryIdValidation = [param("id").isMongoId()];

const createCategoryValidation = checkExact([
  body("nombre").isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim(),
  body("tipo").isString().isIn(CATEGORY_TIPOS)
]);

const updateCategoryValidation = checkExact([
  ...categoryIdValidation,
  body("nombre").optional().isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim(),
  body("tipo").optional().isString().isIn(CATEGORY_TIPOS)
]);

module.exports = {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation
};
