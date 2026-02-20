# Middleware Patterns

This template provides patterns for implementing middleware in Express.js applications, including authentication, logging, validation, and error handling.

## Authentication Middleware

### 1. JWT Authentication
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
```

### 2. Role-Based Authorization
```javascript
// middleware/authorize.js
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasRole = allowedRoles.some(role => req.user.roles?.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
app.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

module.exports = authorize;
```

### 3. API Key Authentication
```javascript
// middleware/apiKey.js
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  next();
}

module.exports = validateApiKey;
```

## Validation Middleware

### 1. Request Body Validation
```javascript
// middleware/validate.js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({ errors });
    }

    req.body = value;
    next();
  };
}

// Usage with Joi
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(18).optional()
});

app.post('/users', validate(userSchema), (req, res) => {
  // req.body is validated
});

module.exports = validate;
```

### 2. Query Parameter Validation
```javascript
// middleware/validateQuery.js
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json({
        message: 'Invalid query parameters',
        errors: error.details.map(d => d.message)
      });
    }

    req.query = value;
    next();
  };
}

module.exports = validateQuery;
```

## Logging Middleware

### 1. Request Logger
```javascript
// middleware/logger.js
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}

module.exports = requestLogger;
```

### 2. Morgan Logger
```javascript
// middleware/logger.js
const morgan = require('morgan');

// Custom token for user ID
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

// Custom format
const logFormat = ':method :url :status :response-time ms - :user-id';

const logger = morgan(logFormat, {
  skip: (req) => req.url === '/health'
});

module.exports = logger;
```

## Rate Limiting Middleware

### 1. Express Rate Limit
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

module.exports = { limiter, authLimiter };
```

### 2. Custom Rate Limiter with Redis
```javascript
// middleware/redisRateLimiter.js
const redis = require('redis');
const client = redis.createClient();

async function rateLimiter(req, res, next) {
  const key = `rate_limit:${req.ip}`;
  const limit = 100;
  const window = 60; // seconds

  try {
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, window);
    }

    if (current > limit) {
      return res.status(429).json({
        message: 'Rate limit exceeded',
        retryAfter: await client.ttl(key)
      });
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - current);

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(); // Fail open
  }
}

module.exports = rateLimiter;
```

## Error Handling Middleware

### 1. Global Error Handler
```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
```

### 2. Async Error Wrapper
```javascript
// middleware/asyncHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

module.exports = asyncHandler;
```

## CORS Middleware

```javascript
// middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
```

## Request Parsing Middleware

```javascript
// middleware/parsers.js
const express = require('express');

function setupParsers(app) {
  // JSON body parser
  app.use(express.json({ limit: '10mb' }));

  // URL-encoded body parser
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
}

module.exports = setupParsers;
```

## Security Middleware

### 1. Helmet for Security Headers
```javascript
// middleware/security.js
const helmet = require('helmet');

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = securityMiddleware;
```

### 2. Input Sanitization
```javascript
// middleware/sanitize.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

function sanitizeMiddleware(app) {
  // Prevent NoSQL injection
  app.use(mongoSanitize());

  // Prevent XSS attacks
  app.use(xss());
}

module.exports = sanitizeMiddleware;
```

## Caching Middleware

```javascript
// middleware/cache.js
function cache(duration) {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    // Check cache (pseudo-code, use Redis in production)
    const cached = getCachedData(key);

    if (cached) {
      return res.json(cached);
    }

    // Store original send function
    const originalSend = res.json.bind(res);

    // Override send function
    res.json = (data) => {
      setCachedData(key, data, duration);
      originalSend(data);
    };

    next();
  };
}

module.exports = cache;
```

## Request ID Middleware

```javascript
// middleware/requestId.js
const { v4: uuidv4 } = require('uuid');

function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
}

module.exports = requestId;
```

## Compression Middleware

```javascript
// middleware/compression.js
const compression = require('compression');

const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
});

module.exports = compressionMiddleware;
```

## Complete Middleware Setup

```javascript
// app.js
const express = require('express');
const app = express();

// Security
const helmet = require('./middleware/security');
const cors = require('./middleware/cors');
const { sanitizeMiddleware } = require('./middleware/sanitize');

// Parsing
const setupParsers = require('./middleware/parsers');

// Logging
const logger = require('./middleware/logger');
const requestId = require('./middleware/requestId');

// Rate limiting
const { limiter } = require('./middleware/rateLimiter');

// Compression
const compression = require('./middleware/compression');

// Error handling
const errorHandler = require('./middleware/errorHandler');

// Apply middleware in order
app.use(helmet);
app.use(cors);
app.use(compression);
app.use(requestId);
app.use(logger);
setupParsers(app);
sanitizeMiddleware(app);
app.use(limiter);

// Routes
app.use('/api', require('./routes'));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
```
