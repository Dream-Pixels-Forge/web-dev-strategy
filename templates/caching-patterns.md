# Caching Patterns

This template provides patterns for implementing caching strategies using Redis, in-memory caching, and cache invalidation techniques.

## Redis Caching Patterns

### 1. Basic Redis Setup
```javascript
// config/redis.js
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

module.exports = client;
```

### 2. Cache Wrapper Function
```javascript
// utils/cache.js
const redis = require('../config/redis');

async function cacheWrapper(key, ttl, fetchFunction) {
  try {
    // Try to get from cache
    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch fresh data
    const data = await fetchFunction();

    // Store in cache
    await redis.setex(key, ttl, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to fetching without cache
    return await fetchFunction();
  }
}

module.exports = { cacheWrapper };
```

### 3. Cache Service
```javascript
// services/cacheService.js
const redis = require('../config/redis');

class CacheService {
  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async delete(key) {
    await redis.del(key);
  }

  async deletePattern(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async exists(key) {
    return await redis.exists(key);
  }

  async increment(key, amount = 1) {
    return await redis.incrby(key, amount);
  }

  async expire(key, ttl) {
    await redis.expire(key, ttl);
  }

  async ttl(key) {
    return await redis.ttl(key);
  }
}

module.exports = new CacheService();
```

## Cache-Aside Pattern

```javascript
// services/userService.js
const cacheService = require('./cacheService');
const { prisma } = require('../lib/prisma');

class UserService {
  async findById(id) {
    const cacheKey = `user:${id}`;

    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });

    if (user) {
      // Store in cache for 1 hour
      await cacheService.set(cacheKey, user, 3600);
    }

    return user;
  }

  async update(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data
    });

    // Invalidate cache
    await cacheService.delete(`user:${id}`);

    return user;
  }
}

module.exports = new UserService();
```

## Write-Through Cache Pattern

```javascript
// services/productService.js
const cacheService = require('./cacheService');
const { prisma } = require('../lib/prisma');

class ProductService {
  async create(data) {
    // Write to database
    const product = await prisma.product.create({ data });

    // Write to cache
    const cacheKey = `product:${product.id}`;
    await cacheService.set(cacheKey, product, 3600);

    return product;
  }

  async update(id, data) {
    // Update database
    const product = await prisma.product.update({
      where: { id },
      data
    });

    // Update cache
    const cacheKey = `product:${id}`;
    await cacheService.set(cacheKey, product, 3600);

    return product;
  }
}

module.exports = new ProductService();
```

## In-Memory Caching

### 1. Simple In-Memory Cache
```javascript
// utils/memoryCache.js
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value, ttl = 3600) {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

module.exports = new MemoryCache();
```

### 2. LRU Cache
```javascript
// utils/lruCache.js
const LRU = require('lru-cache');

const cache = new LRU({
  max: 500, // Maximum items
  maxAge: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true
});

function get(key) {
  return cache.get(key);
}

function set(key, value) {
  cache.set(key, value);
}

function del(key) {
  cache.del(key);
}

module.exports = { get, set, del };
```

## Cache Invalidation Patterns

### 1. Time-Based Invalidation (TTL)
```javascript
// services/postService.js
const cacheService = require('./cacheService');

class PostService {
  async getPopularPosts() {
    const cacheKey = 'posts:popular';
    const ttl = 300; // 5 minutes

    return await cacheService.cacheWrapper(
      cacheKey,
      ttl,
      async () => {
        return await prisma.post.findMany({
          where: { published: true },
          orderBy: { views: 'desc' },
          take: 10
        });
      }
    );
  }
}
```

### 2. Event-Based Invalidation
```javascript
// services/postService.js
const cacheService = require('./cacheService');
const eventEmitter = require('../utils/eventEmitter');

class PostService {
  async create(data) {
    const post = await prisma.post.create({ data });

    // Emit event to invalidate related caches
    eventEmitter.emit('post:created', post);

    return post;
  }

  async update(id, data) {
    const post = await prisma.post.update({
      where: { id },
      data
    });

    // Invalidate specific post cache
    await cacheService.delete(`post:${id}`);

    // Invalidate list caches
    await cacheService.deletePattern('posts:*');

    return post;
  }
}

module.exports = new PostService();
```

### 3. Tag-Based Invalidation
```javascript
// services/cacheService.js
class CacheService {
  async setWithTags(key, value, tags, ttl = 3600) {
    // Store the value
    await redis.setex(key, ttl, JSON.stringify(value));

    // Store tags
    for (const tag of tags) {
      await redis.sadd(`tag:${tag}`, key);
    }
  }

  async invalidateByTag(tag) {
    // Get all keys with this tag
    const keys = await redis.smembers(`tag:${tag}`);

    if (keys.length > 0) {
      // Delete all keys
      await redis.del(...keys);

      // Delete the tag set
      await redis.del(`tag:${tag}`);
    }
  }
}

// Usage
await cacheService.setWithTags(
  'post:123',
  postData,
  ['posts', 'user:456', 'category:tech'],
  3600
);

// Invalidate all posts by user 456
await cacheService.invalidateByTag('user:456');
```

## Caching Middleware

### 1. Express Cache Middleware
```javascript
// middleware/cache.js
const cacheService = require('../services/cacheService');

function cacheMiddleware(duration = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `route:${req.originalUrl}`;

    try {
      const cached = await cacheService.get(key);

      if (cached) {
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method
      res.json = (data) => {
        // Cache the response
        cacheService.set(key, data, duration).catch(console.error);

        // Send response
        originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

// Usage
app.get('/api/posts', cacheMiddleware(300), async (req, res) => {
  const posts = await postService.list();
  res.json(posts);
});

module.exports = cacheMiddleware;
```

### 2. Conditional Caching
```javascript
// middleware/conditionalCache.js
function conditionalCache(options = {}) {
  const { duration = 300, condition } = options;

  return async (req, res, next) => {
    // Check condition
    if (condition && !condition(req)) {
      return next();
    }

    const key = `route:${req.originalUrl}`;
    const cached = await cacheService.get(key);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);

    res.json = (data) => {
      cacheService.set(key, data, duration).catch(console.error);
      originalJson(data);
    };

    next();
  };
}

// Usage - only cache for non-authenticated users
app.get('/api/posts', conditionalCache({
  duration: 300,
  condition: (req) => !req.user
}), handler);
```

## Cache Warming

```javascript
// jobs/cacheWarmer.js
const cacheService = require('../services/cacheService');
const postService = require('../services/postService');

async function warmCache() {
  console.log('Starting cache warming...');

  try {
    // Warm popular posts
    const popularPosts = await postService.getPopularPosts();
    await cacheService.set('posts:popular', popularPosts, 3600);

    // Warm categories
    const categories = await categoryService.list();
    await cacheService.set('categories:all', categories, 7200);

    console.log('Cache warming completed');
  } catch (error) {
    console.error('Cache warming failed:', error);
  }
}

// Run on startup
warmCache();

// Schedule periodic warming
setInterval(warmCache, 1000 * 60 * 30); // Every 30 minutes

module.exports = { warmCache };
```

## Distributed Caching

```javascript
// config/redisCluster.js
const Redis = require('ioredis');

const cluster = new Redis.Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6379 },
  { host: 'redis-node-3', port: 6379 }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  }
});

module.exports = cluster;
```

## Cache Monitoring

```javascript
// utils/cacheMonitor.js
const cacheService = require('../services/cacheService');

class CacheMonitor {
  constructor() {
    this.hits = 0;
    this.misses = 0;
  }

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: hitRate.toFixed(2) + '%'
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
  }
}

module.exports = new CacheMonitor();
```
