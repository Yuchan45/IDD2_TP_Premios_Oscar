const mongoose = require("mongoose");
const { Vote } = require("../models");

function create({ userId, ceremonyId, categoryId, nominacionId }) {
  return Vote.create({ userId, ceremonyId, categoryId, nominacionId });
}

function findByUser({ userId, ceremonyId, categoryId }) {
  const filters = { userId, ceremonyId };

  if (categoryId) {
    filters.categoryId = categoryId;
  }

  return Vote.findOne(filters);
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

module.exports = {
  create,
  findByUser,
  countsByCeremony,
};
