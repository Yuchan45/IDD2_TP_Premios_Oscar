const { getRedisClient } = require("../config/db/redis");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Token requerido." } });
  }

  const token = header.slice(7);

  try {
    const redis = getRedisClient();
    const data = await redis.get(`session:${token}`);

    if (!data) {
      return res.status(401).json({ error: { message: "Sesion expirada o invalida." } });
    }

    req.user = JSON.parse(data);
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
