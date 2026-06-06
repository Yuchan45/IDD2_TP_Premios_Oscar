const voteRepository = require("../repositories/vote.repository");
const auditRepository = require("../repositories/audit.repository");
const ceremonyRepository = require("../repositories/ceremony.repository");
const { getRedisClient } = require("../config/db/redis");
const HttpError = require("../utils/httpError");

const LOCK_TTL = 5; // segundos

async function castVote({ idUsuario, idCeremonia, nominacionId }) {
  const redis = getRedisClient();
  const isClosed = await redis.exists(`ceremony:closed:${idCeremonia}`);
  if (isClosed) {
    throw new HttpError(409, "Las votaciones de esta ceremonia ya estan cerradas.");
  }

  const ceremony = await ceremonyRepository.findById(idCeremonia);
  if (!ceremony) {
    throw new HttpError(404, "Ceremonia no encontrada.");
  }
  if (ceremony.estado === "cerrada") {
    throw new HttpError(409, "Las votaciones de esta ceremonia ya estan cerradas.");
  }

  const nominacion = ceremony.nominaciones.id(nominacionId);
  if (!nominacion) {
    throw new HttpError(404, "Nominacion no encontrada en esta ceremonia.");
  }

  const categoryId = nominacion.categoria.id.toString();

  const lockKey = `lock:vote:${idUsuario}:${categoryId}:${idCeremonia}`;
  const acquired = await redis.set(lockKey, "1", { NX: true, EX: LOCK_TTL });

  if (!acquired) {
    throw new HttpError(429, "Voto en proceso, intente nuevamente en unos segundos.");
  }

  try {
    const vote = await voteRepository.create({
      userId: idUsuario,
      ceremonyId: idCeremonia,
      categoryId,
      nominacionId
    });

    await auditRepository.log({
      idUsuario,
      accion: "CREATE",
      entidad: "VOTACION",
      idEntidad: String(vote._id),
      detalle: JSON.stringify({ idCeremonia, categoryId, nominacionId })
    });

    return vote;
  } catch (err) {
    // MongoDB duplicate key (índice único userId+ceremonyId+categoryId)
    if (err.code === 11000) {
      throw new HttpError(409, "El usuario ya emitio un voto en esta categoria para esta ceremonia.");
    }
    throw err;
  } finally {
    await redis.del(lockKey);
  }
}

async function getMyVote({ idUsuario, idCeremonia, idCategoria }) {
  return voteRepository.findByUser({ userId: idUsuario, ceremonyId: idCeremonia, categoryId: idCategoria });
}

async function getVoteCounts({ idCeremonia, idCategoria }) {
  return voteRepository.countsByCeremony({ ceremonyId: idCeremonia, categoryId: idCategoria });
}

module.exports = {
  castVote,
  getMyVote,
  getVoteCounts
};
