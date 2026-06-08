const { body, checkExact, param, query } = require("express-validator");

const validArtistTypes = ["Cantante", "Solista", "Banda", "Orquesta", "Actor/Cantante", "Coro"];
const validPerformanceTypes = ["Musical", "Cancion nominada", "Homenaje", "Apertura", "Intermedio", "Cierre"];
const validWinnerTypes = ["pelicula", "profesional"];

function exactlyOneNominationTarget(value, { req, path }) {
  const match = path.match(/^nominaciones\.(\d+)\./);
  if (!match) {
    return true;
  }

  const nomination = req.body.nominaciones?.[Number(match[1])];
  if (!nomination) {
    return true;
  }

  const hasMovie = !!nomination.pelicula;
  const hasProfessional = !!nomination.profesional;

  if (hasMovie === hasProfessional) {
    throw new Error(
      "Cada nominacion debe incluir exactamente una pelicula o un profesional.",
    );
  }

  return true;
}

function validAwardWinner(value, { req, path }) {
  const match = path.match(/^premios\.(\d+)\./);
  if (!match) {
    return true;
  }

  const award = req.body.premios?.[Number(match[1])];
  if (!award || !award.ganador) {
    return true;
  }

  const hasMovie = !!award.ganador.pelicula;
  const hasProfessional = !!award.ganador.profesional;

  if (hasMovie === hasProfessional) {
    throw new Error(
      "Cada premio debe incluir exactamente una pelicula o un profesional ganador.",
    );
  }

  if (award.ganador.tipo === "pelicula" && !hasMovie) {
    throw new Error(
      "Si ganador.tipo es pelicula, debe informarse ganador.pelicula.",
    );
  }

  if (award.ganador.tipo === "profesional" && !hasProfessional) {
    throw new Error(
      "Si ganador.tipo es profesional, debe informarse ganador.profesional.",
    );
  }

  return true;
}

const ceremonyIdValidation = [param("id").isMongoId()];

const ceremonyPayloadValidation = [
  body("anio").optional().isInt({ min: 1929 }),
  body("fecha").optional().isISO8601(),
  body("lugar").optional().isString().trim().notEmpty(),
  body("actuaciones").optional().isArray(),
  body("actuaciones.*.tipoActuacion")
    .optional()
    .isString()
    .trim()
    .isIn(validPerformanceTypes),
  body("actuaciones.*.artistas").optional().isArray(),
  body("actuaciones.*.artistas.*.nombre")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("actuaciones.*.artistas.*.tipo")
    .optional()
    .isString()
    .trim()
    .isIn(validArtistTypes),
  body("nominaciones").optional().isArray(),
  body("nominaciones.*.categoria.id").optional().isMongoId(),
  body("nominaciones.*.categoria.nombre")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("nominaciones.*.pelicula.id").optional().isMongoId(),
  body("nominaciones.*.pelicula.titulo")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("nominaciones.*.profesional.id").optional().isMongoId(),
  body("nominaciones.*.profesional.nombreCompleto")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("nominaciones.*.esGanador").optional().isBoolean(),
  body("nominaciones.*").optional().custom(exactlyOneNominationTarget),
  body("premios").optional().isArray(),
  body("premios.*.categoria.id").optional().isMongoId(),
  body("premios.*.categoria.nombre").optional().isString().trim().notEmpty(),
  body("premios.*.nominadoGanadorId").optional().isMongoId(),
  body("premios.*.ganador.tipo")
    .optional()
    .isString()
    .trim()
    .isIn(validWinnerTypes),
  body("premios.*.ganador.pelicula.id").optional().isMongoId(),
  body("premios.*.ganador.pelicula.titulo")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("premios.*.ganador.profesional.id").optional().isMongoId(),
  body("premios.*.ganador.profesional.nombreCompleto")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("premios.*").optional().custom(validAwardWinner),
];

