const { connectMongo, disconnectMongo } = require("./mongo");
const { connectSqlServer, disconnectSqlServer } = require("./sqlServer");
const { connectRedis, disconnectRedis } = require("./redis");
const { connectCassandra, disconnectCassandra } = require("./cassandra");
const { rebuildHistoricalProjections } = require("../../services/history-projection.service");

async function connectDatabases() {
  await connectMongo();
  await connectSqlServer();
  await connectRedis();
  await connectCassandra();
  await rebuildHistoricalProjections();
}

async function disconnectDatabases() {
  await Promise.allSettled([
    disconnectMongo(),
    disconnectSqlServer(),
    disconnectRedis(),
    disconnectCassandra()
  ]);
}

module.exports = {
  connectDatabases,
  disconnectDatabases
};
