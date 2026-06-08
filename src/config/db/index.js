const { connectMongo, disconnectMongo } = require("./mongo");
const { connectSqlServer, disconnectSqlServer } = require("./sqlServer");
const { connectRedis, disconnectRedis } = require("./redis");
const { seedMongo } = require("./seed");

async function connectDatabases() {
  await connectMongo();
  await seedMongo();
  await connectSqlServer();
  await connectRedis();
}

async function disconnectDatabases() {
  await Promise.allSettled([
    disconnectMongo(),
    disconnectSqlServer(),
    disconnectRedis()
  ]);
}

module.exports = {
  connectDatabases,
  disconnectDatabases
};
