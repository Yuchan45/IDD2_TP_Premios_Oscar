const { Movie } = require("../models");

function findAll(filters = {}) {
  return Movie.find(filters).populate("reparto.profesionalId").sort({ createdAt: -1 });
}

function findById(id) {
  return Movie.findById(id).populate("reparto.profesionalId");
}

function create(data) {
  return Movie.create(data);
}

function update(id, data) {
  return Movie.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

function remove(id) {
  return Movie.findByIdAndDelete(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
