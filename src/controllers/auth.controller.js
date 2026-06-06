const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({ data });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.token);
  res.json({ data });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.token, req.user?.id);
  res.json({ data: { message: "Sesion cerrada." } });
});

module.exports = { login, me, logout };
