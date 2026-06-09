const voteService = require("../services/vote.service");
const asyncHandler = require("../utils/asyncHandler");

const cast = asyncHandler(async (req, res) => {
  const idUsuario = req.user.id;
  const { idCeremonia, nominacionId } = req.body;
  const data = await voteService.castVote({ idUsuario, idCeremonia, nominacionId });
  res.status(201).json({ data });
});

const change = asyncHandler(async (req, res) => {
  const idUsuario = req.user.id;
  const { idCeremonia, nominacionId } = req.body;
  const data = await voteService.changeVote({ idUsuario, idCeremonia, nominacionId });
  res.json({ data });
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

const myStatus = asyncHandler(async (req, res) => {
  const idUsuario = req.user.id;
  const { idCeremonia } = req.query;
  const data = await voteService.getMyCeremonyVoteStatus({ idUsuario, idCeremonia });
  res.json({ data });
});

const nominationStatus = asyncHandler(async (req, res) => {
  const idUsuario = req.user.id;
  const { nominacionId } = req.params;
  const data = await voteService.getNominationVoteStatus({ idUsuario, nominacionId });
  res.json({ data });
});

module.exports = { cast, change, myVote, counts, myStatus, nominationStatus };
