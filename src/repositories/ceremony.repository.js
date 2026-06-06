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

async function findNominaciones(id, { categoriaId } = {}) {
  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: 0,
        nominaciones: {
          $filter: {
            input: "$nominaciones",
            as: "nom",
            cond: categoriaId
              ? { $eq: ["$$nom.categoria.id", new mongoose.Types.ObjectId(categoriaId)] }
              : true
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
