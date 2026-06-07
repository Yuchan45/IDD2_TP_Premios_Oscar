# Premios Oscar API

API REST basica con arquitectura MVC tradicional para gestionar entidades principales de una aplicacion de Premios Oscar.

## Stack

- Node.js + Express
- MongoDB: peliculas, categorias, profesionales y ceremonias
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

1. Crear o completar el archivo `.env` en la raiz del proyecto.
2. Usar `.env.example` solo como plantilla de referencia.
3. Levantar dependencias:

```bash
docker compose up -d
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000`.

La aplicacion carga variables desde `./.env` de forma explicita en runtime.

## Endpoints

Todos los endpoints son CRUD simples.

- `GET /health`
- `/api/users`
- `/api/movies`
- `/api/categories`
- `/api/professionals`
- `/api/ceremonies`

Cada recurso soporta:

- `GET /api/<resource>`
- `GET /api/<resource>/:id`
- `POST /api/<resource>`
- `PUT /api/<resource>/:id`
- `DELETE /api/<resource>/:id`

## Notas

- No hay autenticacion ni autorizacion en esta version.
- `DELETE /api/users/:id` realiza baja logica con `is_active = 0`.
- Las contrasenas de usuarios se guardan en el campo `password_hash`, pero esta version no implementa login ni hashing productivo.
