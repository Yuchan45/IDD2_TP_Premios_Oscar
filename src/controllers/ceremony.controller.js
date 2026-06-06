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

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  close,
  listNominaciones
};
