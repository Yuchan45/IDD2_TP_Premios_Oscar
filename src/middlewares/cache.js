const { getRedisClient } = require("../config/db/redis");

function cache(keyPrefix, ttl = 60) {
  return async (req, res, next) => {
    const key = `cache:${keyPrefix}:${req.originalUrl}`;

    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redis.set(key, JSON.stringify(body), { EX: ttl }).catch(() => {});
        return originalJson(body);
      };

      next();
    } catch {
      next();
    }
  };
}

function invalidateCache(keyPrefix) {
  return async () => {
    try {
      const redis = getRedisClient();
      const keys = [];
      for await (const key of redis.scanIterator({ MATCH: `cache:${keyPrefix}:*` })) {
        keys.push(key);
      }
      if (keys.length) await redis.del(keys);
    } catch {
      // Cache invalidation is best-effort
    }
  };
}

module.exports = { cache, invalidateCache };
