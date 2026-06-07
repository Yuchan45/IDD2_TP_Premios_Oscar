const { Router } = require("express");
const voteController = require("../controllers/vote.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validateRequest = require("../middlewares/validateRequest");
const {
  castVoteValidation,
  myVotesQueryValidation,
  voteQueryValidation
} = require("../validations/vote.validation");

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ACADEMY_MEMBER"),
  castVoteValidation,
  validateRequest,
  voteController.cast
);
router.get("/my-votes", myVotesQueryValidation, validateRequest, voteController.myVote);
router.get("/", voteQueryValidation, validateRequest, voteController.counts);

module.exports = router;
