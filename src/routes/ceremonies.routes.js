const { Router } = require("express");
const ceremonyController = require("../controllers/ceremony.controller");
const validateRequest = require("../middlewares/validateRequest");
const { cache } = require("../middlewares/cache");
const {
  ceremonyIdValidation,
  createCeremonyValidation,
  updateCeremonyValidation
} = require("../validations/ceremony.validation");

const router = Router();

router.get("/", cache("ceremonies", 120), ceremonyController.list);
router.get("/:id", ceremonyIdValidation, validateRequest, cache("ceremonies", 120), ceremonyController.get);
router.post("/", createCeremonyValidation, validateRequest, ceremonyController.create);
router.put("/:id", updateCeremonyValidation, validateRequest, ceremonyController.update);
router.delete("/:id", ceremonyIdValidation, validateRequest, ceremonyController.remove);

module.exports = router;
