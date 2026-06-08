const { Router } = require("express");
const professionalController = require("../controllers/professional.controller");
const validateRequest = require("../middlewares/validateRequest");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const {
  professionalIdValidation,
  createProfessionalValidation,
  updateProfessionalValidation
} = require("../validations/professional.validation");

const router = Router();

router.get("/", professionalController.list);
router.get("/:id", professionalIdValidation, validateRequest, professionalController.get);
router.post("/", authenticate, authorize("ADMIN"), createProfessionalValidation, validateRequest, professionalController.create);
router.put("/:id", authenticate, authorize("ADMIN"), updateProfessionalValidation, validateRequest, professionalController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), professionalIdValidation, validateRequest, professionalController.remove);

module.exports = router;
