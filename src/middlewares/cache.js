const { getRedisClient } = require("../config/db/redis");
const { logger } = require("../config/logger");

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
      const shouldInvalidate = res.statusCode >= 200 && res.statusCode < 400;
      const invalidation = shouldInvalidate ? purgeCacheByPrefix(keyPrefix) : Promise.resolve();

      invalidation
        .catch((err) => {
          logger.warn({ err, keyPrefix }, "Cache invalidation failed");
        })
        .finally(() => {
          originalJson(body);
        });

      return res;
    };

    next();
  };
}

async function purgeCacheByPrefix(keyPrefix) {
  const redis = getRedisClient();
  const keys = [];

  for await (const keyOrKeys of redis.scanIterator({ MATCH: `cache:${keyPrefix}:*` })) {
    if (Array.isArray(keyOrKeys)) {
      keys.push(...keyOrKeys);
    } else {
      keys.push(keyOrKeys);
    }
  }

  if (keys.length) {
    await redis.del(keys);
  }
}

function invalidateCacheNow(keyPrefix) {
  return async () => {
    try {
      await purgeCacheByPrefix(keyPrefix);
    } catch (err) {
      logger.warn({ err, keyPrefix }, "Cache invalidation failed");
    }
  };
}

module.exports = { cache, invalidateCache, invalidateCacheNow };
