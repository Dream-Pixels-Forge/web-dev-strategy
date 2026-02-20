# Project Structure Patterns

This template provides project structure patterns for different application types including MVP, SaaS, monorepo, and microservices architectures.

## MVP (Minimum Viable Product) Structure

### 1. Simple MVP Structure
```
mvp-app/
├── client/                 # Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       └── Input.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

### 2. MVP Package.json Scripts
```json
{
  "name": "mvp-app",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install"
  }
}
```

## SaaS Application Structure

### 1. Full-Stack SaaS Structure
```
saas-app/
├── apps/
│   ├── web/                    # Main web application
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── settings/
│   │   │   │   │   ├── billing/
│   │   │   │   │   └── analytics/
│   │   │   │   ├── api/
│   │   │   │   │   ├── auth/
│   │   │   │   │   └── users/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   ├── forms/
│   │   │   │   └── layouts/
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── db.ts
│   │   │   │   └── stripe.ts
│   │   │   └── styles/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.routes.ts
│   │   │   │   ├── users/
│   │   │   │   ├── billing/
│   │   │   │   └── analytics/
│   │   │   ├── common/
│   │   │   │   ├── middleware/
│   │   │   │   ├── guards/
│   │   │   │   └── decorators/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── admin/                  # Admin dashboard
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── App.tsx
│       └── package.json
│
├── packages/                   # Shared packages
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                 # Shared configuration
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   │
│   └── utils/                  # Shared utilities
│       ├── src/
│       │   ├── validation.ts
│       │   ├── formatting.ts
│       │   └── index.ts
│       └── package.json
│
├── prisma/                     # Database schema
│   ├── schema.prisma
│   └── migrations/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── package.json
├── turbo.json
└── README.md
```

### 2. SaaS Turbo Configuration
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

## Microservices Architecture

### 1. Microservices Structure
```
microservices-app/
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── user-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── payment-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── notification-service/
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── gateway/                    # API Gateway
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── shared/                     # Shared libraries
│   ├── logger/
│   ├── database/
│   └── messaging/
│
├── infrastructure/
│   ├── kubernetes/
│   │   ├── auth-service.yaml
│   │   ├── user-service.yaml
│   │   └── ingress.yaml
│   └── terraform/
│
├── docker-compose.yml
└── README.md
```

### 2. Docker Compose for Microservices
```yaml
version: '3.8'

services:
  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:3001
      - USER_SERVICE_URL=http://user-service:3002
    depends_on:
      - auth-service
      - user-service

  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/auth
      - REDIS_URL=redis://redis:6379

  user-service:
    build: ./services/user-service
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/users

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
```

## Monorepo Structure

### 1. Turborepo Monorepo
```
monorepo/
├── apps/
│   ├── web/                    # Next.js app
│   ├── mobile/                 # React Native app
│   └── docs/                   # Documentation site
│
├── packages/
│   ├── ui/                     # Shared UI library
│   ├── config/                 # Shared configs
│   ├── tsconfig/               # TypeScript configs
│   └── eslint-config/          # ESLint configs
│
├── tooling/
│   ├── prettier/
│   └── typescript/
│
├── .github/
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### 2. Workspace Configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
```

## E-commerce Structure

### 1. E-commerce Application
```
ecommerce-app/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Products/
│   │   │   ├── ProductDetail/
│   │   │   ├── Cart/
│   │   │   └── Checkout/
│   │   ├── components/
│   │   │   ├── ProductCard/
│   │   │   ├── CartItem/
│   │   │   └── PaymentForm/
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── cartSlice.js
│   │   │   │   └── productsSlice.js
│   │   │   └── store.js
│   │   └── services/
│   │       ├── productService.js
│   │       └── orderService.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── cart/
│   │   │   ├── payments/
│   │   │   └── inventory/
│   │   ├── common/
│   │   └── main.ts
│   └── package.json
│
├── admin/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Products/
│   │   │   ├── Orders/
│   │   │   └── Customers/
│   │   └── components/
│   └── package.json
│
└── shared/
    └── types/
        ├── product.ts
        └── order.ts
