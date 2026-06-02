const movieRepository = require("../repositories/movie.repository");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return movieRepository.findAll(filters);
}

async function findById(id) {
  const movie = await movieRepository.findById(id);
  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }
  return movie;
}

function create(data) {
  return movieRepository.create(data);
}

async function update(id, data) {
  const movie = await movieRepository.update(id, data);
  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }
  return movie;
}

async function remove(id) {
  const movie = await movieRepository.remove(id);
  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }
  return movie;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
