const nominationRepository = require("../repositories/nomination.repository");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return nominationRepository.findAll(filters);
}

async function findById(id) {
  const nomination = await nominationRepository.findById(id);
  if (!nomination) {
    throw new HttpError(404, "Nomination not found.");
  }
  return nomination;
}

function create(data) {
  return nominationRepository.create(data);
}

async function update(id, data) {
  const nomination = await nominationRepository.update(id, data);
  if (!nomination) {
    throw new HttpError(404, "Nomination not found.");
  }
  return nomination;
}

async function remove(id) {
  const nomination = await nominationRepository.remove(id);
  if (!nomination) {
    throw new HttpError(404, "Nomination not found.");
  }
  return nomination;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
