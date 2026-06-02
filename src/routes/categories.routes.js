const { Router } = require("express");
const { body, param } = require("express-validator");
const categoryController = require("../controllers/category.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();

router.get("/", categoryController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, categoryController.get);
router.post(
  "/",
  [
    body("name").isString().notEmpty(),
    body("description").optional().isString()
  ],
  validateRequest,
  categoryController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("name").optional().isString().notEmpty(),
    body("description").optional().isString()
  ],
  validateRequest,
  categoryController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, categoryController.remove);

module.exports = router;
