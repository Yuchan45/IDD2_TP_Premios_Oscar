const { Ceremony } = require("../models");

function findAll(filters = {}) {
  return Ceremony.find(filters).populate("categories").sort({ createdAt: -1 });
}

function findById(id) {
  return Ceremony.findById(id).populate("categories");
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

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
