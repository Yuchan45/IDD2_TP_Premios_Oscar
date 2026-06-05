const userRepository = require("../repositories/user.repository");
const auditRepository = require("../repositories/audit.repository");
const HttpError = require("../utils/httpError");

function findAll() {
  return userRepository.findAll();
}

async function findById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado.");
  }
  return user;
}

async function create(data, actionUserId) {
  const user = await userRepository.create(data);

  if (actionUserId) {
    await auditRepository.log({
      idUsuario: actionUserId,
      accion: "CREATE",
      entidad: "USUARIO",
      idEntidad: String(user.id),
      detalle: JSON.stringify({ email: data.email, rol: data.rol })
    });
  }

  return user;
}

async function update(id, data, actionUserId) {
  await findById(id);
  const user = await userRepository.update(id, data);

  if (actionUserId) {
    await auditRepository.log({
      idUsuario: actionUserId,
      accion: "UPDATE",
      entidad: "USUARIO",
      idEntidad: String(id),
      detalle: JSON.stringify(data)
    });
  }

  return user;
}

async function remove(id, actionUserId) {
  await findById(id);
  const result = await userRepository.remove(id);

  if (actionUserId) {
    await auditRepository.log({
      idUsuario: actionUserId,
      accion: "DELETE",
      entidad: "USUARIO",
      idEntidad: String(id)
    });
  }

  return result;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
