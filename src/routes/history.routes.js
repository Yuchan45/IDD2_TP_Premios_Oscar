const { Router } = require("express");
const historyController = require("../controllers/history.controller");
const authenticate = require("../middlewares/authenticate");
const validateRequest = require("../middlewares/validateRequest");
const {
  historyLimitValidation,
  historyLookupValidation
} = require("../validations/history.validation");

const router = Router();

router.get("/winners", authenticate, historyLookupValidation, validateRequest, historyController.winners);
router.get("/awards", authenticate, historyLookupValidation, validateRequest, historyController.awards);
router.get(
  "/professionals/top-nominated",
  authenticate,
  historyLimitValidation,
  validateRequest,
  historyController.topNominated
);
router.get(
  "/professionals/top-awarded",
  authenticate,
  historyLimitValidation,
  validateRequest,
  historyController.topAwarded
);
router.get(
  "/ceremonies/top-voted",
  authenticate,
  historyLimitValidation,
  validateRequest,
  historyController.topVotedCeremonies
);
router.get(
  "/categories/top-participants",
  authenticate,
  historyLimitValidation,
  validateRequest,
  historyController.topParticipantCategories
);

module.exports = router;
