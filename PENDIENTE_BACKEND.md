# Pendientes backend

## Estado actual

### Ya implementado

| Recurso | Endpoints | Base de datos |
|---|---|---|
| Categorías | CRUD `/api/categories` | MongoDB |
| Profesionales | CRUD `/api/professionals` | MongoDB |
| Películas | CRUD `/api/movies` | MongoDB |
| Ceremonias | CRUD `/api/ceremonies` (incluye nominaciones, premios y actuaciones embebidos) | MongoDB |
| Usuarios | CRUD `/api/users` — devuelve `roles[]` | SQL Server |
| Votos | `POST/GET /api/votes`, `GET /api/votes/my-vote` | MongoDB |

### Pendiente

| Tarea | Prioridad |
|---|---|
| `POST /api/auth/login` | Alta |
| `GET /api/auth/me` | Alta |
| `POST /api/ceremonies/:id/close` | Media |
| Endpoints históricos `/api/history/*` | Media |
| Conexión y schema de Cassandra | Media |

---

## 1. Autenticación

El frontend necesita saber quién es el usuario activo y cuáles son sus roles. `GET /api/users/:id` ya devuelve roles correctamente, pero no hay forma de autenticarse todavía.

### `POST /api/auth/login`

**Request:**
```json
{
  "email": "usuario@mail.com",
  "password": "contraseña"
}
```

**Response exitosa (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@mail.com",
      "firstName": "Juan",
      "lastName": "Perez",
      "roles": ["ACADEMY_MEMBER"]
    },
    "token": "token-de-sesion"
  }
}
```

**Response de error (401):**
```json
{ "error": "Credenciales inválidas" }
```

**Notas:**
- El token puede ser un JWT firmado o un UUID guardado en Redis con TTL
- `roles` posibles: `ADMIN`, `ACADEMY_MEMBER`, `COMMON_USER`
- El frontend usa `roles` para mostrar/ocultar acciones (crear, editar, eliminar, votar)

---

### `GET /api/auth/me`

Devuelve el usuario autenticado a partir del token (para restaurar sesión al recargar la página).

**Header:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "usuario@mail.com",
    "firstName": "Juan",
    "lastName": "Perez",
    "roles": ["ACADEMY_MEMBER"]
  }
}
```

---

## 2. Cierre de ceremonia y escritura a Cassandra

Cuando una ceremonia se cierra, los datos operacionales de MongoDB deben desnormalizarse y escribirse en Cassandra para consultas históricas y analíticas.

### `POST /api/ceremonies/:id/close`

Marca la ceremonia como cerrada y dispara la escritura a Cassandra.

**Response (200):**
```json
{
  "data": {
    "ceremonyId": "...",
    "closed": true
  }
}
```

**Lógica interna:**
1. Verificar que la ceremonia existe en MongoDB
2. Verificar que tiene al menos un premio registrado
3. Leer `nominaciones` y `premios` de la ceremonia
4. Escribir en las tablas de Cassandra (ver sección 3)
5. Actualizar algún campo `estado: "CERRADA"` en MongoDB (si se agrega ese campo)

---

## 3. Cassandra — Históricos y Analítica

Cassandra almacena datos desnormalizados diseñados para consultas específicas de solo lectura. No reemplaza a MongoDB — recibe datos cuando se cierra una ceremonia.

### Tablas CQL

```sql
-- Ganadores por ceremonia y categoría
CREATE TABLE IF NOT EXISTS winners_by_ceremony (
  ceremony_id   TEXT,
  category_id   TEXT,
  anio          INT,
  category_name TEXT,
  winner_type   TEXT,         -- "pelicula" | "profesional"
  winner_name   TEXT,
  movie_id      TEXT,
  professional_id TEXT,
  PRIMARY KEY (ceremony_id, category_id)
);

-- Historial de ganadores por categoría ordenado por año
CREATE TABLE IF NOT EXISTS winners_by_category (
  category_id   TEXT,
  anio          INT,
  winner_name   TEXT,
  winner_type   TEXT,
  ceremony_id   TEXT,
  PRIMARY KEY (category_id, anio)
) WITH CLUSTERING ORDER BY (anio DESC);

-- Historial de nominaciones por ceremonia
CREATE TABLE IF NOT EXISTS nominations_by_ceremony (
  ceremony_id     TEXT,
  nomination_id   TEXT,
  category_name   TEXT,
  nominee_name    TEXT,
  nominee_type    TEXT,       -- "pelicula" | "profesional"
  es_ganador      BOOLEAN,
  PRIMARY KEY (ceremony_id, nomination_id)
);

-- Películas más premiadas
CREATE TABLE IF NOT EXISTS movies_by_award_count (
  bucket        TEXT,         -- partición fija: "global"
  award_count   INT,
  movie_id      TEXT,
  titulo        TEXT,
  PRIMARY KEY (bucket, award_count, movie_id)
) WITH CLUSTERING ORDER BY (award_count DESC);

-- Profesionales con más nominaciones
CREATE TABLE IF NOT EXISTS professionals_by_nomination_count (
  bucket            TEXT,
  nomination_count  INT,
  professional_id   TEXT,
  nombre_completo   TEXT,
  PRIMARY KEY (bucket, nomination_count, professional_id)
) WITH CLUSTERING ORDER BY (nomination_count DESC);

-- Profesionales con más premios
CREATE TABLE IF NOT EXISTS professionals_by_award_count (
  bucket          TEXT,
  award_count     INT,
  professional_id TEXT,
  nombre_completo TEXT,
  PRIMARY KEY (bucket, award_count, professional_id)
) WITH CLUSTERING ORDER BY (award_count DESC);
```

### Endpoints históricos (leen de Cassandra)

```
GET /api/history/winners?ceremonyId=&categoryId=
GET /api/history/winners?categoryId=              ← historial completo por categoría
GET /api/history/nominations?ceremonyId=
GET /api/history/movies/top-awarded
GET /api/history/professionals/top-nominated
GET /api/history/professionals/top-awarded
```

### Conexión Cassandra

Instalar driver: `npm install cassandra-driver`

Crear `src/config/db/cassandra.js` siguiendo el mismo patrón de `mongo.js` y `sqlServer.js`.
Agregar variables al `.env`:

```
CASSANDRA_HOST=localhost
CASSANDRA_PORT=9042
CASSANDRA_KEYSPACE=premios_oscar
```

Agregar servicio Cassandra al `docker-compose.yml`:

```yaml
cassandra:
  image: cassandra:4.1
  ports:
    - "9042:9042"
  volumes:
    - cassandra_data:/var/lib/cassandra
  healthcheck:
    test: ["CMD", "cqlsh", "-e", "describe keyspaces"]
    interval: 30s
    timeout: 10s
    retries: 10
```
