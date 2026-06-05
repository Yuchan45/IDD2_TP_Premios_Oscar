const { body, checkExact, param } = require("express-validator");

const validRoles = ["Actor Principal", "Actor Secundario", "Director", "Productor"];

const movieIdValidation = [param("id").isMongoId()];

const createMovieValidation = checkExact([
  body("titulo").isString().trim().notEmpty(),
  body("anioEstreno").isInt({ min: 1888 }),
  body("genero").isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim(),
  body("reparto").optional().isArray(),
  body("reparto.*.profesionalId").optional().isMongoId(),
  body("reparto.*.rol").optional().isString().trim().isIn(validRoles)
]);

const updateMovieValidation = checkExact([
  ...movieIdValidation,
  body("titulo").optional().isString().trim().notEmpty(),
  body("anioEstreno").optional().isInt({ min: 1888 }),
  body("genero").optional().isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim(),
  body("reparto").optional().isArray(),
  body("reparto.*.profesionalId").optional().isMongoId(),
  body("reparto.*.rol").optional().isString().trim().isIn(validRoles)
]);

module.exports = {
  movieIdValidation,
  createMovieValidation,
  updateMovieValidation
};
