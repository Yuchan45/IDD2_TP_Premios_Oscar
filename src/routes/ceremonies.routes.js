const { Router } = require("express");
const ceremonyController = require("../controllers/ceremony.controller");
const validateRequest = require("../middlewares/validateRequest");
const {
  ceremonyIdValidation,
  createCeremonyValidation,
  updateCeremonyValidation
} = require("../validations/ceremony.validation");

const router = Router();

router.get("/", ceremonyController.list);
router.get("/:id", ceremonyIdValidation, validateRequest, ceremonyController.get);
router.post("/", createCeremonyValidation, validateRequest, ceremonyController.create);
router.put("/:id", updateCeremonyValidation, validateRequest, ceremonyController.update);
router.delete("/:id", ceremonyIdValidation, validateRequest, ceremonyController.remove);

module.exports = router;
