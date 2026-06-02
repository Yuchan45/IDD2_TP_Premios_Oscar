const categoryRepository = require("../repositories/category.repository");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return categoryRepository.findAll(filters);
}

async function findById(id) {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new HttpError(404, "Category not found.");
  }
  return category;
}

function create(data) {
  return categoryRepository.create(data);
}

async function update(id, data) {
  const category = await categoryRepository.update(id, data);
  if (!category) {
    throw new HttpError(404, "Category not found.");
  }
  return category;
}

async function remove(id) {
  const category = await categoryRepository.remove(id);
  if (!category) {
    throw new HttpError(404, "Category not found.");
  }
  return category;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
