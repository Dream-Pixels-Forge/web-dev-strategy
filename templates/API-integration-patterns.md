# API Integration Patterns

This template provides patterns for integrating with external APIs and building robust API clients in web applications.

## HTTP Client Abstraction

### 1. Base API Client Class
```javascript
// services/APIClient.js
class APIClient {
  constructor(baseURL, defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (parseError) {
        throw new APIError(
          'Failed to parse response body',
          response.status,
          null
        );
      }

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return { data, response };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new NetworkError('Network request failed', error);
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
}

// Custom error classes
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export default APIClient;
```

### 2. Authenticated API Client
```javascript
// services/AuthAPIClient.js
import APIClient from './APIClient';

class AuthAPIClient extends APIClient {
  constructor(baseURL, tokenManager) {
    super(baseURL);
    this.tokenManager = tokenManager;
  }

  async request(endpoint, options = {}) {
    // Add auth header
    const token = this.tokenManager.getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    try {
      return await super.request(endpoint, options);
    } catch (error) {
      // Handle 401 Unauthorized - possibly refresh token
      if (error.status === 401) {
        const refreshed = await this.tokenManager.refreshToken();
        if (refreshed) {
          // Retry request with new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.tokenManager.getToken()}`
          };
          return await super.request(endpoint, options);
        }
      }
      throw error;
    }
  }
}

export default AuthAPIClient;
```

## API Service Layer

### 1. User Service Example
```javascript
// services/UserService.js
import AuthAPIClient from './AuthAPIClient';

class UserService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getUsers(page = 1, limit = 10) {
    const { data } = await this.apiClient.get('/users', { page, limit });
    return data;
  }

  async getUserById(id) {
    const { data } = await this.apiClient.get(`/users/${id}`);
    return data;
  }

  async createUser(userData) {
    const { data } = await this.apiClient.post('/users', userData);
    return data;
  }

  async updateUser(id, userData) {
    const { data } = await this.apiClient.put(`/users/${id}`, userData);
    return data;
  }

  async deleteUser(id) {
    await this.apiClient.delete(`/users/${id}`);
  }

  async searchUsers(query, filters = {}) {
    const params = { q: query, ...filters };
    const { data } = await this.apiClient.get('/users/search', params);
    return data;
  }
}

export default UserService;
```

### 2. Product Service Example
```javascript
// services/ProductService.js
import APIClient from './APIClient';

class ProductService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getProducts(filters = {}) {
    const { data } = await this.apiClient.get('/products', filters);
    return data;
  }

  async getProductById(id) {
    const { data } = await this.apiClient.get(`/products/${id}`);
    return data;
  }

  async createProduct(productData) {
    const { data } = await this.apiClient.post('/products', productData);
    return data;
  }

  async updateProduct(id, productData) {
    const { data } = await this.apiClient.put(`/products/${id}`, productData);
    return data;
  }

  async deleteProduct(id) {
    await this.apiClient.delete(`/products/${id}`);
  }

  async getCategories() {
    const { data } = await this.apiClient.get('/categories');
    return data;
  }

  async addReview(productId, reviewData) {
    const { data } = await this.apiClient.post(`/products/${productId}/reviews`, reviewData);
    return data;
  }
}

export default ProductService;
```

## API Integration with State Management

### 1. React Query Integration
```javascript
// hooks/useUserAPI.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserService from '../services/UserService';
import apiClient from '../services/AuthAPIClient';

const userService = new UserService(apiClient);

// Queries
export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => userService.getUsers(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useUser(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId
  });
}

// Mutations
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: (newUser) => {
      // Update cache optimistically
      queryClient.setQueryData(['users'], (oldUsers) => {
        if (!oldUsers) return [newUser];
        return [newUser, ...oldUsers];
      });
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }) => userService.updateUser(id, userData),
    onSuccess: (updatedUser, { id }) => {
      // Update individual user
      queryClient.setQueryData(['user', id], updatedUser);
      
      // Update in users list
      queryClient.setQueryData(['users'], (oldUsers) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.map(user => 
          user.id === id ? updatedUser : user
        );
      });
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.setQueryData(['users'], (oldUsers) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.filter(user => user.id !== id);
      });
      
      queryClient.removeQueries({ queryKey: ['user', id] });
    }
  });
}
```

### 2. Redux Toolkit RTK Query Integration
```javascript
// services/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['User', 'Product'],
  endpoints: (builder) => ({
    // Users
    getUsers: builder.query({
      query: ({ page = 1, limit = 10 }) => 
        `users?page=${page}&limit=${limit}`,
      providesTags: ['User']
    }),
    
    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),
    
    createUser: builder.mutation({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData
      }),
      invalidatesTags: ['User']
    }),
    
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'User'
      ]
    }),
    
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),
    
    // Products
    getProducts: builder.query({
      query: (params) => ({
        url: 'products',
        params
      }),
      providesTags: ['Product']
    })
  })
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetProductsQuery
} = apiSlice;
```

## Advanced API Patterns

### 1. Request Interceptors
```javascript
// services/InterceptedAPIClient.js
import APIClient from './APIClient';

class InterceptedAPIClient extends APIClient {
  constructor(baseURL, defaultHeaders = {}) {
    super(baseURL, defaultHeaders);
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async request(endpoint, options = {}) {
    // Apply request interceptors
    let modifiedOptions = { ...options };
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await interceptor(endpoint, modifiedOptions);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, modifiedOptions);
      
      // Apply response interceptors
      let modifiedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        modifiedResponse = await interceptor(modifiedResponse);
      }

      // Handle response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return { data, response: modifiedResponse };
    } catch (error) {
      throw error;
    }
  }
}

