const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn("Environment file .env not found. Falling back to process environment variables.");
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || "info",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27018/premios_oscar",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  sql: {
    host: process.env.SQL_SERVER_HOST || "127.0.0.1",
    port: Number(process.env.SQL_SERVER_PORT || 1433),
    user: process.env.SQL_SERVER_USER || "sa",
    password: process.env.SQL_SERVER_PASSWORD || "OscarPass123!",
    database: process.env.SQL_SERVER_DATABASE || "OscarAwards",
    encrypt: process.env.SQL_SERVER_ENCRYPT === "true",
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT !== "false"
  }
};

module.exports = env;
