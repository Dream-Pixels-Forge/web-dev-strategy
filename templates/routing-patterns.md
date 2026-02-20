# Routing Patterns

This template provides patterns for implementing navigation and routing in web applications, covering both frontend and backend routing concepts.

## Frontend Routing Patterns

### 1. Basic React Router Setup
```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

### 2. Nested Routing Pattern
```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';

// Layout component for nested routes
function DashboardLayout() {
  return (
    <div>
      <header>Dashboard Header</header>
      <nav>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/profile">Profile</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <main>
        <Outlet /> {/* Renders child routes */}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3. Protected Routes
```javascript
// context/AuthContext.js (useAuth hook definition)
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some(role => user.roles?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### 4. Route Parameters and Query Strings
```javascript
// UserProfile.jsx
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams(); // /users/:userId
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tab = searchParams.get('tab') || 'overview';
  const page = parseInt(searchParams.get('page')) || 1;

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab, page });
  };

  const handlePagination = (newPage) => {
    setSearchParams({ tab, page: newPage });
  };

  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <div>
        <button onClick={() => handleTabChange('overview')}>Overview</button>
        <button onClick={() => handleTabChange('settings')}>Settings</button>
      </div>
      <div>Current Tab: {tab}, Page: {page}</div>
    </div>
  );
}
```

### 5. Programmatic Navigation
```javascript
// components/UserForm.jsx
import { useNavigate, useLocation } from 'react-router-dom';

// API client
const api = {
  createUser: async (userData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response;
  }
};

function UserForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (userData) => {
    try {
      const response = await api.createUser(userData);
      if (response.ok) {
        // Navigate to success page with state
        navigate('/success', { 
          state: { message: 'User created successfully!' },
          replace: true // Replace history entry instead of pushing
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCancel = () => {
    // Go back to previous page
    navigate(-1);
    
    // Or navigate to specific route
    // navigate('/users');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {/* Form fields */}
      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
  );
}
```

## Backend Routing Patterns

### 1. Express.js REST API Routes
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

// GET /api/users - Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
```

### 2. Route Organization
```javascript
// app.js
const express = require('express');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
```

### 3. Parameter Validation Middleware
```javascript
// middleware/validation.js
const { param, validationResult } = require('express-validator');

const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// routes/users.js (Usage example)
const { validateUserId } = require('../middleware/validation');

router.get('/:id', authenticateToken, validateUserId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = { validateUserId };
```

## Advanced Routing Patterns

### 1. Dynamic Route Matching
```javascript
// Dynamic catch-all routes for SPAs
<Route path="/dashboard/*" element={<DashboardApp />} />
<Route path="/admin/*" element={<AdminApp />} />

// This allows client-side routing within these sections
```

### 2. Route Guards with Custom Hooks
```javascript
// hooks/useRouteGuard.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useAuthGuard = (conditionFn, redirectTo = '/login') => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only navigate once and only when loading is complete
    if (loading || hasNavigated.current) {
      return;
    }

    try {
      const shouldRedirect = conditionFn && conditionFn(user);
      if (shouldRedirect && !hasNavigated.current) {
        hasNavigated.current = true;
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Route guard error:', error);
    }
  }, [user, loading, navigate, redirectTo, conditionFn]);

  return { loading };
};

// Usage in component
function LoginPage() {
  const { loading } = useAuthGuard(
    (user) => user, // Redirect if user is already logged in
    '/dashboard'
  );

  if (loading) return <div>Loading...</div>;

  return <LoginForm />;
}
```

### 3. Route-Based Code Splitting
```javascript
// Lazy loading routes
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Suspense fallback={<div>Loading home...</div>}>
            <HomePage />
          </Suspense>
        } 
      />
      <Route 
        path="/about" 
        element={
          <Suspense fallback={<div>Loading about...</div>}>
            <AboutPage />
          </Suspense>
        } 
      />
      <Route 
        path="/dashboard/*" 
        element={
          <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardRoutes />
          </Suspense>
        } 
      />
    </Routes>
  );
}
```

## URL Structure Best Practices

### 1. RESTful URL Patterns
```
GET    /api/users          # Get all users
GET    /api/users/123      # Get user with ID 123
POST   /api/users          # Create new user
PUT    /api/users/123      # Update user with ID 123
DELETE /api/users/123      # Delete user with ID 123
```

### 2. Nested Resource Patterns
```
GET    /api/users/123/posts     # Get posts for user 123
POST   /api/users/123/posts     # Create post for user 123
GET    /api/users/123/posts/456 # Get post 456 for user 123
```

### 3. Query Parameter Patterns
```
GET /api/users?role=admin&page=1&limit=10
GET /api/products?category=electronics&sort=price&order=asc
GET /api/search?q=javascript&type=tutorial
```

Following these routing patterns will help create maintainable, intuitive navigation systems in web applications.