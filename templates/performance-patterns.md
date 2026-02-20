# Performance Patterns

This template provides patterns for optimizing application performance, including code optimization, memoization, debouncing, and bundle optimization.

## React Performance Patterns

### 1. Memoization with useMemo
```javascript
// components/ExpensiveComponent.jsx
import { useMemo } from 'react';

function ExpensiveComponent({ data, filter }) {
  const filteredData = useMemo(() => {
    console.log('Filtering data...');
    return data.filter(item => item.category === filter);
  }, [data, filter]);

  const sortedData = useMemo(() => {
    console.log('Sorting data...');
    return [...filteredData].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredData]);

  return (
    <div>
      {sortedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

export default ExpensiveComponent;
```

### 2. Callback Memoization with useCallback
```javascript
// components/ParentComponent.jsx
import { useState, useCallback } from 'react';
import ChildComponent from './ChildComponent';

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  // Without useCallback, this function is recreated on every render
  const handleItemClick = useCallback((id) => {
    console.log('Item clicked:', id);
    // Handle click logic
  }, []); // Empty deps means function never changes

  const handleAddItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ChildComponent items={items} onItemClick={handleItemClick} />
    </div>
  );
}
```

### 3. Component Memoization with React.memo
```javascript
// components/ChildComponent.jsx
import { memo } from 'react';

const ChildComponent = memo(({ items, onItemClick }) => {
  console.log('ChildComponent rendered');

  return (
    <div>
      {items.map(item => (
        <div key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.items.length === nextProps.items.length &&
    prevProps.onItemClick === nextProps.onItemClick
  );
});

export default ChildComponent;
```

### 4. Code Splitting with React.lazy
```javascript
// App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

### 5. Virtual Scrolling
```javascript
// components/VirtualList.jsx
import { useRef, useState, useEffect } from 'react';

function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;
```

## Debouncing and Throttling

### 1. Debounce Hook
```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search
      fetchResults(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}

export default useDebounce;
```

### 2. Throttle Hook
```javascript
// hooks/useThrottle.js
import { useRef, useCallback } from 'react';

function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();

    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

// Usage
function ScrollComponent() {
  const handleScroll = useThrottle(() => {
    console.log('Scroll event');
    // Handle scroll
  }, 200);

  return (
    <div onScroll={handleScroll} style={{ height: '100vh', overflow: 'auto' }}>
      {/* Content */}
    </div>
  );
}

export default useThrottle;
```

### 3. Debounce Utility Function
```javascript
// utils/debounce.js
function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
  // Perform search
}, 500);

// Call it
debouncedSearch('test');

module.exports = debounce;
```

## Backend Performance Patterns

### 1. Database Query Optimization
```javascript
// services/userService.js
const { prisma } = require('../lib/prisma');

class UserService {
  // Bad: N+1 query problem
  async getUsersWithPostsBad() {
    const users = await prisma.user.findMany();

    for (const user of users) {
      user.posts = await prisma.post.findMany({
        where: { userId: user.id }
      });
    }

    return users;
  }

  // Good: Use include to fetch related data
  async getUsersWithPostsGood() {
    return await prisma.user.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        }
      }
    });
  }

  // Better: Use pagination and select only needed fields
  async getUsersOptimized(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        posts: {
          select: {
            id: true,
            title: true
          },
          take: 5
        }
      }
    });
  }
}

module.exports = new UserService();
```

### 2. Batch Processing
```javascript
// utils/batchProcessor.js
class BatchProcessor {
  constructor(batchSize = 100, delay = 1000) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  add(item) {
    this.queue.push(item);

    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      try {
        await this.processBatch(batch);
      } catch (error) {
        console.error('Batch processing error:', error);
      }

      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.processing = false;
  }

  async processBatch(items) {
    // Override this method
    console.log(`Processing batch of ${items.length} items`);
  }
}

module.exports = BatchProcessor;
```

### 3. Connection Pooling
```javascript
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool size
  min: 5, // Minimum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Monitor pool
pool.on('connect', () => {
  console.log('New client connected to pool');
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

module.exports = pool;
```

## Caching Strategies

### 1. Memoization Function
```javascript
// utils/memoize.js
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);

    return result;
  };
}

// Usage
const expensiveCalculation = memoize((n) => {
  console.log('Calculating...');
  return n * n;
});

console.log(expensiveCalculation(5)); // Calculates
console.log(expensiveCalculation(5)); // Returns cached result

module.exports = memoize;
```

### 2. LRU Cache Implementation
```javascript
// utils/lruCache.js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    // Delete if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Remove oldest if over capacity
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = LRUCache;
```

## Bundle Optimization

### 1. Webpack Configuration
```javascript
// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: 'single'
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};
```

### 2. Tree Shaking
```javascript
// Import only what you need
import { debounce } from 'lodash-es'; // Good
// import _ from 'lodash'; // Bad - imports entire library

// Use named exports
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Instead of default export with object
// export default { add, subtract };
```

## Image Optimization

```javascript
// components/OptimizedImage.jsx
import { useState, useEffect } from 'react';

function OptimizedImage({ src, alt, width, height }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };

    img.src = src;
  }, [src]);

  return (
    <div style={{ width, height, position: 'relative' }}>
      {loading && <div className="skeleton" />}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          style={{ display: loading ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}

export default OptimizedImage;
```

## Request Batching

```javascript
// utils/requestBatcher.js
class RequestBatcher {
  constructor(batchFn, delay = 10) {
    this.batchFn = batchFn;
    this.delay = delay;
    this.queue = [];
    this.timer = null;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  async flush() {
    const batch = this.queue.splice(0);
    this.timer = null;

    if (batch.length === 0) return;

    try {
      const requests = batch.map(item => item.request);
      const results = await this.batchFn(requests);

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

module.exports = RequestBatcher;
```
