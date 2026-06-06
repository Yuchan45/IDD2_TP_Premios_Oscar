const crypto = require("crypto");
const { getRedisClient } = require("../config/db/redis");
const userRepository = require("../repositories/user.repository");
const auditRepository = require("../repositories/audit.repository");
const HttpError = require("../utils/httpError");

const SESSION_TTL = 3600; // 1 hora

async function login({ email, password }) {
  const user = await userRepository.findByEmailWithPassword(email);

  if (!user || !user.isActive) {
    throw new HttpError(401, "Credenciales invalidas.");
  }

  // Comparacion directa (en produccion usar bcrypt)
  if (user.passwordHash !== password) {
    throw new HttpError(401, "Credenciales invalidas.");
  }

  const token = crypto.randomUUID();
  const sessionData = {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    rol: user.rol
  };

  const redis = getRedisClient();
  await redis.set(`session:${token}`, JSON.stringify(sessionData), { EX: SESSION_TTL });

  await auditRepository.log({
    idUsuario: user.id,
    accion: "LOGIN",
    entidad: "SESION",
    detalle: `Login exitoso desde ${email}`
  });

  return { user: sessionData, token };
}

async function me(token) {
  const redis = getRedisClient();
  const data = await redis.get(`session:${token}`);

  if (!data) {
    throw new HttpError(401, "Sesion expirada o invalida.");
  }

  return JSON.parse(data);
}

async function logout(token, userId) {
  const redis = getRedisClient();
  await redis.del(`session:${token}`);

  if (userId) {
    await auditRepository.log({
      idUsuario: userId,
      accion: "LOGOUT",
      entidad: "SESION"
    });
  }
}

module.exports = {
  login,
  me,
  logout
};
