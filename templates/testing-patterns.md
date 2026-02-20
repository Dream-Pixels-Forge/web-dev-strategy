# Testing Patterns

This template provides patterns for testing JavaScript/TypeScript applications using Jest, Vitest, and other testing frameworks.

## Unit Testing Patterns

### 1. Basic Jest Test
```javascript
// __tests__/utils/math.test.js
const { add, subtract, multiply } = require('../../utils/math');

describe('Math utilities', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(add(-2, 3)).toBe(1);
    });

    it('should return 0 when adding 0', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });
  });
});
```

### 2. Testing Async Functions
```javascript
// __tests__/services/userService.test.js
const userService = require('../../services/userService');

describe('UserService', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      const user = await userService.findById('123');
      expect(user).toBeDefined();
      expect(user.id).toBe('123');
    });

    it('should return null when user not found', async () => {
      const user = await userService.findById('nonexistent');
      expect(user).toBeNull();
    });

    it('should throw error on invalid id', async () => {
      await expect(userService.findById(null))
        .rejects
        .toThrow('Invalid user ID');
    });
  });
});
```

### 3. Testing React Components
```javascript
// __tests__/components/LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

## Mocking Patterns

### 1. Mocking Functions
```javascript
// __tests__/services/orderService.test.js
const orderService = require('../../services/orderService');
const emailService = require('../../services/emailService');

jest.mock('../../services/emailService');

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send confirmation email after order creation', async () => {
    emailService.sendOrderConfirmation.mockResolvedValue(true);

    const order = await orderService.createOrder({
      userId: '123',
      items: [{ productId: '456', quantity: 2 }]
    });

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: order.id,
        userId: '123'
      })
    );
  });
});
```

### 2. Mocking Modules
```javascript
// __tests__/api/users.test.js
jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

const { prisma } = require('../../lib/prisma');
const userService = require('../../services/userService');

describe('User API', () => {
  it('should fetch all users', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@example.com' },
      { id: 2, email: 'user2@example.com' }
    ];

    prisma.user.findMany.mockResolvedValue(mockUsers);

    const users = await userService.list();
    expect(users).toEqual(mockUsers);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Mocking Fetch/Axios
```javascript
// __tests__/api/external.test.js
global.fetch = jest.fn();

describe('External API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should fetch data from external API', async () => {
    const mockData = { id: 1, name: 'Test' };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchExternalData();

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data');
    expect(result).toEqual(mockData);
  });

  it('should handle API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(fetchExternalData()).rejects.toThrow('API request failed');
  });
});
```

## Integration Testing Patterns

### 1. API Integration Tests
```javascript
// __tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../lib/prisma');

describe('Auth API Integration', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### 2. Database Integration Tests
```javascript
// __tests__/integration/userRepository.test.js
const { prisma } = require('../../lib/prisma');
const userRepository = require('../../repositories/userRepository');

describe('UserRepository Integration', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create and retrieve user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password'
    };

    const created = await userRepository.create(userData);
    expect(created.id).toBeDefined();

    const retrieved = await userRepository.findById(created.id);
    expect(retrieved.email).toBe(userData.email);
    expect(retrieved.name).toBe(userData.name);
  });

  it('should update user', async () => {
    const user = await userRepository.create({
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password'
    });

    const updated = await userRepository.update(user.id, {
      name: 'Updated Name'
    });

    expect(updated.name).toBe('Updated Name');
  });
});
```

## Test Fixtures and Factories

### 1. Test Data Factory
```javascript
// __tests__/factories/userFactory.js
let userIdCounter = 1;

function createUser(overrides = {}) {
  return {
    id: userIdCounter++,
    email: `user${userIdCounter}@example.com`,
    name: `Test User ${userIdCounter}`,
    isActive: true,
    roles: ['user'],
    createdAt: new Date(),
    ...overrides
  };
}

function createUsers(count, overrides = {}) {
  return Array.from({ length: count }, () => createUser(overrides));
}

module.exports = { createUser, createUsers };
```

### 2. Using Fixtures
```javascript
// __tests__/fixtures/users.json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "roles": ["admin", "user"]
  },
  {
    "id": 2,
    "email": "user@example.com",
    "name": "Regular User",
    "roles": ["user"]
  }
]

// __tests__/helpers/loadFixtures.js
const fs = require('fs');
const path = require('path');

function loadFixture(name) {
  const filePath = path.join(__dirname, '../fixtures', `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = { loadFixture };
```

## Setup and Teardown Patterns

```javascript
// __tests__/setup.js
beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
});

afterAll(async () => {
  // Cleanup
  await teardownTestDatabase();
});

beforeEach(async () => {
  // Clear data before each test
  await clearDatabase();
});

afterEach(() => {
  // Clear mocks
  jest.clearAllMocks();
});
```

## Snapshot Testing

```javascript
// __tests__/components/UserCard.test.jsx
import { render } from '@testing-library/react';
import UserCard from '../../components/UserCard';

describe('UserCard', () => {
  it('should match snapshot', () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };

    const { container } = render(<UserCard user={user} />);
    expect(container).toMatchSnapshot();
  });
});
```

## Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/index.js'
  ]
};
```

## E2E Testing with Playwright

```javascript
// e2e/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});
```
