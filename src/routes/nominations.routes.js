const { Router } = require("express");
const { body, param } = require("express-validator");
const nominationController = require("../controllers/nomination.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();

router.get("/", nominationController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, nominationController.get);
router.post(
  "/",
  [
    body("ceremony").isMongoId(),
    body("category").isMongoId(),
    body("movie").optional({ nullable: true }).isMongoId(),
    body("professional").optional({ nullable: true }).isMongoId(),
    body("description").optional().isString(),
    body("isWinner").optional().isBoolean()
  ],
  validateRequest,
  nominationController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("ceremony").optional().isMongoId(),
    body("category").optional().isMongoId(),
    body("movie").optional({ nullable: true }).isMongoId(),
    body("professional").optional({ nullable: true }).isMongoId(),
    body("description").optional().isString(),
    body("isWinner").optional().isBoolean()
  ],
  validateRequest,
  nominationController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, nominationController.remove);

module.exports = router;
