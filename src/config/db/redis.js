const { createClient } = require("redis");
const env = require("../env");

let client = null;

async function connectRedis() {
  client = createClient({ url: env.redisUrl });

  client.on("error", (err) => console.error("Redis error:", err));

  await client.connect();
  console.log("Redis connected");
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
    await client.quit();
    client = null;
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis
};
