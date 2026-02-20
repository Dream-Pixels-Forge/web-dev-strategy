# Login Patterns

This template provides patterns for implementing secure login functionality in web applications, covering authentication, session management, and best practices.

## Frontend Login Patterns

### 1. Basic Login Form Component
```javascript
// components/LoginForm.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Send cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token if needed (prefer httpOnly cookies)
      if (data.token) {
        sessionStorage.setItem('authToken', data.token);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.message);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>

      {apiError && (
        <div className="error-message" role="alert">
          {apiError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <div className="form-links">
        <a href="/forgot-password">Forgot password?</a>
        <a href="/signup">Don't have an account? Sign up</a>
      </div>
    </form>
  );
}

export default LoginForm;
```

### 2. Login with Context Provider
```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData.user);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 3. Protected Route Component
```javascript
// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role =>
      user?.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
```

## Backend Login Patterns

### 1. Login Endpoint
```javascript
// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateInput } = require('../middleware/validation');

const router = express.Router();

router.post('/login', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Log failed attempt for security
      await SecurityLog.create({
        type: 'login_failed',
        email,
        reason: 'invalid_password',
        ipAddress: req.ip
      });

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Log successful login
    await SecurityLog.create({
      type: 'login_success',
      userId: user._id,
      ipAddress: req.ip
    });

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date()
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
```

### 2. Input Validation
```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateInput = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = { validateInput };
```

### 3. JWT Verification Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.authToken || 
                req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
```

## Multi-Factor Authentication

### 1. TOTP (Time-based One-Time Password)
```javascript
// services/mfaService.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFAService {
  async generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `MyApp (${email})`,
      issuer: 'MyApp',
      length: 32
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode
    };
  }

  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }

  async enableMFA(userId, secret) {
    return await User.findByIdAndUpdate(userId, {
      mfaEnabled: true,
      mfaSecret: secret,
      backupCodes: this.generateBackupCodes()
    });
  }

  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}

module.exports = new MFAService();
```

### 2. MFA Login Flow
```javascript
// routes/mfa.js
const express = require('express');
const mfaService = require('../services/mfaService');

const router = express.Router();

// Step 1: Verify email/password
router.post('/mfa/verify-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.mfaEnabled) {
      // Generate JWT without 2FA requirement
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ token });
    }

    // Generate temporary session token for MFA
    const tempToken = jwt.sign(
      { id: user._id, mfaPending: true },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({ tempToken, mfaRequired: true });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying credentials' });
  }
});

// Step 2: Verify TOTP
router.post('/mfa/verify-totp', async (req, res) => {
  try {
    const { tempToken, totp } = req.body;

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (!decoded.mfaPending) {
        return res.status(401).json({ message: 'Invalid temp token' });
      }
    } catch (error) {
      return res.status(401).json({ message: 'Temp token expired' });
    }

    const user = await User.findById(decoded.id);
    
    // Verify TOTP or backup code
    const isValid = mfaService.verifyToken(user.mfaSecret, totp) ||
                   user.backupCodes.includes(totp);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid MFA code' });
    }

    // Remove used backup code if applicable
    if (user.backupCodes.includes(totp)) {
      user.backupCodes = user.backupCodes.filter(code => code !== totp);
      await user.save();
    }

    // Generate final token
    const finalToken = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: finalToken });
  } catch (error) {
    res.status(500).json({ message: 'MFA verification failed' });
  }
});

module.exports = router;
```

## Session Management

### 1. Session Handling
```javascript
// middleware/session.js
const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

module.exports = session(sessionConfig);
```

### 2. Logout Endpoint
```javascript
// routes/auth.js
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Delete refresh token
    await RefreshToken.deleteOne({ userId: req.user.id });

    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });

    // Clear cookie
    res.clearCookie('authToken');

    // Log logout
    await SecurityLog.create({
      type: 'logout',
      userId: req.user.id,
      ipAddress: req.ip
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
});
```

## Password Reset

### 1. Password Reset Flow
```javascript
// services/passwordResetService.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class PasswordResetService {
  async requestReset(email) {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists (security)
      return { message: 'If email exists, reset link will be sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store hashed token with expiry
    await PasswordReset.create({
      userId: user._id,
      token: resetTokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await this.sendResetEmail(email, resetUrl);

    return { message: 'Reset link sent to email' };
  }

  async resetPassword(token, newPassword) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const resetRecord = await PasswordReset.findOne({
      token: tokenHash,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.findByIdAndUpdate(resetRecord.userId, {
      passwordHash: hashedPassword,
      passwordChangedAt: new Date()
    });

    // Delete reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    // Log password change
    await SecurityLog.create({
      type: 'password_reset',
      userId: resetRecord.userId
    });
  }

  async sendResetEmail(email, resetUrl) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour</p>
        <p>If you didn't request this, please ignore this email</p>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = new PasswordResetService();
```

## Security Best Practices

### 1. Rate Limiting
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { loginLimiter };
```

### 2. Password Requirements
```javascript
// utils/passwordValidator.js
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validatePassword };
```

## Login Best Practices

1. **HTTPS Only**: Always use HTTPS for login endpoints
2. **httpOnly Cookies**: Store tokens in httpOnly cookies, not localStorage
3. **CSRF Protection**: Implement CSRF tokens for state-changing operations
4. **Rate Limiting**: Limit login attempts to prevent brute force
5. **Account Lockout**: Lock account after multiple failed attempts
6. **Audit Logging**: Log all authentication events
7. **Session Timeout**: Implement idle session timeouts
8. **Secure Passwords**: Require strong passwords with complexity rules
9. **MFA**: Support multi-factor authentication for enhanced security
10. **Token Refresh**: Use refresh tokens for long-lived sessions
11. **Input Validation**: Validate and sanitize all input
12. **Error Messages**: Don't reveal if email exists or password is wrong

Following these login patterns will help create secure, user-friendly authentication systems in web applications.
