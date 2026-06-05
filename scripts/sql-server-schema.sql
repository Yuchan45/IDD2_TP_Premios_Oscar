IF DB_ID(N'OscarAwards') IS NULL
BEGIN
  CREATE DATABASE [OscarAwards];
END
GO

USE [OscarAwards];
GO

-- =============================================
-- TABLA: ROL
-- =============================================
IF OBJECT_ID('dbo.rol', 'U') IS NULL
CREATE TABLE dbo.rol (
  id_rol    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  nombre    NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- Roles por defecto
IF NOT EXISTS (SELECT 1 FROM dbo.rol WHERE nombre = 'ADMIN')
  INSERT INTO dbo.rol (nombre) VALUES ('ADMIN');
IF NOT EXISTS (SELECT 1 FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER')
  INSERT INTO dbo.rol (nombre) VALUES ('ACADEMY_MEMBER');
IF NOT EXISTS (SELECT 1 FROM dbo.rol WHERE nombre = 'COMMON_USER')
  INSERT INTO dbo.rol (nombre) VALUES ('COMMON_USER');
GO

-- =============================================
-- TABLA: USUARIO
-- =============================================
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
GO

-- =============================================
-- TABLA: VOTACION
-- =============================================
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
GO

-- =============================================
-- TABLA: AUDITORIA
-- Registra acciones criticas de los usuarios
-- =============================================
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
GO
