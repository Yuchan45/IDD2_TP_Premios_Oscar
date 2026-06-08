const ceremonyService = require("../services/ceremony.service");
const asyncHandler = require("../utils/asyncHandler");

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

const listActuaciones = asyncHandler(async (req, res) => {
  const data = await ceremonyService.findActuaciones(req.params.id);
  res.json({ data });
});

const results = asyncHandler(async (req, res) => {
  const data = await ceremonyService.getResults(req.params.id);
  res.json({ data });
});

const leaderboard = asyncHandler(async (req, res) => {
  const data = await ceremonyService.getCategoryLeaderboard(req.params.id, req.params.categoryId);
  res.json({ data });
});

const addNominacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.addNominacion(req.params.id, req.body);
  res.status(201).json({ data });
});

const updateNominacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.updateNominacion(req.params.id, req.params.nomId, req.body);
  res.json({ data });
});

const removeNominacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.removeNominacion(req.params.id, req.params.nomId);
  res.json({ data });
});

const addActuacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.addActuacion(req.params.id, req.body);
  res.status(201).json({ data });
});

const updateActuacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.updateActuacion(req.params.id, req.params.actuacionId, req.body);
  res.json({ data });
});

const removeActuacion = asyncHandler(async (req, res) => {
  const data = await ceremonyService.removeActuacion(req.params.id, req.params.actuacionId);
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
  listActuaciones,
  results,
  leaderboard,
  addNominacion,
  updateNominacion,
  removeNominacion,
  addActuacion,
  updateActuacion,
  removeActuacion
};
