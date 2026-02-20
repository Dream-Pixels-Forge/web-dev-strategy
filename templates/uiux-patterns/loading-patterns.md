# Loading Patterns

## Loading States

### Page Loading
```jsx
const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <Spinner size="large" />
        <p className="page-loader-message">{message}</p>
      </div>
    </div>
  );
};

// Full page overlay loader
const FullPageLoader = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="full-page-loader">
      <div className="full-page-loader-overlay">
        <div className="full-page-loader-content">
          <Spinner size="large" />
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
};
```

### Component Loading
```jsx
const LoadingWrapper = ({ 
  isLoading, 
  children, 
  fallback,
  overlay = false 
}) => {
  if (isLoading) {
    if (overlay) {
      return (
        <div className="loading-wrapper loading-wrapper--overlay">
          {children}
          <div className="loading-overlay">
            {fallback || <Spinner />}
          </div>
        </div>
      );
    }
    
    return (
      <div className="loading-wrapper">
        {fallback || <Spinner />}
      </div>
    );
  }

  return children;
};

// Usage
<LoadingWrapper isLoading={isLoading} overlay>
  <DataTable data={data} />
</LoadingWrapper>
```

## Skeleton Loaders

### Text Skeleton
```jsx
const TextSkeleton = ({ 
  lines = 3, 
  width = '100%',
  lastLineWidth = '75%' 
}) => {
  return (
    <div className="text-skeleton">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="skeleton-line"
          style={{
            width: index === lines - 1 ? lastLineWidth : width
          }}
        />
      ))}
    </div>
  );
};
```

### Card Skeleton
```jsx
const CardSkeleton = ({ showAvatar = false, showActions = false }) => {
  return (
    <div className="card-skeleton">
      <div className="card-skeleton-header">
        {showAvatar && <div className="skeleton-avatar" />}
        <div className="card-skeleton-title">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--subtitle" />
        </div>
      </div>
      
      <div className="card-skeleton-content">
        <TextSkeleton lines={3} />
      </div>
      
      {showActions && (
        <div className="card-skeleton-actions">
          <div className="skeleton-button" />
          <div className="skeleton-button" />
        </div>
      )}
    </div>
  );
};
```

### Table Skeleton
```jsx
const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => {
  return (
    <div className="table-skeleton">
      {showHeader && (
        <div className="table-skeleton-header">
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className="skeleton-line skeleton-line--header" />
          ))}
        </div>
      )}
      
      <div className="table-skeleton-body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="table-skeleton-row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="skeleton-line skeleton-line--cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Progress Indicators

### Step Progress
```jsx
const StepProgress = ({ 
  steps, 
  currentStep, 
  variant = 'horizontal' 
}) => {
  return (
    <div className={`step-progress step-progress--${variant}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div 
            key={step.id}
            className={`step-progress-item ${
              isCompleted ? 'step-progress-item--completed' :
              isCurrent ? 'step-progress-item--current' :
              'step-progress-item--upcoming'
            }`}
          >
            <div className="step-progress-indicator">
              {isCompleted ? (
                <CheckIcon className="step-progress-check" />
              ) : (
                <span className="step-progress-number">{index + 1}</span>
              )}
            </div>
            
            <div className="step-progress-content">
              <div className="step-progress-title">{step.title}</div>
              {step.description && (
                <div className="step-progress-description">
                  {step.description}
                </div>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div className="step-progress-connector" />
            )}
          </div>
        );
      })}
    </div>
  );
};
```

### Upload Progress
```jsx
const UploadProgress = ({ 
  files, 
  onCancel, 
  onRetry 
}) => {
  return (
    <div className="upload-progress">
      <div className="upload-progress-header">
        <h3>Uploading Files</h3>
        <button onClick={onCancel} className="upload-cancel">
          Cancel All
        </button>
      </div>
      
      <div className="upload-progress-list">
        {files.map((file) => (
          <div key={file.id} className="upload-progress-item">
            <div className="upload-file-info">
              <FileIcon className="upload-file-icon" />
              <div className="upload-file-details">
                <div className="upload-file-name">{file.name}</div>
                <div className="upload-file-size">
                  {formatFileSize(file.size)}
                </div>
              </div>
            </div>
            
            <div className="upload-progress-bar">
              <ProgressBar 
                value={file.progress} 
                max={100}
                size="small"
                variant={file.status === 'error' ? 'error' : 'primary'}
              />
            </div>
            
            <div className="upload-status">
              {file.status === 'uploading' && (
                <Spinner size="small" />
              )}
              {file.status === 'completed' && (
                <CheckCircleIcon className="upload-success" />
              )}
              {file.status === 'error' && (
                <div className="upload-error">
                  <XCircleIcon />
                  <button onClick={() => onRetry(file.id)}>
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Lazy Loading

### Image Lazy Loading
```jsx
const LazyImage = ({ 
  src, 
  alt, 
  placeholder,
  className = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef}
      className={`lazy-image ${className}`}
      {...props}
    >
      {!isLoaded && (
        <div className="lazy-image-placeholder">
          {placeholder || <div className="lazy-image-skeleton" />}
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`lazy-image-img ${isLoaded ? 'lazy-image-img--loaded' : ''}`}
        />
      )}
    </div>
  );
};
```

### Content Lazy Loading
```jsx
const LazyContent = ({ 
  children, 
  fallback = <Spinner />,
  threshold = 0.1 
}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className="lazy-content">
      {isInView ? children : fallback}
    </div>
  );
};
```

## Infinite Loading

### Infinite Scroll
```jsx
const InfiniteScroll = ({ 
  items,
  loadMore,
  hasMore,
  isLoading,
  loader = <Spinner />,
  threshold = 100 
}) => {
  const sentinelRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, threshold]);

  return (
    <div className="infinite-scroll">
      <div className="infinite-scroll-content">
        {items.map((item, index) => (
          <div key={item.id || index} className="infinite-scroll-item">
            {item}
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div ref={sentinelRef} className="infinite-scroll-sentinel">
          {isLoading && loader}
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="infinite-scroll-end">
          No more items to load
        </div>
      )}
    </div>
  );
};
```

## Loading Hooks

### useAsync Hook
```jsx
const useAsync = (asyncFunction, dependencies = []) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    asyncFunction()
      .then(data => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return state;
};

