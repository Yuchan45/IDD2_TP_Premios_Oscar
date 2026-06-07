const mongoose = require("mongoose");
const env = require("../env");
const { logger } = require("../logger");

async function connectMongo() {
  logger.info({ mongoUri: env.mongoUri }, "Connecting to MongoDB");
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected");
  return mongoose.connection;
}

async function disconnectMongo() {
  logger.info("Disconnecting MongoDB");
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

module.exports = {
  connectMongo,
  disconnectMongo
};
