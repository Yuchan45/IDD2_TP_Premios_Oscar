const { connectMongo, disconnectMongo } = require("./mongo");
const { connectSqlServer, disconnectSqlServer } = require("./sqlServer");

async function connectDatabases() {
  await connectMongo();
  await connectSqlServer();
}

async function disconnectDatabases() {
  await Promise.allSettled([
    disconnectMongo(),
    disconnectSqlServer()
  ]);
}

module.exports = {
  connectDatabases,
  disconnectDatabases
};
