const { Router } = require("express");
const voteController = require("../controllers/vote.controller");
const validateRequest = require("../middlewares/validateRequest");
const { castVoteValidation, voteQueryValidation } = require("../validations/vote.validation");

const router = Router();

router.post("/", castVoteValidation, validateRequest, voteController.cast);
router.get("/my-vote", voteQueryValidation, validateRequest, voteController.myVote);
router.get("/", voteQueryValidation, validateRequest, voteController.counts);

module.exports = router;
