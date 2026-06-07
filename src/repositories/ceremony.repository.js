const mongoose = require("mongoose");
const { Ceremony } = require("../models");

function findAll(filters = {}) {
  return Ceremony.find(filters).sort({ createdAt: -1 });
}

function findById(id) {
  return Ceremony.findById(id);
}

function create(data) {
  return Ceremony.create(data);
}

function update(id, data) {
  return Ceremony.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

function remove(id) {
  return Ceremony.findByIdAndDelete(id);
}

async function findNominaciones(id, { categoriaId, esGanador } = {}) {
  const nominationFilters = [];

  if (categoriaId) {
    nominationFilters.push({
      $eq: ["$$nom.categoria.id", new mongoose.Types.ObjectId(categoriaId)]
    });
  }

  if (typeof esGanador === "boolean") {
    nominationFilters.push({
      $eq: ["$$nom.esGanador", esGanador]
    });
  }

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: 0,
        nominaciones: {
          $filter: {
            input: "$nominaciones",
            as: "nom",
            cond: nominationFilters.length ? { $and: nominationFilters } : true
          }
        }
      }
    }
  ];

  const result = await Ceremony.aggregate(pipeline);
  return result[0]?.nominaciones ?? [];
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findNominaciones
};
