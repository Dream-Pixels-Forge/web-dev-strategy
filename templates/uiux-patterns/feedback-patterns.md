# Feedback Patterns

## Toast Notifications

### Toast Component
```jsx
const Toast = ({ 
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  actions 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons = {
    success: <CheckCircleIcon />,
    error: <XCircleIcon />,
    warning: <ExclamationTriangleIcon />,
    info: <InformationCircleIcon />
  };

  return (
    <div className={`toast toast--${type}`} role="alert" aria-live="polite">
      <div className="toast-icon">
        {icons[type]}
      </div>
      
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
        
        {actions && (
          <div className="toast-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className="toast-action"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button 
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <XIcon />
      </button>
    </div>
  );
};
```

### Toast Container & Hook
```jsx
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  const { addToast } = context;

  return {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    ...context
  };
};

// Usage
const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong. Please try again.', {
      duration: 0, // Persistent
      actions: [
        { label: 'Retry', onClick: () => console.log('Retry') },
        { label: 'Report', onClick: () => console.log('Report') }
      ]
    });
  };
};
```

## Alert Components

### Alert Banner
```jsx
const Alert = ({ 
  type = 'info',
  title,
  children,
  onClose,
  actions,
  icon = true 
}) => {
  const icons = {
    success: <CheckCircleIcon />,
    error: <XCircleIcon />,
    warning: <ExclamationTriangleIcon />,
    info: <InformationCircleIcon />
  };

  return (
    <div className={`alert alert--${type}`} role="alert">
      {icon && (
        <div className="alert-icon">
          {icons[type]}
        </div>
      )}
      
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
        
        {actions && (
          <div className="alert-actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="link"
                size="small"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {onClose && (
        <button 
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <XIcon />
        </button>
      )}
    </div>
  );
};

// Usage Examples
<Alert type="success" title="Success!">
  Your changes have been saved successfully.
</Alert>

<Alert type="error" title="Error">
  There was a problem processing your request.
  <div className="mt-2">
    <Button variant="link" size="small">Try again</Button>
  </div>
</Alert>

<Alert 
  type="warning" 
  title="Storage Almost Full"
  actions={[
    { label: 'Upgrade Plan', onClick: () => {} },
    { label: 'Manage Storage', onClick: () => {} }
  ]}
  onClose={() => {}}
>
  You're using 95% of your storage space.
</Alert>
```

## Progress Indicators

### Progress Bar
```jsx
const ProgressBar = ({ 
  value, 
  max = 100,
  label,
  showPercentage = true,
  size = 'medium',
  variant = 'primary' 
}) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="progress-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      
      <div className={`progress-bar progress-bar--${size} progress-bar--${variant}`}>
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
};
```

### Circular Progress
```jsx
const CircularProgress = ({ 
  value, 
  max = 100,
  size = 120,
  strokeWidth = 8,
  showPercentage = true 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        <circle
          className="circular-progress-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circular-progress-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      
      {showPercentage && (
        <div className="circular-progress-text">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};
```

### Loading Spinner
```jsx
const Spinner = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div 
      className={`spinner spinner--${size} spinner--${color}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton Loader
const Skeleton = ({ width, height, className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

// Usage
<div className="card">
  <Skeleton width="100%" height="200px" className="mb-4" />
  <Skeleton width="60%" height="20px" className="mb-2" />
  <Skeleton width="80%" height="16px" />
</div>
```

## Status Indicators

### Badge Component
```jsx
const Badge = ({ 
  children,
  variant = 'default',
  size = 'medium',
  dot = false 
}) => {
  if (dot) {
    return <span className={`badge-dot badge-dot--${variant}`} />;
  }

  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {children}
    </span>
  );
};

// Usage Examples
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info" size="small">New</Badge>
<Badge dot variant="success" />
```

### Status Indicator
```jsx
const StatusIndicator = ({ 
  status,
  label,
  showLabel = true,
  size = 'medium' 
}) => {
  const statusConfig = {
    online: { color: 'green', label: 'Online' },
    offline: { color: 'gray', label: 'Offline' },
    busy: { color: 'red', label: 'Busy' },
    away: { color: 'yellow', label: 'Away' }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <div className="status-indicator">
      <div 
        className={`status-dot status-dot--${config.color} status-dot--${size}`}
        aria-label={config.label}
      />
      {showLabel && (
        <span className="status-label">
          {label || config.label}
        </span>
      )}
    </div>
  );
};
```

## Form Feedback

### Field Validation
```jsx
const ValidationMessage = ({ type, message, icon = true }) => {
  const icons = {
    error: <XCircleIcon />,
    warning: <ExclamationTriangleIcon />,
    success: <CheckCircleIcon />
  };

  return (
    <div className={`validation-message validation-message--${type}`}>
      {icon && (
        <span className="validation-icon">
          {icons[type]}
        </span>
      )}
      <span className="validation-text">{message}</span>
    </div>
  );
};
```

## CSS Styles

```css
/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  animation: toastSlideIn 0.3s ease-out;
}

