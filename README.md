# Premios Oscar API

API REST basica con arquitectura MVC tradicional para gestionar entidades principales de una aplicacion de Premios Oscar.

## Stack

- Node.js + Express
- MongoDB: peliculas, categorias, profesionales, ceremonias, nominaciones y actuaciones musicales
- SQL Server: usuarios y roles

Redis, Cassandra, votaciones, sesiones, autenticacion y reportes historicos quedan fuera de esta version base.

## Estructura

```text
src/
  app.js
  server.js
  config/
    db/
  controllers/
  middlewares/
  models/
  repositories/
  routes/
  services/
  utils/
```

La API sigue el flujo MVC tradicional con archivos explicitos por recurso:

```text
routes -> controllers -> services -> repositories -> models / config db
```

- `controllers`: reciben la request HTTP y devuelven la response.
- `services`: contienen reglas simples de negocio, como validar que un recurso exista.
- `repositories`: encapsulan las consultas a MongoDB o SQL Server.
- `models`: definen los esquemas de MongoDB.

## Inicio rapido

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000`.

## Endpoints

Todos los endpoints son CRUD simples.

- `GET /health`
- `/api/users`
- `/api/movies`
- `/api/categories`
- `/api/professionals`
- `/api/ceremonies`
- `/api/nominations`
- `/api/performances`

Cada recurso soporta:

- `GET /api/<resource>`
- `GET /api/<resource>/:id`
- `POST /api/<resource>`
- `PUT /api/<resource>/:id`
- `DELETE /api/<resource>/:id`

## Usuarios de prueba

Todos los usuarios se crean automáticamente al levantar la app. Password: `asd123`

| Email               | Rol            | Permisos                     |
| ------------------- | -------------- | ---------------------------- |
| `admin@oscar.com`   | ADMIN          | CRUD completo, ver auditoría |
| `miembro@oscar.com` | ACADEMY_MEMBER | Votar en categorías          |
| `usuario@oscar.com` | COMMON_USER    | Solo consultas               |

## Notas

- No hay autenticacion ni autorizacion en esta version.
- `DELETE /api/users/:id` realiza baja logica con `is_active = 0`.
- Las contrasenas de usuarios se guardan en el campo `password_hash`, pero esta version no implementa login ni hashing productivo.
