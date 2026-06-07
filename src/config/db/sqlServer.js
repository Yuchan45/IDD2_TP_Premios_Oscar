const sql = require("mssql");
const env = require("../env");
const { logger } = require("../logger");

let pool;

function baseConfig(database) {
  return {
    server: env.sql.host,
    port: env.sql.port,
    user: env.sql.user,
    password: env.sql.password,
    database,
    options: {
      encrypt: env.sql.encrypt,
      trustServerCertificate: env.sql.trustServerCertificate
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}

function assertSafeIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error("SQL Server database name contains unsafe characters.");
  }
}

async function ensureDatabase() {
  assertSafeIdentifier(env.sql.database);
  logger.info({ database: env.sql.database }, "Ensuring SQL Server database exists");
  const masterPool = await sql.connect(baseConfig("master"));
  await masterPool.request().query(`
    IF DB_ID(N'${env.sql.database}') IS NULL
    BEGIN
      CREATE DATABASE [${env.sql.database}];
    END
  `);
  await masterPool.close();
  logger.info({ database: env.sql.database }, "SQL Server database ready");
}

async function ensureSchema(activePool) {
  logger.info({ database: env.sql.database }, "Ensuring SQL Server schema exists");
  await activePool.request().query(`
    IF OBJECT_ID('dbo.roles', 'U') IS NULL
    CREATE TABLE dbo.roles (
      id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
      name NVARCHAR(50) NOT NULL UNIQUE,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    IF OBJECT_ID('dbo.users', 'U') IS NULL
    CREATE TABLE dbo.users (
      id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
      email NVARCHAR(255) NOT NULL UNIQUE,
      password_hash NVARCHAR(255) NOT NULL,
      first_name NVARCHAR(100) NOT NULL,
      last_name NVARCHAR(100) NOT NULL,
      is_active BIT NOT NULL DEFAULT 1,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    IF OBJECT_ID('dbo.user_roles', 'U') IS NULL
    CREATE TABLE dbo.user_roles (
      user_id UNIQUEIDENTIFIER NOT NULL,
      role_id UNIQUEIDENTIFIER NOT NULL,
      PRIMARY KEY (user_id, role_id),
      CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES dbo.users(id),
      CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES dbo.roles(id)
    );

  `);

  await activePool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = 'ADMIN')
      INSERT INTO dbo.roles (name) VALUES ('ADMIN');
    IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = 'ACADEMY_MEMBER')
      INSERT INTO dbo.roles (name) VALUES ('ACADEMY_MEMBER');
    IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = 'COMMON_USER')
      INSERT INTO dbo.roles (name) VALUES ('COMMON_USER');
  `);
  logger.info({ database: env.sql.database }, "SQL Server schema ready");
}

async function connectSqlServer() {
  if (pool && pool.connected) {
    logger.info({ database: env.sql.database }, "SQL Server pool already connected");
    return pool;
  }

  logger.info(
    { host: env.sql.host, port: env.sql.port, database: env.sql.database },
    "Connecting to SQL Server"
  );
  await ensureDatabase();
  pool = await new sql.ConnectionPool(baseConfig(env.sql.database)).connect();
  await ensureSchema(pool);
  logger.info({ database: env.sql.database }, "SQL Server connected");
  return pool;
}

function getSqlPool() {
  if (!pool || !pool.connected) {
    throw new Error("SQL Server pool is not connected.");
  }
  return pool;
}

async function disconnectSqlServer() {
  if (pool) {
    logger.info({ database: env.sql.database }, "Disconnecting SQL Server");
    await pool.close();
    pool = undefined;
    logger.info({ database: env.sql.database }, "SQL Server disconnected");
  }
}

module.exports = {
  sql,
  connectSqlServer,
  getSqlPool,
  disconnectSqlServer
};
