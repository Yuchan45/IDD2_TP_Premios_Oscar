const ceremonyRepository = require("../repositories/ceremony.repository");
const voteRepository = require("../repositories/vote.repository");
const categoryRepository = require("../repositories/category.repository");
const { getRedisClient } = require("../config/db/redis");
const HttpError = require("../utils/httpError");

function findAll(filters) {
  return ceremonyRepository.findAll(filters);
}

function buildCeremonySummary(ceremony) {
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
      nombre: snapshot.nombre
    };
  }

  return { id: fallbackId };
}

function buildNominationPayload(nomination, categorySummary, votos) {
  return {
    id: nomination._id,
    categoria: categorySummary,
    pelicula: nomination.pelicula || null,
    profesional: nomination.profesional || null,
    esGanador: nomination.esGanador,
    votos
  };
}

function sortByVotesDesc(left, right) {
  if (right.votos !== left.votos) {
    return right.votos - left.votos;
  }

  return String(left.nominacion.id).localeCompare(String(right.nominacion.id));
}

async function findById(id) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) {
    throw new HttpError(404, "Ceremony not found.");
  }
  return ceremony;
}

function assertCeremonyIsOpen(ceremony) {
  if (ceremony.estado === "cerrada") {
    throw new HttpError(409, "La ceremonia ya esta cerrada.");
  }
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

async function close(id) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  if (ceremony.estado === "cerrada")
    throw new HttpError(409, "La ceremonia ya esta cerrada.");

  const voteCounts = await voteRepository.countsByCeremony({ ceremonyId: id });

  // Por cada categoría, quedarse con la nominación que tenga más votos
  const winnerByCategory = {};
  for (const { nominacionId, votos } of voteCounts) {
    const nom = ceremony.nominaciones.id(nominacionId);
    if (!nom) continue;
    const catId = nom.categoria.id.toString();
    if (!winnerByCategory[catId] || votos > winnerByCategory[catId].votos) {
      winnerByCategory[catId] = { nominacionId, votos, nom };
    }
  }

  // Marcar ganadores y armar premios
  const premios = [];
  for (const { nominacionId, nom } of Object.values(winnerByCategory)) {
    ceremony.nominaciones.id(nominacionId).esGanador = true;
    premios.push({
      categoria: nom.categoria,
      nominadoGanadorId: nominacionId,
      ganador: nom.pelicula
        ? { tipo: "pelicula", pelicula: nom.pelicula, profesional: null }
        : { tipo: "profesional", profesional: nom.profesional, pelicula: null },
    });
  }

  ceremony.premios = premios;
  ceremony.estado = "cerrada";
  const saved = await ceremony.save();

  await getRedisClient().set(`ceremony:closed:${id}`, "1");

  return saved;
}

async function findNominaciones(id, filters) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  return ceremonyRepository.findNominaciones(id, filters);
}

async function findActuaciones(id) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  return ceremony.actuaciones;
}

async function getCategoryLeaderboard(id, categoryId) {
  const [ceremony, category, counts] = await Promise.all([
    ceremonyRepository.findById(id),
    categoryRepository.findById(categoryId),
    voteRepository.countsByCeremony({ ceremonyId: id, categoryId })
  ]);

  if (!ceremony) {
    throw new HttpError(404, "Ceremonia no encontrada.");
  }

  const nominations = ceremony.nominaciones.filter(
    (nomination) => nomination.categoria.id.toString() === categoryId
  );

  if (!nominations.length) {
    throw new HttpError(404, "No hay nominaciones para esta categoria en la ceremonia.");
  }

  const categorySummary = buildCategorySummary(category, nominations[0].categoria, categoryId);
  const votesByNominationId = new Map(
    counts.map((count) => [count.nominacionId.toString(), count.votos])
  );

  const leaderboard = nominations
    .map((nomination) => ({
      votos: votesByNominationId.get(nomination._id.toString()) || 0,
      nominacion: buildNominationPayload(
        nomination,
        categorySummary,
        votesByNominationId.get(nomination._id.toString()) || 0
      )
    }))
    .sort(sortByVotesDesc)
    .map((entry, index) => ({
      posicion: index + 1,
      votos: entry.votos,
      nominacion: entry.nominacion
    }));

  const totalVotosCategoria = leaderboard.reduce((total, entry) => total + entry.votos, 0);
  const highestVotes = leaderboard[0]?.votos || 0;
  const leaders = leaderboard.filter((entry) => entry.votos === highestVotes && highestVotes > 0);

  return {
    ceremonia: buildCeremonySummary(ceremony),
    categoria: categorySummary,
    resumen: {
      totalNominaciones: leaderboard.length,
      totalVotosCategoria,
      liderActualNominacionId: leaders.length === 1 ? leaders[0].nominacion.id : null,
      hayEmpateEnPrimerLugar: leaders.length > 1
    },
    leaderboard
  };
}

