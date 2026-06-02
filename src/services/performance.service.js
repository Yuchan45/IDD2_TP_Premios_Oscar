const performanceRepository = require("../repositories/performance.repository");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return performanceRepository.findAll(filters);
}

async function findById(id) {
  const performance = await performanceRepository.findById(id);
  if (!performance) {
    throw new HttpError(404, "Performance not found.");
  }
  return performance;
}

function create(data) {
  return performanceRepository.create(data);
}

async function update(id, data) {
  const performance = await performanceRepository.update(id, data);
  if (!performance) {
    throw new HttpError(404, "Performance not found.");
  }
  return performance;
}

async function remove(id) {
  const performance = await performanceRepository.remove(id);
  if (!performance) {
    throw new HttpError(404, "Performance not found.");
  }
  return performance;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
