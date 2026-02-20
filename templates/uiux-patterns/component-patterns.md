# Component Patterns

## Button Component

### Basic Structure
```jsx
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  children,
  onClick,
  ...props 
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${disabled ? 'btn--disabled' : ''} ${loading ? 'btn--loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

### Variants
- **Primary**: Main call-to-action
- **Secondary**: Secondary actions
- **Tertiary**: Subtle actions
- **Danger**: Destructive actions

### States
- Default
- Hover
- Active
- Disabled
- Loading

## Input Component

### Text Input
```jsx
const Input = ({ 
  label, 
  error, 
  helperText, 
  required = false,
  ...props 
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        className={`input ${error ? 'input--error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
        {...props}
      />
      {error && <span id="error-message" className="error-message">{error}</span>}
      {helperText && !error && <span id="helper-text" className="helper-text">{helperText}</span>}
    </div>
  );
};
```

## Card Component

### Basic Card
```jsx
const Card = ({ 
  title, 
  subtitle, 
  children, 
  actions,
  variant = 'default',
  ...props 
}) => {
  return (
    <div className={`card card--${variant}`} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {actions && (
        <div className="card-actions">
          {actions}
        </div>
      )}
    </div>
  );
};
```

## Modal Component

### Modal Structure
```jsx
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  closeOnOverlay = true 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div 
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};
```

## Best Practices

### Component Design
- Keep components focused and single-purpose
- Use consistent naming conventions
- Provide sensible defaults
- Support all necessary props and states
- Include proper TypeScript types

### Accessibility
- Use semantic HTML elements
- Include proper ARIA attributes
- Support keyboard navigation
- Provide screen reader friendly labels
- Ensure sufficient color contrast

### Performance
- Use React.memo for expensive components
- Implement proper prop validation
- Avoid inline functions in render
- Use CSS-in-JS or CSS modules for styling