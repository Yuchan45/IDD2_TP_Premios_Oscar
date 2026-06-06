const ceremonyRepository = require("../repositories/ceremony.repository");
const voteRepository = require("../repositories/vote.repository");
const { getRedisClient } = require("../config/db/redis");
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

async function addNominacion(id, data) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  if (ceremony.estado === "cerrada")
    throw new HttpError(409, "La ceremonia ya esta cerrada.");
  const { esGanador: _, ...safeData } = data;
  ceremony.nominaciones.push(safeData);
  return ceremony.save();
}

async function updateNominacion(id, nomId, data) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  if (ceremony.estado === "cerrada")
    throw new HttpError(409, "La ceremonia ya esta cerrada.");
  const nom = ceremony.nominaciones.id(nomId);
  if (!nom) throw new HttpError(404, "Nominacion no encontrada.");
  const { esGanador: _, ...safeData } = data;
  Object.assign(nom, safeData);
  return ceremony.save();
}

async function removeNominacion(id, nomId) {
  const ceremony = await ceremonyRepository.findById(id);
  if (!ceremony) throw new HttpError(404, "Ceremonia no encontrada.");
  if (ceremony.estado === "cerrada")
    throw new HttpError(409, "La ceremonia ya esta cerrada.");
  const nom = ceremony.nominaciones.id(nomId);
  if (!nom) throw new HttpError(404, "Nominacion no encontrada.");
  nom.deleteOne();
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
  addNominacion,
  updateNominacion,
  removeNominacion,
};
