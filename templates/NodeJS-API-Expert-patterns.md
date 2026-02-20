# Skill : Architecture Node.js & API REST - Web Dev Strategist Edition

Référence pour le développement de serveurs robustes et d'API scalables avec les meilleures pratiques 2025.

## 1. Standards de Structure

* **Framework :** Priorité à Express.js avec TypeScript
* **Architecture :** Dossier src/ avec séparation claire :
  * controllers/ : Logique de routage et validation des entrées
  * services/ : Logique métier (Business Logic)
  * models/ : Schémas de données et interaction DB
  * middlewares/ : Sécurité, logs, et gestion d'erreurs
  * routes/ : Définition des routes API
  * utils/ : Fonctions utilitaires partagées
  * types/ : Définitions TypeScript

## 2. Sécurité (Best Practices 2025)

* **Validation :** Utiliser Zod pour valider chaque requête entrante
* **Headers :** Utiliser helmet pour sécuriser les headers HTTP
* **Rate Limiting :** Implémenter express-rate-limit sur les routes sensibles
* **CORS :** Configuration CORS stricte avec origins autorisées
* **Environment :** Ne jamais coder de secrets. Utiliser dotenv avec validation

## 3. Gestion d'Erreurs Centralisée

* **Middleware Central :** Un middleware unique pour la gestion des erreurs
* **Error Classes :** Classes d'erreurs personnalisées pour différents types
* **Logging Structuré :** Logs avec Winston ou Pino pour la production
* **Codes HTTP :** Utilisation sémantique des codes HTTP (200, 201, 400, 401, 403, 404, 500)

## 4. Patterns Modernes avec TypeScript

```typescript
// Types d'erreurs personnalisés
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details: any[]) {
    super(message, 400);
  }
}

// Validation avec Zod
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

// Controller typé
export class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await this.userService.create(validatedData);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
```

## 5. Middleware de Sécurité Complet

```typescript
// Helmet configuration
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting with Redis
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const authRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 6. Service Pattern pour la Logique Métier

```typescript
// Service abstrait
export abstract class BaseService<T, CreateT, UpdateT> {
  constructor(protected model: any) {}

  async create(data: CreateT): Promise<T> {
    return await this.model.create({ data });
  }

  async findById(id: number): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    where?: any;
  }): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, where = {} } = options || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit }),
      this.model.count({ where })
    ]);

    return { data, total, page, limit };
  }

  async update(id: number, data: UpdateT): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}

// Service utilisateur spécifique
export class UserService extends BaseService<User, CreateUserInput, UpdateUserInput> {
  constructor() {
    super(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({ where: { email } });
  }

  async createWithHash(userData: CreateUserInput): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await this.model.create({
      data: { ...userData, password: hashedPassword }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
```

## 7. Middleware d'Authentification JWT

```typescript
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Attach user to request
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};
```

## 8. Middleware de Gestion d'Erreurs Centralisé

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let err = { ...error } as AppError;
  err.message = error.message;

  // Log error
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  });

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Resource not found';
    err = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values((error as any).errors).map((val: any) => val.message);
    err = new ValidationError('Validation Error', message as any);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

## 9. Configuration Serveur Robuste

```typescript
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { securityMiddleware } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Trust proxy for load balancers
app.set('trust proxy', 1);

// Compression middleware
app.use(compression());

// Security headers
app.use(securityMiddleware);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

export default app;
```

## 10. Configuration TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/controllers/*": ["controllers/*"],
      "@/services/*": ["services/*"],
      "@/models/*": ["models/*"],
      "@/middleware/*": ["middleware/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 11. Validation Complexe avec Zod

```typescript
// Schémas de validation complexes
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  address: addressSchema.optional(),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean(),
  }).optional(),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return next(new ValidationError('Validation failed', validationErrors));
      }
      next(error);
    }
  };
};
```

## 12. API Documentation with Swagger

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Generated API documentation',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

## 13. Performance & Monitoring

```typescript
// Request monitoring middleware
export const requestMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    
    // Alert on slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
      });
    }
  });
  
  next();
};
```