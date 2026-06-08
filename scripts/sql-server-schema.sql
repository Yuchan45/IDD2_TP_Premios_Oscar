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

-- =============================================
-- SEED: Usuarios de prueba (password: asd123)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'admin@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'ADMIN'),
    'Admin', 'Oscar', 'admin@oscar.com', 'asd123'
  );

IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'miembro@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER'),
    'Miembro', 'Academia', 'miembro@oscar.com', 'asd123'
  );

IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'miembro2@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER'),
    'Lucia', 'Martinez', 'miembro2@oscar.com', 'asd123'
  );

IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'miembro3@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'ACADEMY_MEMBER'),
    'Tomas', 'Herrera', 'miembro3@oscar.com', 'asd123'
  );

IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'usuario@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'COMMON_USER'),
    'Usuario', 'Comun', 'usuario@oscar.com', 'asd123'
  );

IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'usuario2@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'COMMON_USER'),
    'Paula', 'Gomez', 'usuario2@oscar.com', 'asd123'
  );

IF NOT EXISTS (SELECT 1 FROM dbo.usuario WHERE email = 'usuario3@oscar.com')
  INSERT INTO dbo.usuario (id_rol, nombre, apellido, email, password_hash)
  VALUES (
    (SELECT id_rol FROM dbo.rol WHERE nombre = 'COMMON_USER'),
    'Nicolas', 'Ruiz', 'usuario3@oscar.com', 'asd123'
  );
GO
