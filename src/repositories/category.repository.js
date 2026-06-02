const { Category } = require("../models");

function findAll(filters = {}) {
  return Category.find(filters).sort({ createdAt: -1 });
}

function findById(id) {
  return Category.findById(id);
}

function create(data) {
  return Category.create(data);
}

function update(id, data) {
  return Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

function remove(id) {
  return Category.findByIdAndDelete(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
