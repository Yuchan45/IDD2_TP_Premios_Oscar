const { connectMongo, disconnectMongo } = require("./mongo");
const { connectSqlServer, disconnectSqlServer } = require("./sqlServer");
const { logger } = require("../logger");

async function connectDatabases() {
  logger.info("Connecting databases");
  await connectMongo();
  await connectSqlServer();
  logger.info("All databases connected");
}

async function disconnectDatabases() {
  logger.info("Disconnecting databases");
  await Promise.allSettled([
    disconnectMongo(),
    disconnectSqlServer()
  ]);
  logger.info("Database disconnect flow completed");
}

module.exports = {
  connectDatabases,
  disconnectDatabases
};
