const { body, checkExact, param } = require("express-validator");

const validRoles = ["Actor Principal", "Actor Secundario", "Director", "Productor", "Otro"];

const professionalIdValidation = [param("id").isMongoId()];

const createProfessionalValidation = checkExact([
  body("nombre").isString().trim().notEmpty(),
  body("apellido").isString().trim().notEmpty(),
  body("nacionalidad").isString().trim().notEmpty(),
  body("roles").optional().isArray(),
  body("roles.*.nombre").optional().isString().trim().isIn(validRoles)
]);

const updateProfessionalValidation = checkExact([
  ...professionalIdValidation,
  body("nombre").optional().isString().trim().notEmpty(),
  body("apellido").optional().isString().trim().notEmpty(),
  body("nacionalidad").optional().isString().trim().notEmpty(),
  body("roles").optional().isArray(),
  body("roles.*.nombre").optional().isString().trim().isIn(validRoles)
]);

module.exports = {
  professionalIdValidation,
  createProfessionalValidation,
  updateProfessionalValidation
};
