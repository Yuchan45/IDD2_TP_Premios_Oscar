const { Router } = require("express");
const { body, param } = require("express-validator");
const professionalController = require("../controllers/professional.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();
const validTypes = ["Actor", "Director", "Productor", "Guionista", "Maquillador"];

router.get("/", professionalController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, professionalController.get);
router.post(
  "/",
  [
    body("firstName").isString().notEmpty(),
    body("lastName").isString().notEmpty(),
    body("stageName").optional().isString(),
    body("type").isIn(validTypes),
    body("bio").optional().isString(),
    body("movieRoles").optional().isArray()
  ],
  validateRequest,
  professionalController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("firstName").optional().isString().notEmpty(),
    body("lastName").optional().isString().notEmpty(),
    body("stageName").optional().isString(),
    body("type").optional().isIn(validTypes),
    body("bio").optional().isString(),
    body("movieRoles").optional().isArray()
  ],
  validateRequest,
  professionalController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, professionalController.remove);

module.exports = router;
