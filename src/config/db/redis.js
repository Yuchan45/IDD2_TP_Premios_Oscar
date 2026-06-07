const { createClient } = require("redis");
const env = require("../env");
const { logger } = require("../logger");

let client = null;

async function connectRedis() {
  client = createClient({ url: env.redisUrl });

  client.on("error", (err) => {
    logger.error({ err }, "Redis error");
  });

  logger.info({ redisUrl: env.redisUrl }, "Connecting to Redis");
  await client.connect();
  logger.info("Redis connected");
  return client;
}

function getRedisClient() {
  if (!client || !client.isOpen) {
    throw new Error("Redis client is not connected");
  }
  return client;
}

async function disconnectRedis() {
  if (client) {
    logger.info("Disconnecting Redis");
    await client.quit();
    client = null;
    logger.info("Redis disconnected");
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis
};
