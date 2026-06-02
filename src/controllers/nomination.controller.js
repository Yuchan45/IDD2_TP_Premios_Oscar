const nominationService = require("../services/nomination.service");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const data = await nominationService.findAll(req.query);
  res.json({ data });
});

const get = asyncHandler(async (req, res) => {
  const data = await nominationService.findById(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await nominationService.create(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await nominationService.update(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await nominationService.remove(req.params.id);
  res.json({ data });
});

module.exports = {
  list,
  get,
  create,
  update,
  remove
};
