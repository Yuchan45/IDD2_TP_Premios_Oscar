const auditRepository = require("../repositories/audit.repository");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const data = await auditRepository.findAll(limit);
  res.json({ data });
});

const byUser = asyncHandler(async (req, res) => {
  const idUsuario = Number(req.params.id);
  const limit = Number(req.query.limit) || 50;
  const data = await auditRepository.findByUsuario(idUsuario, limit);
  res.json({ data });
});

module.exports = { list, byUser };
