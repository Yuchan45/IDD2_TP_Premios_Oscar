const { sql, getSqlPool } = require("../config/db/sqlServer");

async function log({ idUsuario, accion, entidad, idEntidad, detalle }) {
  await getSqlPool()
    .request()
    .input("idUsuario", sql.Int, idUsuario)
    .input("accion", sql.NVarChar(50), accion)
    .input("entidad", sql.NVarChar(50), entidad)
    .input("idEntidad", sql.NVarChar(255), idEntidad || null)
    .input("detalle", sql.NVarChar(sql.MAX), detalle || null)
    .query(`
      INSERT INTO dbo.auditoria (id_usuario, accion, entidad, id_entidad, detalle)
      VALUES (@idUsuario, @accion, @entidad, @idEntidad, @detalle)
    `);
}

async function findByUsuario(idUsuario, limit = 50) {
  const result = await getSqlPool()
    .request()
    .input("idUsuario", sql.Int, idUsuario)
    .input("limit", sql.Int, limit)
    .query(`
      SELECT TOP(@limit)
        id_auditoria, id_usuario, accion, entidad, id_entidad, detalle, fecha
      FROM dbo.auditoria
      WHERE id_usuario = @idUsuario
      ORDER BY fecha DESC
    `);

  return result.recordset;
}

async function findAll(limit = 100) {
  const result = await getSqlPool()
    .request()
    .input("limit", sql.Int, limit)
    .query(`
      SELECT TOP(@limit)
        a.id_auditoria, a.id_usuario, u.email, a.accion, a.entidad, a.id_entidad, a.detalle, a.fecha
      FROM dbo.auditoria a
      INNER JOIN dbo.usuario u ON u.id_usuario = a.id_usuario
      ORDER BY a.fecha DESC
    `);

  return result.recordset;
}

module.exports = {
  log,
  findByUsuario,
  findAll
};
