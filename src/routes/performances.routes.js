const { Router } = require("express");
const { body, param } = require("express-validator");
const performanceController = require("../controllers/performance.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();

router.get("/", performanceController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, performanceController.get);
router.post(
  "/",
  [
    body("ceremony").isMongoId(),
    body("artistName").isString().notEmpty(),
    body("performanceType").isString().notEmpty()
  ],
  validateRequest,
  performanceController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("ceremony").optional().isMongoId(),
    body("artistName").optional().isString().notEmpty(),
    body("performanceType").optional().isString().notEmpty()
  ],
  validateRequest,
  performanceController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, performanceController.remove);

module.exports = router;
