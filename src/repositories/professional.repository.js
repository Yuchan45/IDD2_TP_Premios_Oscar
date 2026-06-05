const { Professional } = require("../models");

function findAll(filters = {}) {
  return Professional.find(filters).sort({ createdAt: -1 });
}

function findById(id) {
  return Professional.findById(id);
}

function create(data) {
  return Professional.create(data);
}

function update(id, data) {
  return Professional.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

function remove(id) {
  return Professional.findByIdAndDelete(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
