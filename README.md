# Premios Oscar API

Backend del sistema de Premios Oscar. Expone la API REST, aplica la logica de negocio y coordina las bases de datos del proyecto.

## Stack

- Node.js
- Express
- MongoDB
- SQL Server
- Redis
- Cassandra

## Responsabilidad de cada base

- MongoDB:
  - peliculas
  - profesionales
  - categorias
  - ceremonias
  - votos
- SQL Server:
  - usuarios
  - roles
  - auditoria
- Redis:
  - sesiones
  - locks de concurrencia para votacion
  - flags de ceremonia cerrada
- Cassandra:
  - historicos y reportes

## Funcionalidades principales

- autenticacion por token con sesiones en Redis
- gestion de usuarios y roles
- CRUD de peliculas, profesionales, categorias y ceremonias
- gestion de actuaciones musicales
- alta, edicion y borrado de nominaciones
- votacion para usuarios `ACADEMY_MEMBER`
- cierre de ceremonia con calculo de ganadores
- auditoria de acciones
- historicos y rankings sobre Cassandra

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
  validations/
  utils/
scripts/
docker-compose.yml
```

Flujo general:

```text
routes -> controllers -> services -> repositories -> models / db config
```

## Requisitos previos

- Node.js 20 o superior
- npm
- Docker Desktop o Docker Engine con Docker Compose

## Puertos utilizados

- API: `http://localhost:8000`
- MongoDB: `localhost:27018`
- SQL Server: `localhost:1433`
- Redis: `localhost:6379`
- Cassandra: `localhost:9042`

## Levantar el proyecto

Los pasos correctos son estos. El orden importa.

### 1. Entrar a la carpeta del backend

```bash
cd TP_Premios_Oscar_Back
```

### 2. Crear el archivo de entorno

Si no existe `.env`, crear uno a partir de `.env.example`.

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

En Git Bash:

```bash
cp .env.example .env
```

Importante:

- el front del proyecto apunta por defecto a `http://localhost:8000/api`
- por eso el backend debe levantarse en `PORT=8000`

Verificar en `.env`:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27018/premios_oscar
REDIS_URL=redis://127.0.0.1:6379
SQL_SERVER_HOST=127.0.0.1
SQL_SERVER_PORT=1433
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=OscarPass123!
SQL_SERVER_DATABASE=OscarAwards
SQL_SERVER_ENCRYPT=false
SQL_SERVER_TRUST_CERT=true
```

Las variables de Cassandra tienen fallback por defecto en codigo:

- `CASSANDRA_HOST=127.0.0.1`
- `CASSANDRA_PORT=9042`
- `CASSANDRA_KEYSPACE=premios_oscar`
- `CASSANDRA_DATACENTER=datacenter1`

### 3. Levantar infraestructura con Docker

```bash
docker compose up -d
```

Esto levanta:

- `oscar_sqlserver`
- `oscar_mongodb`
- `oscar_redis`
- `oscar_cassandra`

### 4. Instalar dependencias del backend

```bash
npm install
```

### 5. Levantar la API

```bash
npm run dev
```

### 6. Verificar que haya quedado operativa

Healthcheck:

```bash
curl http://localhost:8000/health
```

Respuesta esperada:

```json
{
  "data": {
    "status": "ok",
    "service": "premios-oscar-api"
  }
}
```

## Que ocurre al iniciar el backend

Al arrancar la aplicacion:

- se conecta a MongoDB
- se ejecutan seeds de:
  - categorias
  - profesionales
  - peliculas
  - ceremonias
- se conecta a SQL Server
- crea esquema si no existe para:
  - `rol`
  - `usuario`
  - `auditoria`
- crea usuarios de prueba si faltan
- se conecta a Redis
- se conecta a Cassandra
- crea keyspace y tablas historicas si no existen
- reconstruye proyecciones historicas desde ceremonias cerradas

Punto importante:

- los seeds se ejecutan al arrancar el backend
- `docker compose up -d` solo levanta la infraestructura
- si queres reaplicar seeds, tenes que reiniciar el backend

## Usuarios de prueba

Password para todos: `asd123`

- `admin@oscar.com` -> `ADMIN`
- `miembro@oscar.com` -> `ACADEMY_MEMBER`
- `miembro2@oscar.com` -> `ACADEMY_MEMBER`
- `miembro3@oscar.com` -> `ACADEMY_MEMBER`
- `usuario@oscar.com` -> `COMMON_USER`
- `usuario2@oscar.com` -> `COMMON_USER`
- `usuario3@oscar.com` -> `COMMON_USER`

## Endpoints principales

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `/api/users`
- `/api/movies`
- `/api/categories`
- `/api/professionals`
- `/api/ceremonies`
- `/api/votes`
- `/api/audit`
- `/api/history`

## Reseteo completo del entorno

Si queres borrar todos los datos de Docker y volver a empezar:

```bash
docker compose down -v --remove-orphans
docker compose up -d
npm run dev
```

Con eso:

- se borran los volumenes de MongoDB, SQL Server, Redis y Cassandra
- se levantan de nuevo vacios
- al reiniciar el backend se recrean esquema, usuarios y seeds

## Notas utiles

- La votacion funcional real se guarda en MongoDB, en la coleccion `votos`.
- SQL Server no guarda votos; se usa para usuarios, roles y auditoria.
- Si el front no puede loguearse, verificar que el backend este realmente en `http://localhost:8000`.
- Si hay una cookie de sesion vieja en el navegador, el middleware del front la limpia automaticamente si ya no es valida.
