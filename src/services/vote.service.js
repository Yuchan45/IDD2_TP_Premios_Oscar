const voteRepository = require("../repositories/vote.repository");
const auditRepository = require("../repositories/audit.repository");
const ceremonyRepository = require("../repositories/ceremony.repository");
const { getRedisClient } = require("../config/db/redis");
const HttpError = require("../utils/httpError");

const LOCK_TTL = 5; // segundos

async function castVote({ idUsuario, idCeremonia, nominacionId }) {
  const ceremony = await ceremonyRepository.findById(idCeremonia);
  if (!ceremony) {
    throw new HttpError(404, "Ceremonia no encontrada.");
  }

  const nominacion = ceremony.nominaciones.id(nominacionId);
  if (!nominacion) {
    throw new HttpError(404, "Nominacion no encontrada en esta ceremonia.");
  }

  const idCategoria = nominacion.categoria.id.toString();

  // Redis lock para evitar votos duplicados simultaneos
  const redis = getRedisClient();
  const lockKey = `lock:vote:${idUsuario}:${idCategoria}:${idCeremonia}`;
  const acquired = await redis.set(lockKey, "1", { NX: true, EX: LOCK_TTL });

  if (!acquired) {
    throw new HttpError(429, "Voto en proceso, intente nuevamente en unos segundos.");
  }

  try {
    const vote = await voteRepository.create({
      idUsuario,
      idCategoria,
      idNominacion: nominacionId,
      idCeremonia
    });

    await auditRepository.log({
      idUsuario,
      accion: "CREATE",
      entidad: "VOTACION",
      idEntidad: String(vote.idVotacion),
      detalle: JSON.stringify({ idCeremonia, idCategoria, nominacionId })
    });

    return vote;
  } catch (err) {
    // SQL Server unique constraint violation
    if (err.number === 2627 || err.number === 2601) {
      throw new HttpError(409, "El usuario ya emitio un voto en esta categoria para esta ceremonia.");
    }
    throw err;
  } finally {
    await redis.del(lockKey);
  }
}

async function getMyVote({ idUsuario, idCeremonia, idCategoria }) {
  return voteRepository.findByUser({ idUsuario, idCeremonia, idCategoria });
}

async function getVoteCounts({ idCeremonia, idCategoria }) {
  return voteRepository.countsByCeremony({ idCeremonia, idCategoria });
}

module.exports = {
  castVote,
  getMyVote,
  getVoteCounts
};
