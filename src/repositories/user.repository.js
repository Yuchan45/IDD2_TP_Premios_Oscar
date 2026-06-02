const { sql, getSqlPool } = require("../config/db/sqlServer");

function mapUser(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    isActive: Boolean(row.is_active),
    roles: row.roles ? row.roles.split(",").filter(Boolean) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function findAll() {
  const result = await getSqlPool().request().query(`
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.is_active,
      u.created_at,
      u.updated_at,
      STRING_AGG(r.name, ',') AS roles
    FROM dbo.users u
    LEFT JOIN dbo.user_roles ur ON ur.user_id = u.id
    LEFT JOIN dbo.roles r ON r.id = ur.role_id
    GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
  `);

  return result.recordset.map(mapUser);
}

async function findById(id) {
  const result = await getSqlPool()
    .request()
    .input("id", sql.UniqueIdentifier, id)
    .query(`
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.created_at,
        u.updated_at,
        STRING_AGG(r.name, ',') AS roles
      FROM dbo.users u
      LEFT JOIN dbo.user_roles ur ON ur.user_id = u.id
      LEFT JOIN dbo.roles r ON r.id = ur.role_id
      WHERE u.id = @id
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.updated_at
    `);

  return result.recordset[0] ? mapUser(result.recordset[0]) : null;
}

async function replaceRoles(transaction, userId, roles) {
  await new sql.Request(transaction)
    .input("userId", sql.UniqueIdentifier, userId)
    .query("DELETE FROM dbo.user_roles WHERE user_id = @userId");

  for (const role of roles) {
    await new sql.Request(transaction)
      .input("userId", sql.UniqueIdentifier, userId)
      .input("role", sql.NVarChar(50), role)
      .query(`
        INSERT INTO dbo.user_roles (user_id, role_id)
        SELECT @userId, id FROM dbo.roles WHERE name = @role
      `);
  }
}

async function create(data) {
  const pool = getSqlPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const result = await new sql.Request(transaction)
      .input("email", sql.NVarChar(255), data.email)
      .input("password", sql.NVarChar(255), data.password)
      .input("firstName", sql.NVarChar(100), data.firstName)
      .input("lastName", sql.NVarChar(100), data.lastName)
      .query(`
        INSERT INTO dbo.users (email, password_hash, first_name, last_name)
        OUTPUT INSERTED.id
        VALUES (@email, @password, @firstName, @lastName)
      `);

    const userId = result.recordset[0].id;
    await replaceRoles(transaction, userId, data.roles || ["COMMON_USER"]);
    await transaction.commit();
    return findById(userId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function update(id, data) {
  const pool = getSqlPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const fields = [];
    const request = new sql.Request(transaction).input("id", sql.UniqueIdentifier, id);

    if (data.email) {
      fields.push("email = @email");
      request.input("email", sql.NVarChar(255), data.email);
    }
    if (data.password) {
      fields.push("password_hash = @password");
      request.input("password", sql.NVarChar(255), data.password);
    }
    if (data.firstName) {
      fields.push("first_name = @firstName");
      request.input("firstName", sql.NVarChar(100), data.firstName);
    }
    if (data.lastName) {
      fields.push("last_name = @lastName");
      request.input("lastName", sql.NVarChar(100), data.lastName);
    }
    if (typeof data.isActive === "boolean") {
      fields.push("is_active = @isActive");
      request.input("isActive", sql.Bit, data.isActive);
    }

    if (fields.length) {
      fields.push("updated_at = SYSUTCDATETIME()");
      await request.query(`UPDATE dbo.users SET ${fields.join(", ")} WHERE id = @id`);
    }

    if (Array.isArray(data.roles)) {
      await replaceRoles(transaction, id, data.roles);
    }

    await transaction.commit();
    return findById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function remove(id) {
  await getSqlPool()
    .request()
    .input("id", sql.UniqueIdentifier, id)
    .query("UPDATE dbo.users SET is_active = 0, updated_at = SYSUTCDATETIME() WHERE id = @id");

  return { id, deleted: true };
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
