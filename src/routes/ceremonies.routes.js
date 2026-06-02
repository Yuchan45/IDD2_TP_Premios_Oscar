const { Router } = require("express");
const { body, param } = require("express-validator");
const ceremonyController = require("../controllers/ceremony.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();

router.get("/", ceremonyController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, ceremonyController.get);
router.post(
  "/",
  [
    body("name").isString().notEmpty(),
    body("date").isISO8601(),
    body("location").isString().notEmpty(),
    body("categories").optional().isArray(),
    body("status").optional().isIn(["PLANNED", "ACTIVE", "CLOSED"])
  ],
  validateRequest,
  ceremonyController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("name").optional().isString().notEmpty(),
    body("date").optional().isISO8601(),
    body("location").optional().isString().notEmpty(),
    body("categories").optional().isArray(),
    body("status").optional().isIn(["PLANNED", "ACTIVE", "CLOSED"])
  ],
  validateRequest,
  ceremonyController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, ceremonyController.remove);

module.exports = router;