@keyframes toastSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast--success { border-left-color: var(--color-green-500); }
.toast--error { border-left-color: var(--color-red-500); }
.toast--warning { border-left-color: var(--color-yellow-500); }
.toast--info { border-left-color: var(--color-blue-500); }

.toast-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.toast--success .toast-icon { color: var(--color-green-500); }
.toast--error .toast-icon { color: var(--color-red-500); }
.toast--warning .toast-icon { color: var(--color-yellow-500); }
.toast--info .toast-icon { color: var(--color-blue-500); }

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 0.25rem;
}

.toast-message {
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.toast-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.toast-action {
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.toast-close {
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.toast-close:hover {
  color: var(--color-gray-600);
}

/* Alert Components */
.alert {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
}

.alert--success {
  background: var(--color-green-50);
  border-color: var(--color-green-200);
  color: var(--color-green-800);
}

.alert--error {
  background: var(--color-red-50);
  border-color: var(--color-red-200);
  color: var(--color-red-800);
}

.alert--warning {
  background: var(--color-yellow-50);
  border-color: var(--color-yellow-200);
  color: var(--color-yellow-800);
}

.alert--info {
  background: var(--color-blue-50);
  border-color: var(--color-blue-200);
  color: var(--color-blue-800);
}

.alert-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}

/* Progress Indicators */
.progress-container {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gray-700);
}

.progress-bar {
  width: 100%;
  background: var(--color-gray-200);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar--small { height: 0.5rem; }
.progress-bar--medium { height: 0.75rem; }
.progress-bar--large { height: 1rem; }

.progress-fill {
  height: 100%;
  background: var(--color-primary-600);
  border-radius: inherit;
  transition: width 0.3s ease;
}

.progress-bar--success .progress-fill { background: var(--color-green-600); }
.progress-bar--warning .progress-fill { background: var(--color-yellow-600); }
.progress-bar--error .progress-fill { background: var(--color-red-600); }

/* Circular Progress */
.circular-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.circular-progress-track {
  fill: none;
  stroke: var(--color-gray-200);
}

.circular-progress-fill {
  fill: none;
  stroke: var(--color-primary-600);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.circular-progress-text {
  position: absolute;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
}

/* Loading Spinner */
.spinner {
  display: inline-block;
  border-radius: 50%;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary-600);
  animation: spin 1s linear infinite;
}

.spinner--small { width: 1rem; height: 1rem; }
.spinner--medium { width: 1.5rem; height: 1.5rem; }
.spinner--large { width: 2rem; height: 2rem; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Skeleton Loader */
.skeleton {
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.badge--small {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
}

.badge--large {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.badge--default {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
}

.badge--success {
  background: var(--color-green-100);
  color: var(--color-green-800);
}

.badge--warning {
  background: var(--color-yellow-100);
  color: var(--color-yellow-800);
}

.badge--error {
  background: var(--color-red-100);
  color: var(--color-red-800);
}

.badge--info {
  background: var(--color-blue-100);
  color: var(--color-blue-800);
}

.badge-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.badge-dot--success { background: var(--color-green-500); }
.badge-dot--warning { background: var(--color-yellow-500); }
.badge-dot--error { background: var(--color-red-500); }
.badge-dot--info { background: var(--color-blue-500); }

/* Status Indicator */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  border-radius: 50%;
}

.status-dot--small { width: 0.5rem; height: 0.5rem; }
.status-dot--medium { width: 0.75rem; height: 0.75rem; }
.status-dot--large { width: 1rem; height: 1rem; }

.status-dot--green { background: var(--color-green-500); }
.status-dot--red { background: var(--color-red-500); }
.status-dot--yellow { background: var(--color-yellow-500); }
.status-dot--gray { background: var(--color-gray-400); }

/* Validation Message */
.validation-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.validation-message--error {
  color: var(--color-red-600);
}

.validation-message--warning {
  color: var(--color-yellow-600);
}

.validation-message--success {
  color: var(--color-green-600);
}

.validation-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
  
  .toast {
    margin: 0;
  }
}
```

## Best Practices

### Feedback Design
- Use appropriate feedback types for different scenarios
- Provide clear, actionable messages
- Use consistent timing for auto-dismissing notifications
- Consider user context and urgency

### Accessibility
- Use proper ARIA attributes for screen readers
- Provide alternative text for icons
- Ensure sufficient color contrast
- Support keyboard navigation

### User Experience
- Don't overwhelm users with too many notifications
- Use progressive disclosure for complex feedback
- Provide undo actions when appropriate
- Test feedback patterns across different devices