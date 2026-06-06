const { sql, getSqlPool } = require("../config/db/sqlServer");

function mapVote(row) {
  return {
    idVotacion: row.id_votacion,
    idUsuario: row.id_usuario,
    idCategoria: row.id_categoria,
    idNominacion: row.id_nominacion,
    idCeremonia: row.id_ceremonia,
    fechaVoto: row.fecha_voto
  };
}

async function create({ idUsuario, idCategoria, idNominacion, idCeremonia }) {
  const result = await getSqlPool()
    .request()
    .input("idUsuario", sql.Int, idUsuario)
    .input("idCategoria", sql.NVarChar(24), idCategoria)
    .input("idNominacion", sql.NVarChar(24), idNominacion)
    .input("idCeremonia", sql.NVarChar(24), idCeremonia)
    .query(`
      INSERT INTO dbo.votacion (id_usuario, id_categoria, id_nominacion, id_ceremonia)
      OUTPUT
        INSERTED.id_votacion,
        INSERTED.id_usuario,
        INSERTED.id_categoria,
        INSERTED.id_nominacion,
        INSERTED.id_ceremonia,
        INSERTED.fecha_voto
      VALUES (@idUsuario, @idCategoria, @idNominacion, @idCeremonia)
    `);

  return mapVote(result.recordset[0]);
}

async function findByUser({ idUsuario, idCeremonia, idCategoria }) {
  const result = await getSqlPool()
    .request()
    .input("idUsuario", sql.Int, idUsuario)
    .input("idCeremonia", sql.NVarChar(24), idCeremonia)
    .input("idCategoria", sql.NVarChar(24), idCategoria)
    .query(`
      SELECT id_votacion, id_usuario, id_categoria, id_nominacion, id_ceremonia, fecha_voto
      FROM dbo.votacion
      WHERE id_usuario = @idUsuario
        AND id_ceremonia = @idCeremonia
        AND id_categoria = @idCategoria
    `);

  return result.recordset[0] ? mapVote(result.recordset[0]) : null;
}

async function countsByCeremony({ idCeremonia, idCategoria }) {
  const request = getSqlPool()
    .request()
    .input("idCeremonia", sql.NVarChar(24), idCeremonia);

  let where = "WHERE id_ceremonia = @idCeremonia";

  if (idCategoria) {
    request.input("idCategoria", sql.NVarChar(24), idCategoria);
    where += " AND id_categoria = @idCategoria";
  }

  const result = await request.query(`
    SELECT id_nominacion AS nominacionId, COUNT(*) AS votos
    FROM dbo.votacion
    ${where}
    GROUP BY id_nominacion
  `);

  return result.recordset;
}

module.exports = {
  create,
  findByUser,
  countsByCeremony
};
