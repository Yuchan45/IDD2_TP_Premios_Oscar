const voteService = require("../services/vote.service");
const asyncHandler = require("../utils/asyncHandler");

const cast = asyncHandler(async (req, res) => {
  const idUsuario = req.user.id;
  const { idCeremonia, nominacionId } = req.body;
  const data = await voteService.castVote({ idUsuario, idCeremonia, nominacionId });
  res.status(201).json({ data });
});

const myVote = asyncHandler(async (req, res) => {
  const { idCeremonia, idCategoria } = req.query;
  const idUsuario = req.user.id;
  const data = await voteService.getMyVotes({ idUsuario, idCeremonia, idCategoria });
  res.json({ data });
});

const counts = asyncHandler(async (req, res) => {
  const { idCeremonia, idCategoria } = req.query;
  const data = await voteService.getVoteCounts({ idCeremonia, idCategoria });
  res.json({ data });
});

module.exports = { cast, myVote, counts };
