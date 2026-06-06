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
  listNominacionesValidation,
  nominacionIdValidation,
  addNominacionValidation,
  updateNominacionValidation
} = require("../validations/ceremony.validation");

const router = Router();

router.get("/", cache("ceremonies", 120), ceremonyController.list);
router.get("/:id", ceremonyIdValidation, validateRequest, cache("ceremonies", 120), ceremonyController.get);
router.get("/:id/nominaciones", listNominacionesValidation, validateRequest, ceremonyController.listNominaciones);

router.post("/", authenticate, authorize("ADMIN"), createCeremonyValidation, validateRequest, ceremonyController.create);
router.post("/:id/close", authenticate, authorize("ADMIN"), ceremonyIdValidation, validateRequest, ceremonyController.close);
router.post("/:id/nominaciones", authenticate, authorize("ADMIN"), addNominacionValidation, validateRequest, ceremonyController.addNominacion);
router.put("/:id", authenticate, authorize("ADMIN"), updateCeremonyValidation, validateRequest, ceremonyController.update);
router.put("/:id/nominaciones/:nomId", authenticate, authorize("ADMIN"), updateNominacionValidation, validateRequest, ceremonyController.updateNominacion);
router.delete("/:id", authenticate, authorize("ADMIN"), ceremonyIdValidation, validateRequest, ceremonyController.remove);
router.delete("/:id/nominaciones/:nomId", authenticate, authorize("ADMIN"), nominacionIdValidation, validateRequest, ceremonyController.removeNominacion);

module.exports = router;
