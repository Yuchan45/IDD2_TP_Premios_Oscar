const { Performance } = require("../models");

function findAll(filters = {}) {
  return Performance.find(filters).populate("ceremony").sort({ createdAt: -1 });
}

function findById(id) {
  return Performance.findById(id).populate("ceremony");
}

function create(data) {
  return Performance.create(data);
}

function update(id, data) {
  return Performance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

function remove(id) {
  return Performance.findByIdAndDelete(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
