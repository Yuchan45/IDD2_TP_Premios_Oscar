const { Router } = require("express");
const { body, param } = require("express-validator");
const professionalController = require("../controllers/professional.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();
const validRoles = ["Actor Principal", "Actor Secundario", "Director", "Productor"];

router.get("/", professionalController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, professionalController.get);
router.post(
  "/",
  [
    body("nombre").isString().notEmpty(),
    body("apellido").isString().notEmpty(),
    body("nacionalidad").isString().notEmpty(),
    body("roles").optional().isArray(),
    body("roles.*.nombre").optional().isIn(validRoles)
  ],
  validateRequest,
  professionalController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("nombre").optional().isString().notEmpty(),
    body("apellido").optional().isString().notEmpty(),
    body("nacionalidad").optional().isString().notEmpty(),
    body("roles").optional().isArray(),
    body("roles.*.nombre").optional().isIn(validRoles)
  ],
  validateRequest,
  professionalController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, professionalController.remove);

module.exports = router;
