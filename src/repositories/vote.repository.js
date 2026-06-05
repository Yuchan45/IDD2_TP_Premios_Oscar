const { Vote } = require("../models");

function create(data) {
  return Vote.create(data);
}

function findByUser({ userId, ceremonyId, categoryId }) {
  return Vote.findOne({ userId, ceremonyId, categoryId });
}

function countsByCeremony({ ceremonyId, categoryId }) {
  const match = { ceremonyId };
  if (categoryId) match.categoryId = categoryId;

  return Vote.aggregate([
    { $match: match },
    { $group: { _id: "$nominacionId", votos: { $sum: 1 } } },
    { $project: { _id: 0, nominacionId: "$_id", votos: 1 } }
  ]);
}

module.exports = {
  create,
  findByUser,
  countsByCeremony
};
