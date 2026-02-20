# Accessibility Patterns

This template provides patterns for implementing accessible web applications following WCAG guidelines, including ARIA labels, keyboard navigation, and screen reader support.

## Semantic HTML Patterns

### 1. Proper HTML Structure
```javascript
// components/Article.jsx
function Article({ title, author, date, content }) {
  return (
    <article>
      <header>
        <h1>{title}</h1>
        <p>
          By <span>{author}</span> on <time dateTime={date}>{date}</time>
        </p>
      </header>
      <main>
        <p>{content}</p>
      </main>
      <footer>
        <nav aria-label="Article actions">
          <button>Share</button>
          <button>Save</button>
        </nav>
      </footer>
    </article>
  );
}

export default Article;
```

### 2. Landmark Regions
```javascript
// components/Layout.jsx
function Layout({ children }) {
  return (
    <>
      <header role="banner">
        <nav aria-label="Main navigation">
          {/* Navigation items */}
        </nav>
      </header>

      <main role="main" id="main-content">
        {children}
      </main>

      <aside role="complementary" aria-label="Sidebar">
        {/* Sidebar content */}
      </aside>

      <footer role="contentinfo">
        {/* Footer content */}
      </footer>
    </>
  );
}

export default Layout;
```

## ARIA Patterns

### 1. Button with ARIA
```javascript
// components/AccessibleButton.jsx
function AccessibleButton({ onClick, children, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={loading ? 'Loading...' : undefined}
    >
      {loading ? (
        <>
          <span aria-hidden="true">⏳</span>
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AccessibleButton;
```

### 2. Modal Dialog
```javascript
// components/Modal.jsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();

      // Trap focus within modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab') {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
```

### 3. Dropdown Menu
```javascript
// components/Dropdown.jsx
import { useState, useRef, useEffect } from 'react';

function Dropdown({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
      items?.[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  return (
    <div className="dropdown">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
      >
        {label}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          id="dropdown-menu"
          role="menu"
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => (
            <li key={index} role="none">
              <button
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                tabIndex={-1}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
```

## Form Accessibility

### 1. Accessible Form Input
```javascript
// components/FormInput.jsx
function FormInput({ id, label, error, required, type = 'text', ...props }) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>

      <input
        id={id}
        type={type}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : descriptionId}
        {...props}
      />

      {error && (
        <span id={errorId} role="alert" className="error">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormInput;
```

### 2. Accessible Form with Validation
```javascript
// components/AccessibleForm.jsx
import { useState } from 'react';
import FormInput from './FormInput';

function AccessibleForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Announce errors to screen readers
      setSubmitStatus('error');
      return;
    }

    try {
      // Submit form
      await submitForm(formData);
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>Contact Form</legend>

        {submitStatus === 'success' && (
          <div role="alert" className="success">
            Form submitted successfully!
          </div>
        )}

        {submitStatus === 'error' && Object.keys(errors).length > 0 && (
          <div role="alert" className="error">
            Please fix the errors below
          </div>
        )}

        <FormInput
          id="name"
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        <div className="form-group">
          <label htmlFor="message">
            Message <span aria-label="required">*</span>
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <span id="message-error" role="alert" className="error">
              {errors.message}
            </span>
          )}
        </div>

        <button type="submit">Submit</button>
      </fieldset>
    </form>
  );
}

export default AccessibleForm;
```

## Keyboard Navigation

### 1. Skip to Content Link
```javascript
// components/SkipLink.jsx
function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}

// CSS
// .skip-link {
//   position: absolute;
//   top: -40px;
//   left: 0;
//   background: #000;
//   color: #fff;
//   padding: 8px;
//   z-index: 100;
// }
//
// .skip-link:focus {
//   top: 0;
// }

export default SkipLink;
```

### 2. Keyboard Navigable Tabs
```javascript
// components/Tabs.jsx
import { useState, useRef } from 'react';

function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    setActiveTab(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={el => tabRefs.current[index] = el}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
```

## Screen Reader Support

### 1. Live Regions
```javascript
// components/LiveRegion.jsx
function LiveRegion({ message, politeness = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Usage
function SearchResults({ results, loading }) {
  return (
    <>
      <LiveRegion
        message={loading ? 'Loading results...' : `Found ${results.length} results`}
      />
      <div>
        {results.map(result => (
          <div key={result.id}>{result.title}</div>
        ))}
      </div>
    </>
  );
}

export default LiveRegion;
```

### 2. Screen Reader Only Text
```javascript
// components/ScreenReaderOnly.jsx
function ScreenReaderOnly({ children }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// CSS
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }

// Usage
function IconButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} aria-label={label}>
      <span aria-hidden="true">{icon}</span>
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </button>
  );
}

export default ScreenReaderOnly;
```

## Focus Management

### 1. Focus Trap Hook
```javascript
// hooks/useFocusTrap.js
import { useEffect, useRef } from 'react';

function useFocusTrap(isActive) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

export default useFocusTrap;
```

## Color Contrast and Visual Accessibility

```javascript
// utils/colorContrast.js
function getContrastRatio(color1, color2) {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color) {
  // Convert hex to RGB
  const rgb = hexToRgb(color);

  // Calculate relative luminance
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928
      ? val / 12.92
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : null;
}

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
function meetsWCAG(color1, color2, level = 'AA', isLargeText = false) {
  const ratio = getContrastRatio(color1, color2);
  const required = level === 'AAA'
    ? (isLargeText ? 4.5 : 7)
    : (isLargeText ? 3 : 4.5);

  return ratio >= required;
}

module.exports = { getContrastRatio, meetsWCAG };
```
