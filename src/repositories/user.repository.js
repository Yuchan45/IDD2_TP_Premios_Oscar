const { sql, getSqlPool } = require("../config/db/sqlServer");

function mapUser(row) {
  return {
    id: row.id_usuario,
    idRol: row.id_rol,
    rol: row.rol_nombre || null,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const SELECT_USER = `
  SELECT
    u.id_usuario,
    u.id_rol,
    r.nombre AS rol_nombre,
    u.nombre,
    u.apellido,
    u.email,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM dbo.usuario u
  INNER JOIN dbo.rol r ON r.id_rol = u.id_rol
`;

async function findAll() {
  const result = await getSqlPool().request().query(`
    ${SELECT_USER}
    ORDER BY u.created_at DESC
  `);
  return result.recordset.map(mapUser);
}

async function findById(id) {
  const result = await getSqlPool()
    .request()
    .input("id", sql.Int, id)
    .query(`${SELECT_USER} WHERE u.id_usuario = @id`);
  return result.recordset[0] ? mapUser(result.recordset[0]) : null;
}

async function findByEmail(email) {
  const result = await getSqlPool()
    .request()
    .input("email", sql.NVarChar(255), email)
    .query(`
      ${SELECT_USER}
      WHERE u.email = @email
    `);

  if (!result.recordset[0]) return null;

  const row = result.recordset[0];
  return {
    ...mapUser(row),
    passwordHash: row.password_hash
  };
}

async function findByEmailWithPassword(email) {
  const result = await getSqlPool()
    .request()
    .input("email", sql.NVarChar(255), email)
    .query(`
      SELECT
        u.id_usuario,
        u.id_rol,
        r.nombre AS rol_nombre,
        u.nombre,
        u.apellido,
        u.email,
        u.password_hash,
        u.is_active,
        u.created_at,
        u.updated_at
      FROM dbo.usuario u
      INNER JOIN dbo.rol r ON r.id_rol = u.id_rol
      WHERE u.email = @email
    `);

  if (!result.recordset[0]) return null;

  const row = result.recordset[0];
  return {
    ...mapUser(row),
    passwordHash: row.password_hash
  };
}

async function create(data) {
  const pool = getSqlPool();

  const rolResult = await pool
    .request()
    .input("rol", sql.NVarChar(50), data.rol || "COMMON_USER")
    .query("SELECT id_rol FROM dbo.rol WHERE nombre = @rol");

  if (!rolResult.recordset[0]) {
    throw new Error(`Rol '${data.rol || "COMMON_USER"}' not found.`);
  }

  const idRol = rolResult.recordset[0].id_rol;

  const result = await pool
    .request()
    .input("idRol", sql.Int, idRol)
    .input("nombre", sql.NVarChar(100), data.nombre)
    .input("apellido", sql.NVarChar(100), data.apellido)
    .input("email", sql.NVarChar(255), data.email)
    .input("password", sql.NVarChar(255), data.password)
    .query(`
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      OUTPUT INSERTED.id_usuario
      VALUES (@idRol, @nombre, @apellido, @email, @password)
    `);

  return findById(result.recordset[0].id_usuario);
}

async function update(id, data) {
  const pool = getSqlPool();
  const fields = [];
  const request = pool.request().input("id", sql.Int, id);

  if (data.nombre) {
    fields.push("nombre = @nombre");
    request.input("nombre", sql.NVarChar(100), data.nombre);
  }
  if (data.apellido) {
    fields.push("apellido = @apellido");
    request.input("apellido", sql.NVarChar(100), data.apellido);
  }
  if (data.email) {
    fields.push("email = @email");
    request.input("email", sql.NVarChar(255), data.email);
  }
  if (data.password) {
    fields.push("password_hash = @password");
    request.input("password", sql.NVarChar(255), data.password);
  }
  if (typeof data.isActive === "boolean") {
    fields.push("is_active = @isActive");
    request.input("isActive", sql.Bit, data.isActive);
  }
  if (data.rol) {
    const rolResult = await pool
      .request()
      .input("rol", sql.NVarChar(50), data.rol)
      .query("SELECT id_rol FROM dbo.rol WHERE nombre = @rol");

    if (rolResult.recordset[0]) {
      fields.push("id_rol = @idRol");
      request.input("idRol", sql.Int, rolResult.recordset[0].id_rol);
    }
  }

  if (fields.length) {
    fields.push("updated_at = SYSUTCDATETIME()");
    await request.query(
      `UPDATE dbo.usuario SET ${fields.join(", ")} WHERE id_usuario = @id`
    );
  }

  return findById(id);
}

async function remove(id) {
  await getSqlPool()
    .request()
    .input("id", sql.Int, id)
    .query(
      "UPDATE dbo.usuario SET is_active = 0, updated_at = SYSUTCDATETIME() WHERE id_usuario = @id"
    );
  return { id, deleted: true };
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByEmailWithPassword,
  create,
  update,
  remove
};
