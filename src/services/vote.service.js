const voteRepository = require("../repositories/vote.repository");
const auditRepository = require("../repositories/audit.repository");
const ceremonyRepository = require("../repositories/ceremony.repository");
const categoryRepository = require("../repositories/category.repository");
const { getRedisClient } = require("../config/db/redis");
const HttpError = require("../utils/httpError");

const LOCK_TTL = 5; // segundos

async function castVote({ idUsuario, idCeremonia, nominacionId }) {
  const redis = getRedisClient();
  // CHECK: Validar que un mismo usuario no pueda votar mas de una vez.
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

  // Validacion de concurrencia: Evitar doble voto
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
  const vote = await voteRepository.findByUser({
    userId: idUsuario,
    ceremonyId: idCeremonia,
    categoryId: idCategoria
  });

  if (!vote) {
    return null;
  }

  const ceremony = await ceremonyRepository.findById(vote.ceremonyId);
  const nomination = ceremony?.nominaciones.id(vote.nominacionId);
  const categoryId = nomination?.categoria?.id || vote.categoryId;
  const category = categoryId ? await categoryRepository.findById(categoryId) : null;

  return {
    nominacion: nomination
      ? {
          id: nomination._id,
          pelicula: nomination.pelicula,
          profesional: nomination.profesional,
          esGanador: nomination.esGanador
        }
      : {
          id: vote.nominacionId
        },
    voto: {
      id: vote._id,
      userId: vote.userId,
      createdAt: vote.createdAt,
      updatedAt: vote.updatedAt
    },
    ceremonia: ceremony
      ? {
          id: ceremony._id,
          anio: ceremony.anio,
          fecha: ceremony.fecha,
          lugar: ceremony.lugar,
          estado: ceremony.estado
        }
      : {
          id: vote.ceremonyId
        },
    categoria: category
      ? {
          id: category._id,
          nombre: category.nombre,
          descripcion: category.descripcion
        }
      : nomination?.categoria || {
          id: vote.categoryId
        },
  };
}

async function getVoteCounts({ idCeremonia, idCategoria }) {
  const [counts, ceremony] = await Promise.all([
    voteRepository.countsByCeremony({ ceremonyId: idCeremonia, categoryId: idCategoria }),
    ceremonyRepository.findById(idCeremonia)
  ]);

  if (!ceremony) {
    throw new HttpError(404, "Ceremonia no encontrada.");
  }

  const ceremonySummary = {
    id: ceremony._id,
    anio: ceremony.anio,
    fecha: ceremony.fecha,
    lugar: ceremony.lugar,
    estado: ceremony.estado
  };

  const categories = await Promise.all(
    counts.map((count) => categoryRepository.findById(count.categoryId))
  );

  return counts.map((count, index) => {
    const nomination = ceremony.nominaciones.id(count.nominacionId);
    const category = categories[index];
    const categorySummary = category
      ? {
          id: category._id,
          nombre: category.nombre,
          descripcion: category.descripcion
        }
      : nomination?.categoria || {
          id: count.categoryId
        };

    return {
      votos: count.votos,
      ceremonia: ceremonySummary,
      categoria: categorySummary,
      nominacion: nomination
        ? {
            id: nomination._id,
            categoria: categorySummary,
            pelicula: nomination.pelicula,
            profesional: nomination.profesional,
            esGanador: nomination.esGanador
          }
        : {
            id: count.nominacionId
          }
    };
  });
}

module.exports = {
  castVote,
  getMyVote,
  getVoteCounts
};