async function getResults(id) {
  const [ceremony, counts, totalVotosCeremonia] = await Promise.all([
    ceremonyRepository.findById(id),
    voteRepository.countsByCeremony({ ceremonyId: id }),
    voteRepository.countTotalByCeremony(id)
  ]);

  if (!ceremony) {
    throw new HttpError(404, "Ceremonia no encontrada.");
  }

  const votesByNominationId = new Map(
    counts.map((count) => [count.nominacionId.toString(), count.votos])
  );
  const categoryIds = [];

  for (const nomination of ceremony.nominaciones) {
    const categoryId = nomination.categoria.id.toString();
    if (!categoryIds.includes(categoryId)) {
      categoryIds.push(categoryId);
    }
  }

  const categories = await Promise.all(
    categoryIds.map((categoryId) => categoryRepository.findById(categoryId))
  );
  const categoryById = new Map(
    categories.filter(Boolean).map((category) => [category._id.toString(), category])
  );

  const categorias = categoryIds.map((categoryId) => {
    const nominations = ceremony.nominaciones
      .filter((nomination) => nomination.categoria.id.toString() === categoryId)
      .map((nomination) => {
        const votos = votesByNominationId.get(nomination._id.toString()) || 0;
        const categorySummary = buildCategorySummary(
          categoryById.get(categoryId),
          nomination.categoria,
          categoryId
        );

        return {
          votos,
          nominacion: buildNominationPayload(nomination, categorySummary, votos)
        };
      })
      .sort(sortByVotesDesc);

    const totalVotosCategoria = nominations.reduce((total, nomination) => total + nomination.votos, 0);
    const highestVotes = nominations[0]?.votos || 0;
    const leaders = nominations.filter(
      (nomination) => nomination.votos === highestVotes && highestVotes > 0
    );
    const ganador = nominations.find((nomination) => nomination.nominacion.esGanador) || null;

    return {
      categoria: nominations[0]?.nominacion.categoria || buildCategorySummary(
        categoryById.get(categoryId),
        null,
        categoryId
      ),
      totalVotosCategoria,
      hayEmpateEnPrimerLugar: leaders.length > 1,
      liderActual: leaders.length === 1 ? leaders[0].nominacion : null,
      ganador: ganador ? ganador.nominacion : null,
      nominaciones: nominations
    };
  });

  return {
    ceremonia: buildCeremonySummary(ceremony),
    resumen: {
      totalVotosCeremonia,
      totalCategorias: categorias.length,
      totalCategoriasConVotos: categorias.filter((categoria) => categoria.totalVotosCategoria > 0).length,
      totalCategoriasConGanador: categorias.filter((categoria) => categoria.ganador).length
    },
    premios: ceremony.premios,
    categorias
  };
}

async function addNominacion(id, data) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  assertCeremonyIsOpen(ceremony);
  const { esGanador: _, ...safeData } = data;
  ceremony.nominaciones.push(safeData);
  return ceremony.save();
}

async function updateNominacion(id, nomId, data) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  assertCeremonyIsOpen(ceremony);
  const nom = ceremony.nominaciones.id(nomId);
  if (!nom) throw new HttpError(404, "Nominacion no encontrada.");
  const { esGanador: _, ...safeData } = data;
  Object.assign(nom, safeData);
  return ceremony.save();
}

async function removeNominacion(id, nomId) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  assertCeremonyIsOpen(ceremony);
  const nom = ceremony.nominaciones.id(nomId);
  if (!nom) throw new HttpError(404, "Nominacion no encontrada.");
  nom.deleteOne();
  return ceremony.save();
}

async function addActuacion(id, data) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  assertCeremonyIsOpen(ceremony);
  ceremony.actuaciones.push(data);
  return ceremony.save();
}

async function updateActuacion(id, actuacionId, data) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  assertCeremonyIsOpen(ceremony);

  const actuacion = ceremony.actuaciones.id(actuacionId);
  if (!actuacion) throw new HttpError(404, "Actuacion no encontrada.");

  actuacion.set(data);
  return ceremony.save();
}

async function removeActuacion(id, actuacionId) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  assertCeremonyIsOpen(ceremony);

  const actuacion = ceremony.actuaciones.id(actuacionId);
  if (!actuacion) throw new HttpError(404, "Actuacion no encontrada.");

  actuacion.deleteOne();
  return ceremony.save();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  close,
  findNominaciones,
  findActuaciones,
  getCategoryLeaderboard,
  getResults,
  addNominacion,
  updateNominacion,
  removeNominacion,
  addActuacion,
  updateActuacion,
  removeActuacion,
};
