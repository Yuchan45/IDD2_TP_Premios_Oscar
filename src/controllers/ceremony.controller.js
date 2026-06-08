const ceremonyService = require("../services/ceremony.service");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const list = asyncHandler(async (req, res) => {
  const data = await ceremonyService.findAll(req.query);
  res.json({ data });
});

const get = asyncHandler(async (req, res) => {
  const data = await ceremonyService.findById(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await ceremonyService.create(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await ceremonyService.update(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await ceremonyService.remove(req.params.id);
  res.json({ data });
});

const close = asyncHandler(async (req, res) => {
  const data = await ceremonyService.close(req.params.id);
  res.json({ data });
});

const listNominaciones = asyncHandler(async (req, res) => {
  const data = await ceremonyService.findNominaciones(req.params.id, req.query);
  res.json({ data });
});

const results = asyncHandler(async (req, res) => {
  const ceremony = await ceremonyService.findById(req.params.id);
  if (ceremony.estado !== "cerrada") {
    throw new HttpError(
      403,
      "Los resultados solo están disponibles cuando la ceremonia está cerrada.",
    );
  }
  const data = await ceremonyService.getResults(req.params.id);
  res.json({ data });
});

const leaderboard = asyncHandler(async (req, res) => {
  const ceremony = await ceremonyService.findById(req.params.id);
  if (ceremony.estado === "abierta" && req.user.rol !== "ADMIN") {
    throw new HttpError(
      403,
      "El leaderboard de una ceremonia abierta es solo visible para administradores.",
    );
  }
  const data = await ceremonyService.getCategoryLeaderboard(
    req.params.id,
    req.params.categoryId,
  );
  res.json({ data });
});

const addNominacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.addNominacion(req.params.id, req.body);
  res.status(201).json({ data });
});

const updateNominacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.updateNominacion(
    req.params.id,
    req.params.nomId,
    req.body,
  );
  res.json({ data });
});

const removeNominacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.removeNominacion(
    req.params.id,
    req.params.nomId,
  );
  res.json({ data });
});

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  close,
  listNominaciones,
  results,
  leaderboard,
  addNominacion,
  updateNominacion,
  removeNominacion,
};
