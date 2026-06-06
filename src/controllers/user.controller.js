const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const data = await userService.findAll();
  res.json({ data });
});

const get = asyncHandler(async (req, res) => {
  const data = await userService.findById(Number(req.params.id));
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const actionUserId = req.user?.id;
  const data = await userService.create(req.body, actionUserId);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const actionUserId = req.user?.id;
  const data = await userService.update(Number(req.params.id), req.body, actionUserId);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  const actionUserId = req.user?.id;
  const data = await userService.remove(Number(req.params.id), actionUserId);
  res.json({ data });
});

module.exports = {
  list,
  get,
  create,
  update,
  remove
};
