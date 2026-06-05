const voteService = require("../services/vote.service");
const asyncHandler = require("../utils/asyncHandler");

const cast = asyncHandler(async (req, res) => {
  const data = await voteService.castVote(req.body);
  res.status(201).json({ data });
});

const myVote = asyncHandler(async (req, res) => {
  const { userId, ceremonyId, categoryId } = req.query;
  const data = await voteService.getMyVote({ userId, ceremonyId, categoryId });
  res.json({ data: data || null });
});

const counts = asyncHandler(async (req, res) => {
  const { ceremonyId, categoryId } = req.query;
  const data = await voteService.getVoteCounts({ ceremonyId, categoryId });
  res.json({ data });
});

module.exports = { cast, myVote, counts };
