const NodeCache = require('node-cache');

const CACHE_CONFIGS = {
  HEALTH: { ttl: 60, maxKeys: 10 },
  USER_DATA: { ttl: 60, maxKeys: 100 },
  PORTFOLIO: { ttl: 120, maxKeys: 50 },
  STRATEGIES: { ttl: 300, maxKeys: 20 },
  TRANSACTIONS: { ttl: 30, maxKeys: 200 },
  STATIC: { ttl: 3600, maxKeys: 10 }
};

class CacheManager {
  constructor() {
    this.caches = {};
    this.initializeCaches();
  }

  initializeCaches() {
    for (const [key, config] of Object.entries(CACHE_CONFIGS)) {
      this.caches[key] = new NodeCache({
        stdTTL: config.ttl,
        checkperiod: 60,
        useClones: false,
        maxKeys: config.maxKeys
      });
    }
  }

  get(cacheName, key) {
    return this.caches[cacheName]?.get(key);
  }

  set(cacheName, key, value) {
    return this.caches[cacheName]?.set(key, value);
  }

  invalidatePattern(cacheName, pattern) {
    const cache = this.caches[cacheName];
    if (!cache) return;
    
    const keys = cache.keys();
    for (const key of keys) {
      if (pattern.test(key)) {
        cache.del(key);
      }
    }
  }

  invalidateUser(userId) {
    this.invalidatePattern('USER_DATA', new RegExp(userId));
    this.invalidatePattern('PORTFOLIO', new RegExp(userId));
    this.invalidatePattern('TRANSACTIONS', new RegExp(userId));
  }

  clearAll() {
    Object.values(this.caches).forEach(cache => cache.flushAll());
  }
}

const cacheManager = new CacheManager();

const createCacheMiddleware = (cacheName, options = {}) => {
  return (req, res, next) => {
    const cacheKey = req.originalUrl;
    const cached = cacheManager.get(cacheName, cacheKey);
    
    if (cached && !options.force) {
      return res.json(cached);
    }

    res.locals.cacheManager = cacheManager;
    res.locals.cacheName = cacheName;
    res.locals.cacheKey = cacheKey;
    
    next();
  };
};

const cacheResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (res.locals.cacheName && res.locals.cacheKey) {
      cacheManager.set(res.locals.cacheName, res.locals.cacheKey, data);
    }
    originalJson.call(this, data);
  };
  
  next();
};

const cacheMiddleware = (duration = 300) => {
  const cacheName = Object.keys(CACHE_CONFIGS).find(
    key => CACHE_CONFIGS[key].ttl === duration
  ) || 'STATIC';
  
  return createCacheMiddleware(cacheName);
};

module.exports = {
  cacheManager,
  createCacheMiddleware,
  cacheResponse,
  cacheMiddleware,
  CACHE_CONFIGS
};
