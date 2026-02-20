# Button Patterns

## Button Variants

### Primary Button
```jsx
const Button = ({ 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  ...props 
}) => {
  const buttonClass = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled && 'btn--disabled',
    loading && 'btn--loading',
    icon && 'btn--with-icon'
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="btn-spinner" />}
      {icon && iconPosition === 'left' && !loading && (
        <span className="btn-icon btn-icon--left">{icon}</span>
      )}
      <span className="btn-text">{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="btn-icon btn-icon--right">{icon}</span>
      )}
    </button>
  );
};
```

### Button Variants
```jsx
// Primary - Main call-to-action
<Button variant="primary">Save Changes</Button>

// Secondary - Secondary actions
<Button variant="secondary">Cancel</Button>

// Tertiary - Subtle actions
<Button variant="tertiary">Learn More</Button>

// Danger - Destructive actions
<Button variant="danger">Delete Account</Button>

// Ghost - Minimal styling
<Button variant="ghost">Skip</Button>

// Link - Text-only button
<Button variant="link">Forgot Password?</Button>
```

## Button Sizes

```jsx
// Small
<Button size="small">Small Button</Button>

// Medium (default)
<Button size="medium">Medium Button</Button>

// Large
<Button size="large">Large Button</Button>

// Extra Large
<Button size="xl">Extra Large Button</Button>
```

## Button States

### Loading State
```jsx
const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Button loading={loading} {...props}>
      {loading ? 'Processing...' : children}
    </Button>
  );
};

// Usage
<LoadingButton loading={isSubmitting} onClick={handleSubmit}>
  Submit Form
</LoadingButton>
```

### Disabled State
```jsx
<Button disabled>Disabled Button</Button>
<Button disabled variant="secondary">Disabled Secondary</Button>
```

## Icon Buttons

### Button with Icon
```jsx
import { PlusIcon, TrashIcon, EditIcon } from './icons';

// Icon on left
<Button icon={<PlusIcon />}>Add Item</Button>

// Icon on right
<Button icon={<ArrowRightIcon />} iconPosition="right">
  Continue
</Button>

// Icon only
<Button 
  icon={<EditIcon />} 
  aria-label="Edit item"
  variant="ghost"
  size="small"
/>
```

### Floating Action Button
```jsx
const FloatingActionButton = ({ icon, onClick, ...props }) => {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label="Add new item"
      {...props}
    >
      {icon}
    </button>
  );
};

// Usage
<FloatingActionButton 
  icon={<PlusIcon />}
  onClick={handleAdd}
/>
```

## Button Groups

### Horizontal Button Group
```jsx
const ButtonGroup = ({ children, variant = 'horizontal' }) => {
  return (
    <div className={`btn-group btn-group--${variant}`} role="group">
      {children}
    </div>
  );
};

// Usage
<ButtonGroup>
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</ButtonGroup>
```

### Segmented Control
```jsx
const SegmentedControl = ({ options, value, onChange }) => {
  return (
    <div className="segmented-control" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          className={`segmented-control-item ${
            value === option.value ? 'segmented-control-item--active' : ''
          }`}
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Usage
<SegmentedControl
  options={[
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'card', label: 'Card' }
  ]}
  value={viewMode}
  onChange={setViewMode}
/>
```

## Toggle Buttons

### Toggle Button
```jsx
const ToggleButton = ({ pressed, onToggle, children, ...props }) => {
  return (
    <button
      className={`btn-toggle ${pressed ? 'btn-toggle--pressed' : ''}`}
      aria-pressed={pressed}
      onClick={onToggle}
      {...props}
    >
      {children}
    </button>
  );
};

// Usage
<ToggleButton 
  pressed={isFavorite}
  onToggle={() => setIsFavorite(!isFavorite)}
>
  ⭐ Favorite
</ToggleButton>
```

### Switch Toggle
```jsx
const Switch = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`switch ${disabled ? 'switch--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="switch-input"
      />
      <span className="switch-slider"></span>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
};

// Usage
<Switch 
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
  label="Enable notifications"
/>
```

## Dropdown Button

```jsx
const DropdownButton = ({ 
  children, 
  items, 
  onItemClick,
  variant = 'primary' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown-btn">
      <Button
        variant={variant}
        onClick={() => setIsOpen(!isOpen)}
        icon={<ChevronDownIcon />}
        iconPosition="right"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {children}
      </Button>
      
      {isOpen && (
        <div className="dropdown-menu" role="menu">
          {items.map((item, index) => (
            <button
              key={index}
              className="dropdown-item"
              role="menuitem"
              onClick={() => {
                onItemClick(item);
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## CSS Styles

```css
/* Base Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button Variants */
.btn--primary {
  background: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.btn--secondary {
  background: white;
  color: var(--color-gray-700);
  border-color: var(--color-gray-300);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.btn--tertiary {
  background: transparent;
  color: var(--color-primary-600);
  border-color: transparent;
}

.btn--tertiary:hover:not(:disabled) {
  background: var(--color-primary-50);
}

.btn--danger {
  background: var(--color-red-600);
  color: white;
  border-color: var(--color-red-600);
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-red-700);
  border-color: var(--color-red-700);
}

.btn--ghost {
  background: transparent;
  color: var(--color-gray-600);
  border-color: transparent;
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-gray-100);
}

.btn--link {
  background: transparent;
  color: var(--color-primary-600);
  border-color: transparent;
  text-decoration: underline;
  padding: 0;
}

.btn--link:hover:not(:disabled) {
  color: var(--color-primary-700);
}

/* Button Sizes */
.btn--small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn--medium {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn--large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn--xl {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Button States */
.btn--disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--loading {
  cursor: wait;
}

.btn--loading .btn-text {
  opacity: 0.7;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Button Groups */
.btn-group {
  display: flex;
  gap: 0.5rem;
}

.btn-group--vertical {
  flex-direction: column;
}

.btn-group .btn:not(:last-child) {
  margin-right: -1px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group .btn:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--color-primary-600);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  z-index: 1000;
}

.fab:hover {
  background: var(--color-primary-700);
  transform: scale(1.05);
}

/* Segmented Control */
.segmented-control {
  display: inline-flex;
  background: var(--color-gray-100);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.segmented-control-item {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-gray-600);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.segmented-control-item--active {
  background: white;
  color: var(--color-gray-900);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Toggle Button */
.btn-toggle {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle--pressed {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-color: var(--color-primary-300);
}

/* Switch */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-input {
  position: absolute;
  opacity: 0;
}

.switch-slider {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: var(--color-gray-300);
  border-radius: 0.75rem;
  transition: background 0.2s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch-input:checked + .switch-slider {
  background: var(--color-primary-600);
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(1.5rem);
}
```

## Best Practices

### Button Design
- Use consistent button styles across the application
- Provide clear visual hierarchy with button variants
- Ensure sufficient touch target size (minimum 44px)
- Use loading states for async operations

### Accessibility
- Include descriptive button text or aria-labels
- Support keyboard navigation (Enter and Space keys)
- Provide proper focus indicators
- Use appropriate ARIA attributes for toggle buttons

### User Experience
- Use primary buttons sparingly (one per screen/section)
- Group related actions together
- Provide immediate feedback for button interactions
- Consider button placement and alignment