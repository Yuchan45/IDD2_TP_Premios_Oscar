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
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      Promise.resolve()
        .then(() => purgeCacheByPrefix(keyPrefix))
        .catch(() => {});

      return originalJson(body);
    };

    next();
  };
}

async function purgeCacheByPrefix(keyPrefix) {
  try {
    const redis = getRedisClient();
    const keys = [];
    for await (const key of redis.scanIterator({ MATCH: `cache:${keyPrefix}:*` })) {
      keys.push(key);
    }

    if (keys.length) {
      await redis.del(keys);
    }
  } catch {
    // Cache invalidation is best-effort
  }
}

function invalidateCacheNow(keyPrefix) {
  return async () => {
    try {
      await purgeCacheByPrefix(keyPrefix);
    } catch {
      // Cache invalidation is best-effort
    }
  };
}

module.exports = { cache, invalidateCache, invalidateCacheNow };
