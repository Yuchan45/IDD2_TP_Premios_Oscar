const { Router } = require("express");
const professionalController = require("../controllers/professional.controller");
const validateRequest = require("../middlewares/validateRequest");
const {
  professionalIdValidation,
  createProfessionalValidation,
  updateProfessionalValidation
} = require("../validations/professional.validation");

const router = Router();

router.get("/", professionalController.list);
router.get("/:id", professionalIdValidation, validateRequest, professionalController.get);
router.post("/", createProfessionalValidation, validateRequest, professionalController.create);
router.put("/:id", updateProfessionalValidation, validateRequest, professionalController.update);
router.delete("/:id", professionalIdValidation, validateRequest, professionalController.remove);

module.exports = router;