const createCeremonyValidation = checkExact([
  body("anio").isInt({ min: 1929 }),
  body("fecha").isISO8601(),
  body("lugar").isString().trim().notEmpty(),
  body("actuaciones").optional().isArray(),
  body("actuaciones.*.tipoActuacion")
    .optional()
    .isString()
    .trim()
    .isIn(validPerformanceTypes),
  body("actuaciones.*.artistas").optional().isArray(),
  body("actuaciones.*.artistas.*.nombre")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("actuaciones.*.artistas.*.tipo")
    .optional()
    .isString()
    .trim()
    .isIn(validArtistTypes),
  body("nominaciones").optional().isArray(),
  body("nominaciones.*.categoria.id").optional().isMongoId(),
  body("nominaciones.*.categoria.nombre")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("nominaciones.*.pelicula.id").optional().isMongoId(),
  body("nominaciones.*.pelicula.titulo")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("nominaciones.*.profesional.id").optional().isMongoId(),
  body("nominaciones.*.profesional.nombreCompleto")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("nominaciones.*.esGanador").optional().isBoolean(),
  body("nominaciones.*").optional().custom(exactlyOneNominationTarget),
  body("premios").optional().isArray(),
  body("premios.*.categoria.id").optional().isMongoId(),
  body("premios.*.categoria.nombre").optional().isString().trim().notEmpty(),
  body("premios.*.nominadoGanadorId").optional().isMongoId(),
  body("premios.*.ganador.tipo")
    .optional()
    .isString()
    .trim()
    .isIn(validWinnerTypes),
  body("premios.*.ganador.pelicula.id").optional().isMongoId(),
  body("premios.*.ganador.pelicula.titulo")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("premios.*.ganador.profesional.id").optional().isMongoId(),
  body("premios.*.ganador.profesional.nombreCompleto")
    .optional()
    .isString()
    .trim()
    .notEmpty(),
  body("premios.*").optional().custom(validAwardWinner),
]);

const updateCeremonyValidation = checkExact([
  ...ceremonyIdValidation,
  ...ceremonyPayloadValidation,
]);

const listNominacionesValidation = [
  param("id").isMongoId(),
  query("categoriaId").optional().isMongoId(),
  query("esGanador").optional().isBoolean().toBoolean(),
];

const ceremonyCategoryValidation = [
  param("id").isMongoId(),
  param("categoryId").isMongoId(),
];

const nominacionIdValidation = [
  param("id").isMongoId(),
  param("nomId").isMongoId(),
];

const actuacionIdValidation = [
  param("id").isMongoId(),
  param("actuacionId").isString().trim().notEmpty(),
];

const addNominacionValidation = checkExact([
  param("id").isMongoId(),
  body("categoria.id").isMongoId(),
  body("categoria.nombre").isString().trim().notEmpty(),
  body("pelicula.id").optional().isMongoId(),
  body("pelicula.titulo").optional().isString().trim().notEmpty(),
  body("profesional.id").optional().isMongoId(),
  body("profesional.nombreCompleto").optional().isString().trim().notEmpty(),
  body("pelicula").custom((value, { req }) => {
    const hasMovie = !!value;
    const hasProfessional = !!req.body.profesional;
    if (hasMovie === hasProfessional) {
      throw new Error(
        "La nominacion debe incluir exactamente una pelicula o un profesional.",
      );
    }
    return true;
  }),
]);

const updateNominacionValidation = checkExact([
  param("id").isMongoId(),
  param("nomId").isMongoId(),
  body("categoria.id").optional().isMongoId(),
  body("categoria.nombre").optional().isString().trim().notEmpty(),
  body("pelicula.id").optional().isMongoId(),
  body("pelicula.titulo").optional().isString().trim().notEmpty(),
  body("profesional.id").optional().isMongoId(),
  body("profesional.nombreCompleto").optional().isString().trim().notEmpty(),
]);

const addActuacionValidation = checkExact([
  param("id").isMongoId(),
  body("tipoActuacion").isString().trim().isIn(validPerformanceTypes),
  body("artistas").isArray({ min: 1 }),
  body("artistas.*.nombre").isString().trim().notEmpty(),
  body("artistas.*.tipo").isString().trim().isIn(validArtistTypes),
]);

const updateActuacionValidation = checkExact([
  param("id").isMongoId(),
  param("actuacionId").isString().trim().notEmpty(),
  body("tipoActuacion").isString().trim().isIn(validPerformanceTypes),
  body("artistas").isArray({ min: 1 }),
  body("artistas.*.nombre").isString().trim().notEmpty(),
  body("artistas.*.tipo").isString().trim().isIn(validArtistTypes),
]);

module.exports = {
  ceremonyIdValidation,
  ceremonyCategoryValidation,
  createCeremonyValidation,
  updateCeremonyValidation,
  listNominacionesValidation,
  nominacionIdValidation,
  actuacionIdValidation,
  addNominacionValidation,
  updateNominacionValidation,
  addActuacionValidation,
  updateActuacionValidation,
};
