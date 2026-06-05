const voteRepository = require("../repositories/vote.repository");
const ceremonyRepository = require("../repositories/ceremony.repository");
const HttpError = require("../utils/httpError");

async function castVote({ userId, ceremonyId, nominacionId }) {
  const ceremony = await ceremonyRepository.findById(ceremonyId);
  if (!ceremony) {
    throw new HttpError(404, "Ceremony not found.");
  }

  const nominacion = ceremony.nominaciones.id(nominacionId);
  if (!nominacion) {
    throw new HttpError(404, "Nominacion not found in this ceremony.");
  }

  const categoryId = nominacion.categoria.id;

  try {
    return await voteRepository.create({ userId, ceremonyId, categoryId, nominacionId });
  } catch (err) {
    if (err.code === 11000) {
      throw new HttpError(409, "El usuario ya emitio un voto en esta categoria para esta ceremonia.");
    }
    throw err;
  }
}

async function getMyVote({ userId, ceremonyId, categoryId }) {
  return voteRepository.findByUser({ userId, ceremonyId, categoryId });
}

async function getVoteCounts({ ceremonyId, categoryId }) {
  return voteRepository.countsByCeremony({ ceremonyId, categoryId });
}

module.exports = {
  castVote,
  getMyVote,
  getVoteCounts
};
