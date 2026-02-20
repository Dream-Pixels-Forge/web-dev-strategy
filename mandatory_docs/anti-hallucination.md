# Anti-Hallucination Patterns

This template provides guidelines to prevent the code-generator-agent from creating fictional code, APIs, or behaviors that don't exist in the actual libraries or frameworks being used.

## Core Principles

### 1. Verify Before Implementing
- Only use APIs, methods, and properties that exist in the actual libraries
- Check official documentation before implementing features
- Do not invent method names or parameters that sound plausible but don't exist

### 2. Use Real Examples
- Reference actual, working code examples from official documentation
- Implement patterns that are proven to work in the target framework/library
- Avoid making assumptions about how APIs work

### 3. Explicit Implementation
- Fully implement all functions, classes, and components
- Do not leave placeholder comments like "// TODO: implement logic"
- Provide complete, working code for all features

### 4. Type Safety
- Ensure all code passes type checking when using TypeScript
- Use correct type annotations and interfaces
- Verify that types match between function calls and implementations

## Common Anti-Hallucination Techniques

### 1. Import Verification
```javascript
// CORRECT: Only import what actually exists
import { useState, useEffect } from 'react';

// INCORRECT: Do not import non-existent exports
// import { useFictionalHook } from 'react'; // This doesn't exist
```

### 2. API Usage Verification
```javascript
// CORRECT: Use actual Fetch API - response.json() is real
const response = await fetch('/api/data');
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
const data = await response.json();

// INCORRECT: Do not invent methods that don't exist
// const data = await fetch('/api/data').parseJSON(); // parseJSON() doesn't exist
// const data = await fetch('/api/data').getAsync(); // getAsync() is not valid
```

### 3. Framework Feature Verification
```typescript
// CORRECT: Use actual React hooks with proper types and error handling
import { useState, useEffect, FC } from 'react';

interface Props { initialValue: number; }

const MyComponent: FC<Props> = ({ initialValue }) => {
  const [state, setState] = useState<number>(initialValue);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) setState(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error('Failed'));
      }
    };
    
    fetchData();
    return () => { isMounted = false; }; // Cleanup
  }, []);
  
  return <div>{error ? 'Error' : state}</div>;
};

// INCORRECT: Don't invent hooks or misuse effects
// const [data] = useNonExistentHook(); // Doesn't exist
// useEffect(async () => {...}, []); // Can't make effect callback async
```

### 4. Library Method Verification
```javascript
// CORRECT: Use actual Lodash methods with proper error handling
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  try {
    return performSearch(query);
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}, 300);

// INCORRECT: Don't invent method names
// import { fakeDebounceMethod } from 'lodash'; // Doesn't exist
```

### 5. Async/Await Pattern Verification
```javascript
// CORRECT: Proper async/await with error handling
async function fetchUser(userId) {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

// INCORRECT: Common async/await mistakes
// async function bad1() {
//   const result = fetch('/api/data'); // Forgot await
//   const data = result.json(); // Won't work
// }
//
// function bad2() {
//   useEffect(async () => { // Can't use async on effect
//     await fetch('/api/data');
//   }, []);
// }
//
// async function bad3() {
//   fetch(url1); // Fire and forget - no error handling
//   fetch(url2);
// }
```

## Dependency Version Verification

### 1. Package.json Structure
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "lodash": "^4.17.21",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.2.0"
  }
}
```

### 2. Version-Specific API Usage
```javascript
// CRITICAL: APIs vary significantly between major versions
// React Query v4 vs v3 example:

// CORRECT for @tanstack/react-query ^4.0.0
import { useQuery } from '@tanstack/react-query';
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const res = await fetch('/api/users');
    return res.json();
  }
});

// INCORRECT for v4 (this is v3 syntax):
// const { data, isLoading, error } = useQuery('users', async () => {...})
```

## Validation Checklist

## Enhanced Validation Checklist

Before finalizing any code implementation, verify:

### Import and API Verification
- [ ] All imported modules and functions exist in the actual library
- [ ] All method calls correspond to real API methods in the actual version
- [ ] All class properties and methods exist in the actual class
- [ ] All event handlers and callback parameters match the actual API
- [ ] All configuration options exist in the actual library version
- [ ] Library is listed in package.json with appropriate version

### Code Quality
- [ ] All code compiles without errors (for TypeScript)
- [ ] All functions have complete implementations (no placeholders)
- [ ] All promises are properly awaited or chained
- [ ] All error handling is implemented for async operations
- [ ] All effects have proper cleanup functions
- [ ] Race condition protection implemented (isMounted or AbortController)
- [ ] All external dependencies are properly declared in package.json

### Version-Specific Checks
- [ ] Code matches the specified library version in package.json
- [ ] No deprecated APIs used for the specified version
- [ ] Breaking changes between versions are handled
- [ ] Minimum version requirements are documented

## Error Prevention Strategies

### 1. Research Before Implementation
- Consult official documentation for the libraries being used
- Verify API signatures and parameter types
- Check version compatibility if specific versions are required

### 2. Conservative Implementation
- Stick to well-known, commonly-used features
- Avoid experimental or deprecated APIs unless specifically requested
- Use established patterns rather than novel approaches

### 3. Complete Implementation
- Fully implement all functionality without shortcuts
- Provide proper error handling for all async operations
- Include proper cleanup for effects, subscriptions, and event listeners

By following these anti-hallucination patterns, the code-generator-agent will produce reliable, implementable code that works as expected in real applications.