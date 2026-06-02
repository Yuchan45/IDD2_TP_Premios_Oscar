const categoryService = require("../services/category.service");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const data = await categoryService.findAll(req.query);
  res.json({ data });
});

const get = asyncHandler(async (req, res) => {
  const data = await categoryService.findById(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await categoryService.create(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await categoryService.update(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await categoryService.remove(req.params.id);
  res.json({ data });
});

module.exports = {
  list,
  get,
  create,
  update,
  remove
};