```

## Serverless Structure

### 1. Serverless Application
```
serverless-app/
├── functions/
│   ├── auth/
│   │   ├── login.js
│   │   └── signup.js
│   ├── users/
│   │   ├── get.js
│   │   ├── create.js
│   │   └── update.js
│   └── webhooks/
│       └── stripe.js
│
├── layers/
│   ├── common/
│   │   └── nodejs/
│   │       └── node_modules/
│   └── utils/
│
├── lib/
│   ├── db.js
│   ├── auth.js
│   └── validation.js
│
├── serverless.yml
└── package.json
```

### 2. Serverless Configuration
```yaml
# serverless.yml
service: serverless-app

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}

functions:
  login:
    handler: functions/auth/login.handler
    events:
      - http:
          path: auth/login
          method: post
          cors: true

  getUser:
    handler: functions/users/get.handler
    events:
      - http:
          path: users/{id}
          method: get
          cors: true

layers:
  common:
    path: layers/common
```

## Mobile App Structure

### 1. React Native Structure
```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── Home/
│   │   └── Profile/
│   ├── components/
│   │   ├── common/
│   │   └── forms/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   ├── slices/
│   │   └── store.ts
│   ├── hooks/
│   ├── utils/
│   └── App.tsx
│
├── android/
├── ios/
├── package.json
└── app.json
```

## Full-Stack TypeScript Structure

### 1. Modern Full-Stack App
```
fullstack-ts/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   ├── common/
│       │   └── main.ts
│       └── test/
│
├── packages/
│   ├── database/               # Prisma
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       └── client.ts
│   │
│   ├── types/                  # Shared types
│   │   └── src/
│   │       ├── user.ts
│   │       └── index.ts
│   │
│   └── validation/             # Zod schemas
│       └── src/
│           └── schemas.ts
│
├── tooling/
│   ├── eslint/
│   └── typescript/
│
└── package.json
```

## Project Structure Best Practices

### 1. Folder Organization Principles
```javascript
// Feature-based structure (recommended for large apps)
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   ├── dashboard/
│   └── settings/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
│
└── core/
    ├── api/
    ├── config/
    └── types/

// Layer-based structure (traditional)
src/
├── components/
├── services/
├── hooks/
├── utils/
├── types/
└── config/
```

### 2. Configuration Files Structure
```
project-root/
├── .env.example
├── .env.local
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── jest.config.js
├── next.config.js
├── tailwind.config.js
└── package.json
```

### 3. Environment-Specific Configs
```javascript
// config/index.js
const configs = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    debug: true
  },
  production: {
    apiUrl: 'https://api.example.com',
    debug: false
  }
};

module.exports = configs[process.env.NODE_ENV || 'development'];
```

## Choosing the Right Structure

```javascript
const structureGuide = {
  mvp: {
    use: 'Simple MVP Structure',
    when: ['Quick prototype', 'Small team', 'Single developer'],
    pros: ['Fast setup', 'Easy to understand', 'Minimal overhead'],
    cons: ['Hard to scale', 'Limited separation']
  },
  
  saas: {
    use: 'Full-Stack SaaS Structure',
    when: ['Multi-tenant app', 'Subscription model', 'Complex features'],
    pros: ['Scalable', 'Organized', 'Shared code'],
    cons: ['Complex setup', 'Learning curve']
  },
  
  microservices: {
    use: 'Microservices Architecture',
    when: ['Large team', 'Independent services', 'High scale'],
    pros: ['Independent deployment', 'Technology flexibility', 'Scalable'],
    cons: ['Complex infrastructure', 'Distributed challenges']
  },
  
  monorepo: {
    use: 'Turborepo Monorepo',
    when: ['Multiple apps', 'Shared code', 'Consistent tooling'],
    pros: ['Code sharing', 'Atomic changes', 'Unified tooling'],
    cons: ['Build complexity', 'Large repository']
  }
};
```
