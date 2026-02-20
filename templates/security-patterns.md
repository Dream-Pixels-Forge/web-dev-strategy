# Security Patterns

This template provides patterns for implementing security best practices in web applications, covering frontend, backend, authentication, and data protection.

## Frontend Security Patterns

### 1. XSS (Cross-Site Scripting) Prevention
```javascript
// React automatically escapes text content
function SafeComponent({ userInput }) {
  return (
    <div>
      {/* Safe - React escapes this */}
      <p>{userInput}</p>
      
      {/* Unsafe - only use with trusted HTML */}
      {/* <div dangerouslySetInnerHTML={{ __html: userInput }} /> */}
    </div>
  );
}

// Safe HTML rendering with sanitization
import DOMPurify from 'dompurify';

function SanitizedHTML({ html }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// Prevent XSS in attributes
function SafeLink({ url, text }) {
  // Validate URL before using
  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(url)) {
    return <span>{text}</span>;
  }

  return <a href={url}>{text}</a>;
}
```

### 2. CSRF (Cross-Site Request Forgery) Prevention
```javascript
// Include CSRF token in forms
function LoginForm() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Get CSRF token from meta tag or API
    const token = document.querySelector('meta[name="csrf-token"]')?.content;
    setCsrfToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken // Include CSRF token in header
      },
      body: JSON.stringify({ /* form data */ })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {/* form fields */}
    </form>
  );
}
```

### 3. Secure Data Storage
```javascript
// Never store sensitive data in localStorage
// Use httpOnly cookies for authentication tokens (handled by server)

// Use sessionStorage for temporary non-sensitive data
function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading sessionStorage:', error);
      return initialValue;
    }
  });

  const setStoredValue = (val) => {
    try {
      const valueToStore = val instanceof Function ? val(value) : val;
      setValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
  };

  return [value, setStoredValue];
}

// Encrypt sensitive data before storage if necessary
import CryptoJS from 'crypto-js';

const encryptSensitiveData = (data, secret) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
};

const decryptSensitiveData = (encrypted, secret) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, secret);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

### 4. Content Security Policy (CSP)
```html
<!-- Add to HTML head -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
">
```

## Backend Security Patterns

### 1. Input Validation and Sanitization
```javascript
// middleware/validation.js
const { body, param, validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Apply sanitization middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// Validate and sanitize inputs
const validateUserInput = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateUserInput };
```

### 2. Authentication and Password Security
```javascript
// utils/password.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate secure random token
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('../utils/password');

const router = express.Router();

router.post('/register', validateUserInput, async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      username,
      passwordHash: hashedPassword
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});
```

### 3. Rate Limiting and Brute Force Protection
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Login attempt rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

// Password reset rate limiter
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.'
});

module.exports = { apiLimiter, loginLimiter, resetLimiter };
```

### 4. Authorization and RBAC
```javascript
// middleware/authorization.js
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = userRoles.some(role => 
      allowedRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    next();
  };
};

// Usage in routes
router.delete(
  '/api/users/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    // Admin-only route
  }
);
```

## Data Protection Patterns

### 1. Encryption at Rest
```javascript
// utils/encryption.js
const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encryptData = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag.toString('hex')
  };
};

const decryptData = (encrypted) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    encryptionKey,
    Buffer.from(encrypted.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};

module.exports = { encryptData, decryptData };
```

### 2. Secure Communication
```javascript
// Enable HTTPS only
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);

// Security headers middleware
const helmet = require('helmet');
app.use(helmet());

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Security Best Practices

### 1. Environment Variables
```javascript
// .env file (never commit to version control)
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=hex-encoded-key
NODE_ENV=production
API_RATE_LIMIT=100

// Access in code
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
```

### 2. CORS Configuration
```javascript
// Configure CORS properly
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### 3. SQL Injection Prevention
```javascript
// Use parameterized queries
// Bad - vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Good - parameterized
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.query(query, [email]);

// With ORMs (Sequelize, TypeORM)
const user = await User.findOne({ where: { email: email } });
```

### 4. NoSQL Injection Prevention
```javascript
// Bad - vulnerable to NoSQL injection
const user = await User.findOne({ email: userInput });

// Good - validate and sanitize
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// Or manually sanitize
const sanitizeInput = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/\$/g, '');
    }
  }
  return obj;
};
```

### 5. Logging and Monitoring
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Never log sensitive information
const secureLog = (action, details) => {
  const safeDetails = { ...details };
  delete safeDetails.password;
  delete safeDetails.token;
  delete safeDetails.creditCard;
  
  logger.info(`${action}:`, safeDetails);
};

// Usage
secureLog('User login', { userId: user.id, email: user.email });
```

## Security Checklist

### Frontend Security
- [ ] Escape all user input before rendering
- [ ] Use Content Security Policy headers
- [ ] Keep dependencies updated
- [ ] Use HTTPS for all communications
- [ ] Never store sensitive data in localStorage
- [ ] Implement CSRF protection
- [ ] Validate input on client-side (for UX)
- [ ] Use security headers (X-Frame-Options, X-Content-Type-Options, etc.)

### Backend Security
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries for databases
- [ ] Implement rate limiting
- [ ] Use strong password hashing (bcrypt, argon2)
- [ ] Implement proper authentication and authorization
- [ ] Use HTTPS/TLS for all communications
- [ ] Implement proper error handling (don't leak sensitive info)
- [ ] Log security events
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement CORS properly
- [ ] Use httpOnly and secure cookies

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use TLS/SSL for data in transit
- [ ] Implement proper access controls
- [ ] Regular security audits
- [ ] Implement data retention policies
- [ ] Ensure GDPR/privacy compliance

Following these security patterns will help create applications that are resistant to common attacks and vulnerabilities.
