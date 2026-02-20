# Error Handling Patterns

This template provides patterns for implementing robust error handling in web applications, covering both frontend and backend error management.

## Frontend Error Handling Patterns

### 1. Error Boundaries (React)
```javascript
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
```

### 2. Custom Error Handler Hook
```javascript
// hooks/useErrorHandler.js
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Determine error type and set appropriate message
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error: Unable to reach server';
    } else {
      // Something else happened
      errorMessage = error.message || errorMessage;
    }
    
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, loading, setLoading, handleError, clearError };
}

// Usage in component
function DataFetcher() {
  const { error, loading, setLoading, handleError, clearError } = useErrorHandler();

  const fetchData = async () => {
    setLoading(true);
    clearError();
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Process data
    } catch (err) {
      handleError(err, 'DataFetcher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {loading ? <div>Loading...</div> : <button onClick={fetchData}>Fetch Data</button>}
    </div>
  );
}
```

### 3. Async Error Handling with try/catch Wrapper
```javascript
// utils/asyncHandler.js
export const asyncHandler = (asyncFunc) => {
  return async (...args) => {
    try {
      return await asyncFunc(...args);
    } catch (error) {
      console.error('Async function error:', error);
      throw error; // Re-throw to be handled by caller
    }
  };
};

// Usage
const handleFormSubmit = asyncHandler(async (formData) => {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    throw new Error('Submission failed');
  }
  
  return await response.json();
});
```

### 4. Global Error Context
```javascript
// context/ErrorContext.jsx
import { createContext, useContext, useReducer } from 'react';

const ErrorContext = createContext();

const errorReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, { id: Date.now(), ...action.payload }]
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };
    default:
      return state;
  }
};

export function ErrorProvider({ children }) {
  const [state, dispatch] = useReducer(errorReducer, { errors: [] });

  const addError = (error) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const removeError = (id) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  return (
    <ErrorContext.Provider value={{ errors: state.errors, addError, removeError, clearErrors }}>
      {children}
      <ErrorDisplay />
    </ErrorContext.Provider>
  );
}

function ErrorDisplay() {
  const { errors, removeError } = useErrorContext();

  return (
    <div className="error-display">
      {errors.map(error => (
        <div key={error.id} className={`error-item ${error.severity}`}>
          {error.message}
          <button onClick={() => removeError(error.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

export function useErrorContext() {
  return useContext(ErrorContext);
}
```

## Backend Error Handling Patterns

### 1. Express.js Error Handling Middleware
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', err);

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Send response
  res.status(statusCode).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
```

### 2. Custom Application Errors
```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, fieldErrors = []) {
    super(message, 400);
    this.fieldErrors = fieldErrors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};
```

### 3. Async Error Wrapper for Express Routes
```javascript
// utils/asyncWrapper.js
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;

// Usage in routes
const asyncWrapper = require('../utils/asyncWrapper');

router.get('/users/:id', asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User');
  }
  res.json(user);
}));
```

### 4. Centralized Error Logging
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'web-app' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

## API Error Response Patterns

### 1. Standardized Error Response Format
```javascript
// utils/response.js
const errorResponse = (res, statusCode, message, details = null) => {
  const error = {
    success: false,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
    path: res.req.path
  };

  return res.status(statusCode).json(error);
};

const successResponse = (res, data, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorResponse, successResponse };
```

### 2. Validation Error Handling
```javascript
// middleware/validation.js
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = { handleValidationErrors };
```

## Client-Side API Error Handling

### 1. API Client with Error Handling
```javascript
// services/api.js
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        throw {
          status: response.status,
          message: errorData.message || response.statusText,
          data: errorData
        };
      }
      
      return await response.json();
    } catch (error) {
      // Handle network errors
      if (error.status === undefined) {
        throw {
          status: 0,
          message: 'Network error: Unable to connect to server',
          data: {}
        };
      }
      
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiClient(process.env.REACT_APP_API_URL);
```

### 2. Error Display Components
```javascript
// components/ErrorMessage.jsx
import { useEffect } from 'react';

function ErrorMessage({ error, onClose }) {
  if (!error) return null;

  // Auto-hide error after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-message alert alert-danger" role="alert">
      <div className="error-content">
        <strong>Error:</strong> {error.message}
      </div>
      {onClose && (
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}

// components/FieldError.jsx
function FieldError({ error, fieldName }) {
  if (!error) return null;

  return (
    <div className="field-error" role="alert">
      <small className="text-danger">
        {fieldName}: {error}
      </small>
    </div>
  );
}
```

## Error Recovery Patterns

### 1. Retry Logic
```javascript
// utils/retry.js
export const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        throw error; // Last attempt, re-throw the error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Usage
const fetchWithRetry = () => retry(() => fetch('/api/data'), 3, 1000);
```

### 2. Graceful Degradation
```javascript
// components/FallbackComponent.jsx
function DataComponent({ fallback = <div>Loading...</div> }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.fetchData();
        setData(result);
      } catch (err) {
        setError(err);
        // Still render component with fallback data
        setData(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return fallback;
  if (error && !data) return <ErrorMessage error={error} />;

  return (
    <div>
      {error && <div className="warning">Using cached/fallback data</div>}
      <ActualComponent data={data} />
    </div>
  );
}
```

## Best Practices

### 1. Error Classification
- **Client errors (4xx)**: User input errors, validation failures
- **Server errors (5xx)**: Internal server errors, system failures
- **Network errors**: Connectivity issues, timeouts
- **Application errors**: Business logic failures

### 2. Error Reporting
- Log errors with sufficient context for debugging
- Sanitize sensitive information before logging
- Use structured logging for easier analysis
- Report errors to monitoring services (Sentry, etc.)

### 3. User Experience
- Provide clear, actionable error messages
- Offer recovery options when possible
- Distinguish between temporary and permanent errors
- Maintain application stability despite errors

Following these error handling patterns will help create resilient applications that gracefully handle failures while maintaining good user experience.