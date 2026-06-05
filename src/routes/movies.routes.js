const { Router } = require("express");
const { body, param } = require("express-validator");
const movieController = require("../controllers/movie.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();
const validRoles = ["Actor Principal", "Actor Secundario", "Director", "Productor"];

router.get("/", movieController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, movieController.get);
router.post(
  "/",
  [
    body("titulo").isString().notEmpty(),
    body("anioEstreno").isInt({ min: 1888 }),
    body("genero").isString().notEmpty(),
    body("descripcion").optional().isString(),
    body("reparto").optional().isArray(),
    body("reparto.*.profesionalId").optional().isMongoId(),
    body("reparto.*.rol").optional().isIn(validRoles)
  ],
  validateRequest,
  movieController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("titulo").optional().isString().notEmpty(),
    body("anioEstreno").optional().isInt({ min: 1888 }),
    body("genero").optional().isString().notEmpty(),
    body("descripcion").optional().isString(),
    body("reparto").optional().isArray(),
    body("reparto.*.profesionalId").optional().isMongoId(),
    body("reparto.*.rol").optional().isIn(validRoles)
  ],
  validateRequest,
  movieController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, movieController.remove);

module.exports = router;
