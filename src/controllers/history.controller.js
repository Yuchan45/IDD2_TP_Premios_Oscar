const historyService = require("../services/history.service");
const asyncHandler = require("../utils/asyncHandler");

const winners = asyncHandler(async (req, res) => {
  const data = await historyService.findWinners(req.query);
  res.json({ data });
});

const awards = asyncHandler(async (req, res) => {
  const data = await historyService.findAwards(req.query);
  res.json({ data });
});

const topNominated = asyncHandler(async (req, res) => {
  const data = await historyService.topNominated(Number(req.query.limit || 10));
  res.json({ data });
});

const topAwarded = asyncHandler(async (req, res) => {
  const data = await historyService.topAwarded(Number(req.query.limit || 10));
  res.json({ data });
});

const topVotedCeremonies = asyncHandler(async (req, res) => {
  const data = await historyService.topVotedCeremonies(Number(req.query.limit || 10));
  res.json({ data });
});

const topParticipantCategories = asyncHandler(async (req, res) => {
  const data = await historyService.topParticipantCategories(Number(req.query.limit || 10));
  res.json({ data });
});

module.exports = {
  winners,
  awards,
  topNominated,
  topAwarded,
  topVotedCeremonies,
  topParticipantCategories
};
