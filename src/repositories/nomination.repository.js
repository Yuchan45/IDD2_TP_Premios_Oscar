const { Nomination } = require("../models");

const populateFields = ["ceremony", "category", "movie", "professional"];

function populate(query) {
  populateFields.forEach((field) => query.populate(field));
  return query;
}

function findAll(filters = {}) {
  return populate(Nomination.find(filters)).sort({ createdAt: -1 });
}

function findById(id) {
  return populate(Nomination.findById(id));
}

function create(data) {
  return Nomination.create(data);
}

function update(id, data) {
  return Nomination.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

function remove(id) {
  return Nomination.findByIdAndDelete(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
