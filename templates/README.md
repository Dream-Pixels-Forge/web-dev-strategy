# Templates Directory

This directory contains templates and patterns designed to help the code-generator-agent produce accurate, reliable code while preventing hallucinations and implementing common architectural patterns.

The templates directory path is configured in opencode.json as "C:\\Users\\Patrick\\.config\\opencode\\templates".

## Purpose

These templates serve as authoritative references for:

- Preventing hallucinations and ensuring code accuracy
- Implementing common architectural patterns
- Following established best practices
- Maintaining consistency across generated code

## Available Templates

### Project Architecture
- **project-structure-patterns.md** - MVP, SaaS, microservices, monorepo, e-commerce structures

### Core Patterns
- **anti-hallucination-patterns.md** - Patterns to prevent AI hallucinations and ensure factual code
- **authentication-patterns.md** - JWT, OAuth, session management, password reset
- **login-patterns.md** - Login forms, protected routes, auth context
- **security-patterns.md** - CSRF, XSS prevention, input sanitization, rate limiting

### API & Data Patterns
- **API-integration-patterns.md** - REST API, GraphQL, fetch/axios patterns
- **database-patterns.md** - CRUD operations, Prisma, Mongoose, connection pooling, transactions
- **caching-patterns.md** - Redis, in-memory caching, cache invalidation strategies
- **pagination-patterns.md** - Offset-based, cursor-based, infinite scroll

### Frontend Patterns
- **state-management-patterns.md** - Redux, Zustand, Context API, global state
- **routing-patterns.md** - React Router, nested routes, dynamic routes, route guards
- **lazy-loading-patterns.md** - Code splitting, dynamic imports, React.lazy, Suspense
- **form-validation-patterns.md** - Client-side validation, Yup, Zod, real-time validation
- **error-handling-patterns.md** - Error boundaries, try-catch patterns, API error responses

### Backend Patterns
- **middleware-patterns.md** - Express middleware, authentication, logging, rate limiting
- **websocket-patterns.md** - Socket.io, real-time chat, presence, room management
- **file-upload-patterns.md** - Multer, S3 uploads, image processing, drag-and-drop
- **email-patterns.md** - Email templates, SendGrid, SES, transactional emails
- **logging-patterns.md** - Winston, Pino, structured logging, monitoring

### Testing & Quality
- **testing-patterns.md** - Jest, Vitest, unit tests, integration tests, E2E, mocking
- **accessibility-patterns.md** - ARIA, keyboard navigation, screen readers, WCAG
- **performance-patterns.md** - Memoization, debouncing, throttling, optimization

### Deployment & Infrastructure
- **deployment-patterns.md** - Docker, CI/CD, Vercel, Render, Railway, Supabase, Netlify, Fly.io, Heroku
- **billing-patterns.md** - Payment processing, subscription management, invoicing
- **pricing-patterns.md** - Pricing tiers, usage-based billing, metered billing, pricing strategies

## Usage

When generating code, the code-generator-agent should reference these templates to ensure:

1. All implementations are based on real, existing technologies and APIs
2. Common patterns are implemented consistently
3. Best practices are followed
4. Code is production-ready and maintainable
5. Security and performance considerations are addressed

## Template Structure

Each template includes:
- Real, working code examples
- Multiple implementation approaches
- Best practices and common patterns
- Both frontend and backend examples where applicable
- Production-ready patterns with error handling