// Usage
const MyComponent = () => {
  const { data, loading, error } = useAsync(
    () => fetchUserData(userId),
    [userId]
  );

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error.message}</div>;
  
  return <UserProfile data={data} />;
};
```

## CSS Styles

```css
/* Page Loader */
.page-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.page-loader-content {
  text-align: center;
}

.page-loader-message {
  margin-top: 1rem;
  color: var(--color-gray-600);
  font-size: 0.875rem;
}

.full-page-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.full-page-loader-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-page-loader-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Loading Wrapper */
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-wrapper--overlay {
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Skeleton Loaders */
.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: skeleton-loading 1.5s infinite;
  margin-bottom: 0.5rem;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

.skeleton-line--title {
  height: 1.25rem;
  width: 60%;
}

.skeleton-line--subtitle {
  height: 1rem;
  width: 40%;
}

.skeleton-line--header {
  height: 1rem;
  width: 80%;
}

.skeleton-line--cell {
  height: 1rem;
  width: 90%;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.text-skeleton {
  width: 100%;
}

.skeleton-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-button {
  width: 5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* Card Skeleton */
.card-skeleton {
  padding: 1.5rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
}

.card-skeleton-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-skeleton-title {
  flex: 1;
}

.card-skeleton-content {
  margin-bottom: 1rem;
}

.card-skeleton-actions {
  display: flex;
  gap: 0.5rem;
}

/* Table Skeleton */
.table-skeleton {
  width: 100%;
}

.table-skeleton-header,
.table-skeleton-row {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: 1rem;
  padding: 0.75rem 0;
}

.table-skeleton-header {
  border-bottom: 1px solid var(--color-gray-200);
}

.table-skeleton-row {
  border-bottom: 1px solid var(--color-gray-100);
}

/* Step Progress */
.step-progress {
  display: flex;
}

.step-progress--vertical {
  flex-direction: column;
}

.step-progress-item {
  display: flex;
  align-items: center;
  position: relative;
}

.step-progress--vertical .step-progress-item {
  flex-direction: column;
  align-items: flex-start;
}

.step-progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.step-progress-item--completed .step-progress-indicator {
  background: var(--color-green-600);
  color: white;
}

.step-progress-item--current .step-progress-indicator {
  background: var(--color-primary-600);
  color: white;
}

.step-progress-item--upcoming .step-progress-indicator {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
}

.step-progress-content {
  margin-left: 1rem;
}

.step-progress--vertical .step-progress-content {
  margin-left: 0;
  margin-top: 0.5rem;
}

.step-progress-title {
  font-weight: 500;
  color: var(--color-gray-900);
}

.step-progress-description {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-top: 0.25rem;
}

.step-progress-connector {
  flex: 1;
  height: 2px;
  background: var(--color-gray-200);
  margin: 0 1rem;
}

.step-progress-item--completed .step-progress-connector {
  background: var(--color-green-600);
}

/* Upload Progress */
.upload-progress {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.upload-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.upload-progress-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.upload-progress-item:last-child {
  border-bottom: none;
}

.upload-file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.upload-file-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-gray-400);
}

.upload-file-name {
  font-weight: 500;
  color: var(--color-gray-900);
}

.upload-file-size {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.upload-progress-bar {
  min-width: 8rem;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-success {
  color: var(--color-green-600);
  width: 1.25rem;
  height: 1.25rem;
}

.upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-red-600);
}

/* Lazy Loading */
.lazy-image {
  position: relative;
  overflow: hidden;
}

.lazy-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
}

.lazy-image-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.lazy-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image-img--loaded {
  opacity: 1;
}

/* Infinite Scroll */
.infinite-scroll-sentinel {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.infinite-scroll-end {
  text-align: center;
  padding: 2rem;
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 640px) {
  .step-progress {
    flex-direction: column;
  }
  
  .step-progress-connector {
    width: 2px;
    height: 2rem;
    margin: 0.5rem 0;
  }
  
  .upload-progress-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
```

## Best Practices

### Loading Design
- Use skeleton loaders for predictable content layouts
- Provide progress indicators for long-running operations
- Use appropriate loading states for different contexts
- Avoid blocking the entire interface when possible

### Performance
- Implement lazy loading for images and content
- Use intersection observers for efficient scroll detection
- Debounce rapid loading state changes
- Optimize skeleton loader animations

### User Experience
- Provide meaningful loading messages
- Show progress for file uploads and downloads
- Use consistent loading patterns across the application
- Allow users to cancel long-running operations