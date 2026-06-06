const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");
const validateRequest = require("../middlewares/validateRequest");
const { loginValidation } = require("../validations/auth.validation");

const router = Router();

router.post("/login", loginValidation, validateRequest, authController.login);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
