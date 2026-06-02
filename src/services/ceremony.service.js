const ceremonyRepository = require("../repositories/ceremony.repository");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return ceremonyRepository.findAll(filters);
}

async function findById(id) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) {
    throw new HttpError(404, "Ceremony not found.");
  }
  return ceremony;
}

function create(data) {
  return ceremonyRepository.create(data);
}

async function update(id, data) {
  const ceremony = await ceremonyRepository.update(id, data);
  if (!ceremony) {
    throw new HttpError(404, "Ceremony not found.");
  }
  return ceremony;
}

async function remove(id) {
  const ceremony = await ceremonyRepository.remove(id);
  if (!ceremony) {
    throw new HttpError(404, "Ceremony not found.");
  }
  return ceremony;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
