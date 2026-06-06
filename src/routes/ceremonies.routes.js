const { Router } = require("express");
const ceremonyController = require("../controllers/ceremony.controller");
const validateRequest = require("../middlewares/validateRequest");
const { cache } = require("../middlewares/cache");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const {
  ceremonyIdValidation,
  createCeremonyValidation,
  updateCeremonyValidation,
  listNominacionesValidation
} = require("../validations/ceremony.validation");

const router = Router();

router.get("/", cache("ceremonies", 120), ceremonyController.list);
router.get("/:id", ceremonyIdValidation, validateRequest, cache("ceremonies", 120), ceremonyController.get);
router.get("/:id/nominaciones", listNominacionesValidation, validateRequest, ceremonyController.listNominaciones);

router.post("/", authenticate, authorize("ADMIN"), createCeremonyValidation, validateRequest, ceremonyController.create);
router.post("/:id/close", authenticate, authorize("ADMIN"), ceremonyIdValidation, validateRequest, ceremonyController.close);
router.put("/:id", authenticate, authorize("ADMIN"), updateCeremonyValidation, validateRequest, ceremonyController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), ceremonyIdValidation, validateRequest, ceremonyController.remove);

module.exports = router;
