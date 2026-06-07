const app = require("./app");
const env = require("./config/env");
const { logger } = require("./config/logger");
const { connectDatabases, disconnectDatabases } = require("./config/db");

let server;

async function start() {
  logger.info({ port: env.port }, "Starting application");
  await connectDatabases();
  server = app.listen(env.port, () => {
    logger.info({ port: env.port }, "Premios Oscar API listening");
  });
}

async function shutdown(signal) {
  logger.info({ signal }, "Shutdown signal received");
  if (server) {
    server.close(async () => {
      await disconnectDatabases();
      logger.info({ signal }, "Application shutdown complete");
      process.exit(0);
    });
    return;
  }

  await disconnectDatabases();
  logger.info({ signal }, "Application shutdown complete");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch(async (error) => {
  logger.error({ err: error }, "Application failed to start");
  await disconnectDatabases();
  process.exit(1);
});