// Example interceptors
const loggingInterceptor = async (endpoint, options) => {
  console.log(`Making request to: ${endpoint}`);
  const startTime = Date.now();
  
  return {
    ...options,
    _startTime: startTime,
    _endpoint: endpoint
  };
};

const timingInterceptor = async (response) => {
  // Note: Interceptor doesn't have access to request timing
  // Consider using request/response metadata instead
  return response;
};

const apiClient = new InterceptedAPIClient('https://api.example.com');
apiClient.addRequestInterceptor(loggingInterceptor);
apiClient.addResponseInterceptor(timingInterceptor);
```

### 2. Rate Limiting and Retry Logic
```javascript
// services/LimitedAPIClient.js
import APIClient from './APIClient';

class LimitedAPIClient extends APIClient {
  constructor(baseURL, defaultHeaders = {}, rateLimitConfig = {}) {
    super(baseURL, defaultHeaders);
    this.rateLimitConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      maxRetryDelay: 10000,
      backoffMultiplier: 2,
      requestsPerSecond: 10,
      ...rateLimitConfig
    };
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.activeRequests = 0;
  }

  async request(endpoint, options = {}) {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.rateLimitConfig.requestsPerSecond; // if defined
    
    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, minInterval - timeSinceLastRequest)
      );
    }

    return this.makeRequestWithRetry(endpoint, options);
  }

  async makeRequestWithRetry(endpoint, options, retryCount = 0) {
    try {
      this.lastRequestTime = Date.now();
      return await super.request(endpoint, options);
    } catch (error) {
      // Retry logic for specific error types
      if (
        this.shouldRetry(error, retryCount) &&
        retryCount < this.rateLimitConfig.maxRetries
      ) {
        const delay = this.calculateRetryDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeRequestWithRetry(endpoint, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  shouldRetry(error, retryCount) {
    // Retry on network errors, 429 (Too Many Requests), 5xx status codes
    return (
      error.name === 'NetworkError' ||
      error.status === 429 ||
      (error.status >= 500 && error.status < 600)
    );
  }

  calculateRetryDelay(retryCount) {
    const delay = this.rateLimitConfig.retryDelay * 
                  Math.pow(this.rateLimitConfig.backoffMultiplier, retryCount);
    return Math.min(delay, this.rateLimitConfig.maxRetryDelay);
  }
}

export default LimitedAPIClient;
```

## API Response Handling

### 1. Response Transformers
```javascript
// utils/responseTransformers.js
export const transformUserResponse = (apiResponse) => {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    email: apiResponse.email,
    createdAt: new Date(apiResponse.created_at),
    isActive: apiResponse.is_active,
    profile: {
      avatar: apiResponse.profile?.avatar_url,
      bio: apiResponse.profile?.bio,
      location: apiResponse.profile?.location
    }
  };
};

export const transformProductResponse = (apiResponse) => {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    price: parseFloat(apiResponse.price),
    description: apiResponse.description,
    category: apiResponse.category_id,
    imageUrl: apiResponse.image_url,
    inStock: apiResponse.in_stock,
    rating: parseFloat(apiResponse.rating) || 0,
    reviewCount: parseInt(apiResponse.review_count) || 0
  };
};

// Generic transformer
export const createTransformer = (transformFn) => {
  return (response) => {
    if (Array.isArray(response)) {
      return response.map(transformFn);
    }
    return transformFn(response);
  };
};
```

### 2. API Response Validation
```javascript
// utils/responseValidator.js
export const validateApiResponse = (response, schema) => {
  const errors = [];
  
  for (const [field, validator] of Object.entries(schema)) {
    const value = response[field];
    
    if (validator.required && (value === undefined || value === null)) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (validator.type && typeof value !== validator.type) {
        errors.push(`${field} must be of type ${validator.type}`);
      }
      
      if (validator.validator && !validator.validator(value)) {
        errors.push(`${field} is invalid`);
      }
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Response validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

// Usage
const userSchema = {
  id: { type: 'number', required: true },
  name: { type: 'string', required: true },
  email: { type: 'string', required: true, validator: (val) => val.includes('@') }
};

// In API service
async getUser(id) {
  const { data } = await this.apiClient.get(`/users/${id}`);
  validateApiResponse(data, userSchema);
  return data;
}
```

## Third-Party API Integration

### 1. External API Service
```javascript
// services/ExternalAPIService.js
class ExternalAPIService {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 5000;
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    // Extract and handle query params
    const params = options.params || {};
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const fetchOptions = { ...options };
    delete fetchOptions.params;

    try {
      const response = await fetch(`${this.baseURL}${fullEndpoint}`, {
        ...fetchOptions,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async getWeather(city) {
    return this.request('/weather', {
      method: 'GET',
      params: { city }
    });
  }

  async getExchangeRate(from, to) {
    return this.request('/exchange', {
      method: 'GET',
      params: { from, to }
    });
  }
}

export default ExternalAPIService;
```

## Best Practices

### 1. Error Handling
- Always handle network errors separately from API errors
- Implement proper retry logic for transient failures
- Use exponential backoff for retries
- Log errors appropriately without exposing sensitive data

### 2. Performance
- Implement caching strategies (browser cache, service workers, in-memory)
- Use request batching when possible
- Implement pagination for large datasets
- Consider compression for large payloads

### 3. Security
- Never expose API keys in client-side code
- Use HTTPS for all API communications
- Implement proper authentication and authorization
- Sanitize and validate all API responses

### 4. Monitoring
- Track API response times
- Monitor error rates
- Log important API interactions
- Implement circuit breaker patterns for unreliable APIs

Following these API integration patterns will help create robust, maintainable, and efficient API integrations in web applications.