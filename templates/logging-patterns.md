# Logging Patterns

This template provides patterns for implementing structured logging, log levels, and monitoring integration in Node.js applications.

## Winston Logger Setup

### 1. Basic Winston Configuration
```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-service' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### 2. Advanced Winston Configuration
```javascript
// config/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Combined logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  }));
}

module.exports = logger;
```

## Pino Logger Setup

### 1. Basic Pino Configuration
```javascript
// config/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

module.exports = logger;
```

### 2. Advanced Pino Configuration
```javascript
// config/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.remoteAddress
    }),
    res: (res) => ({
      statusCode: res.statusCode
    }),
    err: pino.stdSerializers.err
  }
});

module.exports = logger;
```

## Structured Logging Patterns

### 1. Request Logging Middleware
```javascript
// middleware/requestLogger.js
const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });
  });

  next();
}

module.exports = requestLogger;
```

### 2. Error Logging
```javascript
// middleware/errorLogger.js
const logger = require('../config/logger');

function errorLogger(err, req, res, next) {
  logger.error('Error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      userId: req.user?.id
    }
  });

  next(err);
}

module.exports = errorLogger;
```

### 3. Database Query Logging
```javascript
// utils/dbLogger.js
const logger = require('../config/logger');

function logQuery(query, params, duration) {
  logger.debug('Database query executed', {
    query,
    params,
    duration: `${duration}ms`
  });
}

// Usage with Prisma
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    }
  ]
});

prisma.$on('query', (e) => {
  logger.debug('Prisma query', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`
  });
});
```

## Log Levels and Usage

```javascript
const logger = require('./config/logger');

// Error - Critical errors that need immediate attention
logger.error('Database connection failed', {
  error: error.message,
  host: dbConfig.host
});

// Warn - Warning messages for potentially harmful situations
logger.warn('API rate limit approaching', {
  userId: user.id,
  requestCount: count,
  limit: rateLimit
});

// Info - Informational messages about application progress
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip
});

// Debug - Detailed information for debugging
logger.debug('Cache hit', {
  key: cacheKey,
  ttl: ttl
});

// Verbose - Very detailed information
logger.verbose('Processing item', {
  itemId: item.id,
  step: 'validation'
});
```

## Context-Aware Logging

### 1. Request Context Logger
```javascript
// middleware/contextLogger.js
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

function contextLogger(req, res, next) {
  const requestId = uuidv4();
  req.requestId = requestId;

  // Create child logger with context
  req.logger = logger.child({
    requestId,
    userId: req.user?.id,
    method: req.method,
    url: req.url
  });

  next();
}

// Usage in routes
app.get('/users', (req, res) => {
  req.logger.info('Fetching users');
  // All logs will include requestId, userId, method, url
});

module.exports = contextLogger;
```

### 2. User Context Logger
```javascript
// utils/userLogger.js
const logger = require('../config/logger');

class UserLogger {
  constructor(userId) {
    this.logger = logger.child({ userId });
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }
}

// Usage
const userLogger = new UserLogger(user.id);
userLogger.info('User action performed', { action: 'profile_update' });
```

## Performance Logging

```javascript
// utils/performanceLogger.js
const logger = require('../config/logger');

class PerformanceLogger {
  static startTimer(label) {
    return {
      label,
      start: Date.now()
    };
  }

  static endTimer(timer, metadata = {}) {
    const duration = Date.now() - timer.start;

    logger.info('Performance metric', {
      label: timer.label,
      duration: `${duration}ms`,
      ...metadata
    });

    return duration;
  }

  static async measureAsync(label, fn, metadata = {}) {
    const timer = this.startTimer(label);

    try {
      const result = await fn();
      this.endTimer(timer, { ...metadata, status: 'success' });
      return result;
    } catch (error) {
      this.endTimer(timer, { ...metadata, status: 'error', error: error.message });
      throw error;
    }
  }
}

// Usage
const timer = PerformanceLogger.startTimer('database_query');
const users = await User.find();
PerformanceLogger.endTimer(timer, { count: users.length });

// Or with async wrapper
const users = await PerformanceLogger.measureAsync(
  'fetch_users',
  async () => await User.find(),
  { operation: 'read' }
);
```

## Security Logging

```javascript
// utils/securityLogger.js
const logger = require('../config/logger');

class SecurityLogger {
  static logAuthAttempt(success, email, ip, reason = null) {
    logger.info('Authentication attempt', {
      type: 'auth',
      success,
      email,
      ip,
      reason,
      timestamp: new Date()
    });
  }

  static logAuthFailure(email, ip, reason) {
    logger.warn('Authentication failed', {
      type: 'auth_failure',
      email,
      ip,
      reason,
      timestamp: new Date()
    });
  }

  static logSuspiciousActivity(userId, activity, metadata = {}) {
    logger.warn('Suspicious activity detected', {
      type: 'security',
      userId,
      activity,
      ...metadata,
      timestamp: new Date()
    });
  }

  static logAccessDenied(userId, resource, action) {
    logger.warn('Access denied', {
      type: 'access_denied',
      userId,
      resource,
      action,
      timestamp: new Date()
    });
  }
}

module.exports = SecurityLogger;
```

## Log Aggregation and Monitoring

### 1. CloudWatch Integration
```javascript
// config/cloudwatchLogger.js
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
      logStreamName: process.env.CLOUDWATCH_STREAM_NAME,
      awsRegion: process.env.AWS_REGION,
      jsonMessage: true
    })
  ]
});

module.exports = logger;
```

### 2. Elasticsearch Integration
```javascript
// config/elasticsearchLogger.js
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD
    }
  },
  index: 'logs'
};

const logger = winston.createLogger({
  transports: [
    new ElasticsearchTransport(esTransportOpts)
  ]
});

module.exports = logger;
```

## Log Sanitization

```javascript
// utils/logSanitizer.js
function sanitizeLog(data) {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLog(sanitized[key]);
    }
  }

  return sanitized;
}

// Usage
logger.info('User data', sanitizeLog(userData));
```

## Audit Logging

```javascript
// services/auditLogger.js
const logger = require('../config/logger');

class AuditLogger {
  static log(action, userId, resource, metadata = {}) {
    logger.info('Audit log', {
      type: 'audit',
      action,
      userId,
      resource,
      timestamp: new Date(),
      ...metadata
    });
  }

  static logCreate(userId, resource, data) {
    this.log('CREATE', userId, resource, { data });
  }

  static logUpdate(userId, resource, changes) {
    this.log('UPDATE', userId, resource, { changes });
  }

  static logDelete(userId, resource, id) {
    this.log('DELETE', userId, resource, { id });
  }

  static logAccess(userId, resource, action) {
    this.log('ACCESS', userId, resource, { action });
  }
}

module.exports = AuditLogger;
```
