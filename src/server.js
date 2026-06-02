const app = require("./app");
const env = require("./config/env");
const { connectDatabases, disconnectDatabases } = require("./config/db");

let server;

async function start() {
  await connectDatabases();
  server = app.listen(env.port, () => {
    console.log(`Premios Oscar API listening on port ${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  if (server) {
    server.close(async () => {
      await disconnectDatabases();
      process.exit(0);
    });
    return;
  }

  await disconnectDatabases();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch(async (error) => {
  console.error("Application failed to start:", error);
  await disconnectDatabases();
  process.exit(1);
});
