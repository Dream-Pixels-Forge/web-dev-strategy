# Lazy Loading Patterns

This template provides patterns for implementing lazy loading in web applications to improve performance and reduce initial bundle sizes.

## Core Concepts

Lazy loading delays the loading of non-critical resources at page load time, instead loading them when they are needed. This improves initial page load performance and reduces bandwidth usage.

## React Lazy Loading Patterns

### 1. Component Lazy Loading with React.lazy()
```javascript
import { lazy, Suspense } from 'react';

// Lazy load a component
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

### 2. Route-Based Lazy Loading
```javascript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Conditional Lazy Loading
```javascript
import { lazy, Suspense, useState } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function ConditionalLoader() {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <div>
      <button onClick={() => setShowComponent(true)}>
        Load Heavy Component
      </button>
      
      {showComponent && (
        <Suspense fallback={<div>Loading heavy component...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

## Image Lazy Loading Patterns

### 1. Native Browser Lazy Loading
```html
<img src="image.jpg" alt="Description" loading="lazy" />
```

### 2. React Image Lazy Loading Component
```javascript
import { useState, useRef, useEffect } from 'react';

function LazyImage({ src, alt, className, placeholder }) {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || null);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Load actual image when it comes into view
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#f0f0f0' }}>
      {!loaded && imageSrc && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0'
        }}>
          Loading...
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: 'auto', display: loaded ? 'block' : 'none' }}
      />
    </div>
  );
}
```

## Dynamic Import Patterns

### 1. Function-Based Dynamic Imports
```javascript
async function loadModule(modulePath) {
  const module = await import(modulePath);
  return module;
}

// Usage
async function handleClick() {
  const { heavyFunction } = await loadModule('./heavyModule');
  heavyFunction();
}
```

### 2. Conditional Dynamic Imports
```javascript
async function loadFeature(featureName) {
  try {
    switch(featureName) {
      case 'chart': {
        const { ChartComponent } = await import('./ChartComponent');
        return ChartComponent;
      }
      case 'editor': {
        const { EditorComponent } = await import('./EditorComponent');
        return EditorComponent;
      }
      default:
        throw new Error(`Unknown feature: ${featureName}`);
    }
  } catch (error) {
    console.error(`Failed to load feature: ${featureName}`, error);
    throw error;
  }
}
```

## Code Splitting Patterns

### 1. Vendor Bundle Splitting
```javascript
// webpack.config.js or similar bundler config
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### 2. Page-Level Code Splitting
```javascript
// pages/Dashboard.js
const Chart = lazy(() => import('../components/Chart'));
const DataTable = lazy(() => import('../components/DataTable'));

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <Chart />
      </Suspense>
      <Suspense fallback={<div>Loading data table...</div>}>
        <DataTable />
      </Suspense>
    </div>
  );
}
```

## Error Handling for Lazy Components

### 1. Error Boundary
```javascript
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error loading component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
          <h3>Failed to load component</h3>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage with lazy components
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Intersection Observer for Lazy Loading

### 1. Element Visibility Detection
```javascript
import { useEffect, useRef, useState } from 'react';

function LazyLoadOnView({ children, onVisible, threshold = 0.1 }) {
  const elementRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Trigger callback when element becomes visible
          if (onVisible) {
            onVisible();
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [isVisible, onVisible]);

  return (
    <div ref={elementRef}>
      {isVisible ? children : <div>Loading...</div>}
    </div>
  );
}
```

## Best Practices

### 1. Preload Critical Resources
```html
<link rel="preload" href="critical-script.js" as="script">
```

### 2. Prefetch Future Resources
```html
<link rel="prefetch" href="likely-needed-later.js">
```

### 3. Loading States
- Always provide fallback UI during loading
- Consider skeleton screens for better UX
- Handle loading errors gracefully

### 4. Performance Monitoring
- Measure the impact of lazy loading on performance
- Monitor Largest Contentful Paint (LCP) and First Input Delay (FID)
- Test on various network conditions

By implementing these lazy loading patterns, applications can significantly improve initial load times and provide better user experiences.