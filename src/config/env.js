require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27018/premios_oscar",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  sql: {
    host: process.env.SQL_SERVER_HOST || "localhost",
    port: Number(process.env.SQL_SERVER_PORT || 1433),
    user: process.env.SQL_SERVER_USER || "sa",
    password: process.env.SQL_SERVER_PASSWORD || "OscarPass123!",
    database: process.env.SQL_SERVER_DATABASE || "OscarAwards",
    encrypt: process.env.SQL_SERVER_ENCRYPT === "true",
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT !== "false"
  }
};

module.exports = env;
