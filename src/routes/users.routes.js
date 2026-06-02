const { Router } = require("express");
const { body, param } = require("express-validator");
const userController = require("../controllers/user.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();

router.get("/", userController.list);
router.get("/:id", param("id").isUUID(), validateRequest, userController.get);
router.post(
  "/",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").isString().notEmpty(),
    body("lastName").isString().notEmpty(),
    body("roles").optional().isArray()
  ],
  validateRequest,
  userController.create
);
router.put(
  "/:id",
  [
    param("id").isUUID(),
    body("email").optional().isEmail(),
    body("password").optional().isLength({ min: 6 }),
    body("firstName").optional().isString().notEmpty(),
    body("lastName").optional().isString().notEmpty(),
    body("isActive").optional().isBoolean(),
    body("roles").optional().isArray()
  ],
  validateRequest,
  userController.update
);
router.delete("/:id", param("id").isUUID(), validateRequest, userController.remove);

module.exports = router;
