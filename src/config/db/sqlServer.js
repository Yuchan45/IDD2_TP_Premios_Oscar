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
    IF OBJECT_ID('dbo.rol', 'U') IS NULL
    CREATE TABLE dbo.rol (
      id_rol    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      nombre    NVARCHAR(50) NOT NULL UNIQUE
    );
  `);

  await activePool.request().query(`
    IF OBJECT_ID('dbo.usuario', 'U') IS NULL
    CREATE TABLE dbo.usuario (
      id_usuario    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      id_rol        INT NOT NULL,
      nombre        NVARCHAR(100) NOT NULL,
      apellido      NVARCHAR(100) NOT NULL,
      email         NVARCHAR(255) NOT NULL UNIQUE,
      password_hash NVARCHAR(255) NOT NULL,
      is_active     BIT NOT NULL DEFAULT 1,
      created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      updated_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES dbo.rol(id_rol)
    );
  `);

  await activePool.request().query(`
    IF OBJECT_ID('dbo.votacion', 'U') IS NULL
    CREATE TABLE dbo.votacion (
      id_votacion     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      id_usuario      INT NOT NULL,
      id_categoria    NVARCHAR(24) NOT NULL,
      id_nominacion   NVARCHAR(24) NOT NULL,
      id_ceremonia    NVARCHAR(24) NOT NULL,
      fecha_voto      DATE NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
      CONSTRAINT fk_votacion_usuario FOREIGN KEY (id_usuario) REFERENCES dbo.usuario(id_usuario),
      CONSTRAINT uq_voto_unico UNIQUE (id_usuario, id_categoria, id_ceremonia)
    );
  `);

  await activePool.request().query(`
    IF OBJECT_ID('dbo.auditoria', 'U') IS NULL
    CREATE TABLE dbo.auditoria (
      id_auditoria  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      id_usuario    INT NOT NULL,
      accion        NVARCHAR(50) NOT NULL,
      entidad       NVARCHAR(50) NOT NULL,
      id_entidad    NVARCHAR(255) NULL,
      detalle       NVARCHAR(MAX) NULL,
      fecha         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES dbo.usuario(id_usuario)
    );
  `);

  await activePool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.rol WHERE nombre = 'ADMIN')
      INSERT INTO dbo.rol (nombre) VALUES ('ADMIN');
    IF NOT EXISTS (SELECT 1 FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER')
      INSERT INTO dbo.rol (nombre) VALUES ('ACADEMY_MEMBER');
    IF NOT EXISTS (SELECT 1 FROM dbo.rol WHERE nombre = 'COMMON_USER')
      INSERT INTO dbo.rol (nombre) VALUES ('COMMON_USER');
  `);

  // Seed usuarios de prueba
  await activePool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'admin@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'ADMIN'), 'Admin', 'Oscar', 'admin@oscar.com', 'asd123');

    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'miembro@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER'), 'Miembro', 'Academia', 'miembro@oscar.com', 'asd123');

    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'miembro2@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER'), 'Lucia', 'Martinez', 'miembro2@oscar.com', 'asd123');

    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'miembro3@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER'), 'Tomas', 'Herrera', 'miembro3@oscar.com', 'asd123');

    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'usuario@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'COMMON_USER'), 'Usuario', 'Comun', 'usuario@oscar.com', 'asd123');

    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'usuario2@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'COMMON_USER'), 'Paula', 'Gomez', 'usuario2@oscar.com', 'asd123');

    IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'usuario3@oscar.com')
      INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
      VALUES ((SELECT id_rol FROM dbo.rol WHERE nombre = 'COMMON_USER'), 'Nicolas', 'Ruiz', 'usuario3@oscar.com', 'asd123');
  `);
  logger.info({ database: env.sql.database }, "SQL Server schema ready");
}

async function connectSqlServer() {
  if (pool && pool.connected) {
    logger.info({ database: env.sql.database }, "SQL Server pool already connected");
    return pool;
  }

  logger.info({ host: env.sql.host, port: env.sql.port, database: env.sql.database }, "Connecting to SQL Server");
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
