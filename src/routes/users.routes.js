const { Router } = require("express");
const userController = require("../controllers/user.controller");
const validateRequest = require("../middlewares/validateRequest");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const {
  userIdValidation,
  createUserValidation,
  updateUserValidation
} = require("../validations/user.validation");

const router = Router();

router.post("/", createUserValidation, validateRequest, userController.create);
router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.list);
router.get("/:id", userIdValidation, validateRequest, userController.get);
router.put("/:id", updateUserValidation, validateRequest, userController.update);
router.delete("/:id", userIdValidation, validateRequest, userController.remove);

module.exports = router;
