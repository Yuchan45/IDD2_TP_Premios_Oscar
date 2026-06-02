const professionalRepository = require("../repositories/professional.repository");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return professionalRepository.findAll(filters);
}

async function findById(id) {
  const professional = await professionalRepository.findById(id);
  if (!professional) {
    throw new HttpError(404, "Professional not found.");
  }
  return professional;
}

function create(data) {
  return professionalRepository.create(data);
}

async function update(id, data) {
  const professional = await professionalRepository.update(id, data);
  if (!professional) {
    throw new HttpError(404, "Professional not found.");
  }
  return professional;
}

async function remove(id) {
  const professional = await professionalRepository.remove(id);
  if (!professional) {
    throw new HttpError(404, "Professional not found.");
  }
  return professional;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
