const { Router } = require("express");
const { body, param } = require("express-validator");
const ceremonyController = require("../controllers/ceremony.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();
const validArtistTypes = ["Cantante", "Banda", "Orquesta"];
const validWinnerTypes = ["pelicula", "profesional"];

router.get("/", ceremonyController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, ceremonyController.get);
router.post(
  "/",
  [
    body("anio").isInt({ min: 1929 }),
    body("fecha").isISO8601(),
    body("lugar").isString().notEmpty(),
    body("actuaciones").optional().isArray(),
    body("actuaciones.*.tipoActuacion").optional().isString().notEmpty(),
    body("actuaciones.*.artistas").optional().isArray(),
    body("actuaciones.*.artistas.*.nombre").optional().isString().notEmpty(),
    body("actuaciones.*.artistas.*.tipo").optional().isIn(validArtistTypes),
    body("nominaciones").optional().isArray(),
    body("nominaciones.*.categoria.id").optional().isMongoId(),
    body("nominaciones.*.categoria.nombre").optional().isString().notEmpty(),
    body("nominaciones.*.pelicula.id").optional().isMongoId(),
    body("nominaciones.*.pelicula.titulo").optional().isString().notEmpty(),
    body("nominaciones.*.profesional.id").optional().isMongoId(),
    body("nominaciones.*.profesional.nombreCompleto").optional().isString().notEmpty(),
    body("nominaciones.*.esGanador").optional().isBoolean(),
    body("premios").optional().isArray(),
    body("premios.*.categoria.id").optional().isMongoId(),
    body("premios.*.categoria.nombre").optional().isString().notEmpty(),
    body("premios.*.nominadoGanadorId").optional().isMongoId(),
    body("premios.*.ganador.tipo").optional().isIn(validWinnerTypes),
    body("premios.*.ganador.pelicula.id").optional().isMongoId(),
    body("premios.*.ganador.pelicula.titulo").optional().isString().notEmpty(),
    body("premios.*.ganador.profesional.id").optional().isMongoId(),
    body("premios.*.ganador.profesional.nombreCompleto").optional().isString().notEmpty()
  ],
  validateRequest,
  ceremonyController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("anio").optional().isInt({ min: 1929 }),
    body("fecha").optional().isISO8601(),
    body("lugar").optional().isString().notEmpty(),
    body("actuaciones").optional().isArray(),
    body("actuaciones.*.tipoActuacion").optional().isString().notEmpty(),
    body("actuaciones.*.artistas").optional().isArray(),
    body("actuaciones.*.artistas.*.nombre").optional().isString().notEmpty(),
    body("actuaciones.*.artistas.*.tipo").optional().isIn(validArtistTypes),
    body("nominaciones").optional().isArray(),
    body("nominaciones.*.categoria.id").optional().isMongoId(),
    body("nominaciones.*.categoria.nombre").optional().isString().notEmpty(),
    body("nominaciones.*.pelicula.id").optional().isMongoId(),
    body("nominaciones.*.pelicula.titulo").optional().isString().notEmpty(),
    body("nominaciones.*.profesional.id").optional().isMongoId(),
    body("nominaciones.*.profesional.nombreCompleto").optional().isString().notEmpty(),
    body("nominaciones.*.esGanador").optional().isBoolean(),
    body("premios").optional().isArray(),
    body("premios.*.categoria.id").optional().isMongoId(),
    body("premios.*.categoria.nombre").optional().isString().notEmpty(),
    body("premios.*.nominadoGanadorId").optional().isMongoId(),
    body("premios.*.ganador.tipo").optional().isIn(validWinnerTypes),
    body("premios.*.ganador.pelicula.id").optional().isMongoId(),
    body("premios.*.ganador.pelicula.titulo").optional().isString().notEmpty(),
    body("premios.*.ganador.profesional.id").optional().isMongoId(),
    body("premios.*.ganador.profesional.nombreCompleto").optional().isString().notEmpty()
  ],
  validateRequest,
  ceremonyController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, ceremonyController.remove);

module.exports = router;
