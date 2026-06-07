const mongoose = require("mongoose");
const { Vote } = require("../models");

function create({ userId, ceremonyId, categoryId, nominacionId }) {
  return Vote.create({ userId, ceremonyId, categoryId, nominacionId });
}

function findAllByUser({ userId, ceremonyId, categoryId }) {
  const filters = { userId };

  if (ceremonyId) {
    filters.ceremonyId = ceremonyId;
  }

  if (categoryId) {
    filters.categoryId = categoryId;
  }

  return Vote.find(filters).sort({ createdAt: -1 });
}

function countsByCeremony({ ceremonyId, categoryId }) {
  const match = { ceremonyId: new mongoose.Types.ObjectId(ceremonyId) };
  if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);

  return Vote.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          nominacionId: "$nominacionId",
          categoryId: "$categoryId"
        },
        votos: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        nominacionId: "$_id.nominacionId",
        categoryId: "$_id.categoryId",
        votos: 1
      }
    },
  ]);
}

function countTotalByCeremony(ceremonyId) {
  return Vote.countDocuments({ ceremonyId });
}

function countByNomination({ ceremonyId, nominacionId }) {
  return Vote.countDocuments({ ceremonyId, nominacionId });
}

function findUserVoteByCategory({ userId, ceremonyId, categoryId }) {
  return Vote.findOne({ userId, ceremonyId, categoryId });
}

module.exports = {
  create,
  findAllByUser,
  countsByCeremony,
  countTotalByCeremony,
  countByNomination,
  findUserVoteByCategory,
};
