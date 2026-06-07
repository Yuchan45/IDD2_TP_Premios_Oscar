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

function buildCeremonySummary(ceremony, fallbackId) {
  if (!ceremony) {
    return { id: fallbackId };
  }

  return {
    id: ceremony._id,
    anio: ceremony.anio,
    fecha: ceremony.fecha,
    lugar: ceremony.lugar,
    estado: ceremony.estado
  };
}

function buildCategorySummary(category, snapshot, fallbackId) {
  if (category) {
    return {
      id: category._id,
      nombre: category.nombre,
      descripcion: category.descripcion
    };
  }

  if (snapshot) {
    return {
      id: snapshot.id,
      nombre: snapshot.nombre,
      descripcion: snapshot.descripcion
    };
  }

  return { id: fallbackId };
}

async function getMyVotes({ idUsuario, idCeremonia, idCategoria }) {
  const votes = await voteRepository.findAllByUser({
    userId: idUsuario,
    ceremonyId: idCeremonia,
    categoryId: idCategoria
  });

  if (!votes.length) {
    return [];
  }

  const ceremonyIds = [...new Set(votes.map((vote) => vote.ceremonyId.toString()))];
  const ceremonies = await Promise.all(ceremonyIds.map((id) => ceremonyRepository.findById(id)));
  const ceremonyById = new Map(
    ceremonies.filter(Boolean).map((ceremony) => [ceremony._id.toString(), ceremony])
  );

  const categoryIds = new Set();
  const contexts = votes.map((vote) => {
    const ceremony = ceremonyById.get(vote.ceremonyId.toString());
    const nomination = ceremony?.nominaciones.id(vote.nominacionId);
    const categoryId = nomination?.categoria?.id || vote.categoryId;

    if (categoryId) {
      categoryIds.add(categoryId.toString());
    }

    return {
      vote,
      ceremony,
      nomination,
      categoryId
    };
  });

  const categories = await Promise.all(
    [...categoryIds].map((id) => categoryRepository.findById(id))
  );
  const categoryById = new Map(
    categories.filter(Boolean).map((category) => [category._id.toString(), category])
  );

  return contexts.map(({ vote, ceremony, nomination, categoryId }) => {
    const category = categoryId ? categoryById.get(categoryId.toString()) : null;
    const categorySummary = buildCategorySummary(
      category,
      nomination?.categoria,
      categoryId || vote.categoryId
    );

    return {
      voto: {
        id: vote._id,
        userId: vote.userId,
        createdAt: vote.createdAt,
        updatedAt: vote.updatedAt
      },
      ceremonia: buildCeremonySummary(ceremony, vote.ceremonyId),
      nominacion: nomination
        ? {
            id: nomination._id,
            categoria: categorySummary,
            pelicula: nomination.pelicula || null,
            profesional: nomination.profesional || null,
            esGanador: nomination.esGanador
          }
        : {
            id: vote.nominacionId,
            categoria: categorySummary
          }
    };
  });
}

async function getVoteCounts({ idCeremonia, idCategoria }) {
  const [counts, totalVotosCeremonia, ceremony] = await Promise.all([
    voteRepository.countsByCeremony({ ceremonyId: idCeremonia, categoryId: idCategoria }),
    voteRepository.countTotalByCeremony(idCeremonia),
    ceremonyRepository.findById(idCeremonia)
  ]);

  if (!ceremony) {
    throw new HttpError(404, "Ceremonia no encontrada.");
  }

  const ceremonySummary = buildCeremonySummary(ceremony, idCeremonia);

  const categories = await Promise.all(
    counts.map((count) => categoryRepository.findById(count.categoryId))
  );

  const resultados = counts.map((count, index) => {
    const nomination = ceremony.nominaciones.id(count.nominacionId);
    const category = categories[index];
    const categorySummary = buildCategorySummary(
      category,
      nomination?.categoria,
      count.categoryId
    );

    return {
      votos: count.votos,
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

  const totalVotosResultado = resultados.reduce((total, resultado) => total + resultado.votos, 0);

  return {
    ceremonia: ceremonySummary,
    resumen: {
      totalVotosCeremonia,
      totalVotosResultado,
      totalNominacionesConVotos: resultados.length,
      filtroCategoriaId: idCategoria || null
    },
    resultados
  };
}

module.exports = {
  castVote,
  getMyVotes,
  getVoteCounts
};
