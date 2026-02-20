# Form Validation Patterns

This template provides patterns for implementing comprehensive form validation in web applications, covering both client-side and server-side validation techniques.

## Client-Side Validation Patterns

### 1. Basic Form Validation Hook
```javascript
// hooks/useFormValidation.js
import { useState, useCallback } from 'react';

export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value, allValues = values) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (rule.test && !rule.test(value, allValues)) {
        return rule.message;
      }
    }
    return '';
  }, [validationRules, values]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    for (const fieldName in validationRules) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm
  };
}

// Usage in component
function RegistrationForm() {
  const validationRules = {
    email: [
      { 
        test: (value) => value && value.length > 0, 
        message: 'Email is required' 
      },
      { 
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 
        message: 'Please enter a valid email' 
      }
    ],
    password: [
      { 
        test: (value) => value && value.length >= 8, 
        message: 'Password must be at least 8 characters' 
      },
      { 
        test: (value) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value), 
        message: 'Password must contain uppercase, lowercase, and number' 
      }
    ],
    confirmPassword: [
      { 
        test: (value, allValues) => value === allValues.password, 
        message: 'Passwords must match' 
      }
    ]
  };

  const { values, errors, handleChange, handleBlur, validateForm } = useFormValidation(
    { email: '', password: '', confirmPassword: '' },
    validationRules
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit form
      console.log('Form is valid', values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <div>
        <input
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>
      
      <button type="submit">Register</button>
    </form>
  );
}
```

### 2. Real-Time Validation with Debouncing
```javascript
// hooks/useRealTimeValidation.js
import { useState, useEffect, useCallback } from 'react';

export function useRealTimeValidation(initialValues, validationRules, debounceMs = 500) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});

  const validateField = useCallback(async (name, value) => {
    const rule = validationRules[name];
    if (!rule || !rule.asyncValidate) return '';

    setValidating(prev => ({ ...prev, [name]: true }));
    
    try {
      const error = await rule.asyncValidate(value);
      return error || '';
    } catch (error) {
      return 'Validation failed';
    } finally {
      setValidating(prev => ({ ...prev, [name]: false }));
    }
  }, [validationRules]);

  const debouncedValidation = useCallback((name, value) => {
    const timeoutId = setTimeout(() => {
      validateField(name, value).then(error => {
        setErrors(prev => ({ ...prev, [name]: error }));
      });
    }, debounceMs);

    return timeoutId;
  }, [validateField, debounceMs]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error immediately when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Set up debounced validation
    debouncedValidation(name, value);
  }, [errors, debouncedValidation]);

  return {
    values,
    errors,
    validating,
    handleChange
  };
}
```

### 3. Schema-Based Validation (using Yup)
```javascript
// schemas/userSchema.js
import * as yup from 'yup';

export const userSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  
  age: yup
    .number()
    .nullable()
    .positive('Age must be a positive number')
    .integer('Age must be an integer')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
  
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
    .required('Agreement is required')
});

// hooks/useYupValidation.js
import { useState, useCallback } from 'react';

export function useYupValidation(schema, initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async () => {
    setIsValidating(true);
    try {
      await schema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [schema, values]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isValidating,
    handleChange,
    validate,
    reset
  };
}
```

## Server-Side Validation Patterns

### 1. Express.js Validation with express-validator
```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const registerValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
      .bail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .bail()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .bail()
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .bail()
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name can only contain letters and spaces')
  ];
};

// Validation result handler
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  registerValidationRules,
  handleValidationResult
};
```

### 2. Validation Middleware Usage
```javascript
// routes/auth.js
const express = require('express');
const { 
  registerValidationRules, 
  handleValidationResult 
} = require('../middleware/validation');

const router = express.Router();

router.post(
  '/register',
  registerValidationRules(),
  handleValidationResult,
  async (req, res) => {
    try {
      // Validation has already passed
      const { email, password, firstName, lastName } = req.body;
      
      // Create user
      const user = await User.create({
        email,
        password, // Should be hashed
        firstName,
        lastName
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: { id: user.id, email: user.email }
      });
    } catch (error) {
      // Handle other errors (e.g., duplicate email)
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }
);

module.exports = router;
```

## Advanced Validation Patterns

### 1. Conditional Validation
```javascript
// utils/conditionalValidation.js
export const conditionalValidation = (conditions) => {
  return (values) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(conditions)) {
      for (const rule of rules) {
        // Check if condition is met
        if (rule.condition && !rule.condition(values)) {
          continue; // Skip validation if condition isn't met
        }
        
        // Apply validation rule
        if (rule.test && !rule.test(values[field], values)) {
          errors[field] = rule.message;
          break; // Stop at first error for this field
        }
      }
    }
    
    return errors;
  };
};

// Integration with form validation
export function useConditionalFormValidation(initialValues, conditionalRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const validator = conditionalValidation(conditionalRules);
    const newErrors = validator(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, conditionalRules]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => {
      const updated = { ...prev, [name]: value };
      // Re-validate affected fields when dependencies change
      const validator = conditionalValidation(conditionalRules);
      const newErrors = validator(updated);
      setErrors(newErrors);
      return updated;
    });
  }, [conditionalRules]);

  return {
    values,
    errors,
    handleChange,
    validateForm
  };
}
```

### 2. Cross-Field Validation
```javascript
// utils/crossFieldValidation.js
export const crossFieldValidation = (validationRules) => {
  return (values) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(validationRules)) {
      for (const rule of rules) {
        if (rule.crossFieldTest && !rule.crossFieldTest(values)) {
          errors[field] = rule.message;
          break;
        }
      }
    }
    
    return errors;
  };
};

// Usage
const crossFieldRules = {
  endDate: [
    {
      crossFieldTest: (values) => {
        const startDate = new Date(values.startDate);
        const endDate = new Date(values.endDate);
        return endDate >= startDate;
      },
      message: 'End date must be after start date'
    }
  ],
  newPassword: [
    {
      crossFieldTest: (values) => values.newPassword !== values.currentPassword,
      message: 'New password must be different from current password'
    }
  ]
};
```

### 3. Async Validation (Checking uniqueness)
```javascript
// hooks/useAsyncValidation.js
import { useState, useEffect, useRef } from 'react';

export function useAsyncValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [asyncErrors, setAsyncErrors] = useState({});
  const [validating, setValidating] = useState({});
  
  // Track ongoing validations to avoid race conditions
  const validationPromises = useRef(new Map());

  const runAsyncValidation = async (fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule || !rule.asyncValidator) return;

    const promiseId = Symbol();
    validationPromises.current.set(promiseId, fieldName);
    setValidating(prev => ({ ...prev, [fieldName]: true }));

    try {
      // Cancel previous validation for this field
      const currentPromises = Array.from(validationPromises.current.entries());
      currentPromises.forEach(([id, field]) => {
        if (field === fieldName && id !== promiseId) {
          validationPromises.current.delete(id);
        }
      });

      const isValid = await rule.asyncValidator(value);
      
      // Only update if this is the latest validation for this field
      if (validationPromises.current.get(promiseId) === fieldName) {
        if (!isValid) {
          setAsyncErrors(prev => ({ ...prev, [fieldName]: rule.asyncMessage }));
        } else {
          setAsyncErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      }
    } catch (error) {
      if (validationPromises.current.get(promiseId) === fieldName) {
        setAsyncErrors(prev => ({ ...prev, [fieldName]: 'Validation failed' }));
      }
    } finally {
      if (validationPromises.current.has(promiseId)) {
        validationPromises.current.delete(promiseId);
      }
      setValidating(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleChange = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear regular error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
    
    // Clear async error when user starts typing
    if (asyncErrors[fieldName]) {
      setAsyncErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
    
    // Run async validation after a delay
    setTimeout(() => {
      runAsyncValidation(fieldName, value);
    }, 500);
  };

  return {
    values,
    errors: { ...errors, ...asyncErrors },
    validating,
    handleChange
  };
}
```

## UI Validation Patterns

### 1. Validation Feedback Components
```javascript
// components/ValidationInput.jsx
import { useState, forwardRef } from 'react';

const ValidationInput = forwardRef(({ 
  name, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  error, 
  validating = false,
  required = false,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const showError = error && (!isFocused || !validating);
  const showValid = !error && value && !validating;

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className={`input-wrapper ${showError ? 'error' : ''} ${showValid ? 'valid' : ''}`}>
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur(name);
          }}
          {...props}
        />
        
        {validating && (
          <span className="validating-indicator">⏳</span>
        )}
        
        {showValid && (
          <span className="valid-indicator">✓</span>
        )}
      </div>
      
      {showError && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
});

// components/FormStatus.jsx
function FormStatus({ isValid, isSubmitting, errors }) {
  const errorCount = Object.keys(errors).filter(field => errors[field]).length;
  
  if (isSubmitting) {
    return <div className="form-status submitting">Submitting...</div>;
  }
  
  if (errorCount > 0) {
    return (
      <div className="form-status error">
        Please fix {errorCount} {errorCount === 1 ? 'error' : 'errors'} above
      </div>
    );
  }
  
  if (isValid) {
    return <div className="form-status valid">Form is valid</div>;
  }
  
  return null;
}
```

### 2. Validation Summary
```javascript
// components/ValidationSummary.jsx
function ValidationSummary({ errors, title = "Please fix the following:" }) {
  const errorFields = Object.keys(errors).filter(field => errors[field]);
  
  if (errorFields.length === 0) return null;
  
  return (
    <div className="validation-summary">
      <h4>{title}</h4>
      <ul>
        {errorFields.map(field => (
          <li key={field}>
            <a href={`#${field}`} onClick={(e) => {
              e.preventDefault();
              document.getElementById(field)?.scrollIntoView({ behavior: 'smooth' });
              document.getElementById(field)?.focus();
            }}>
              {field}: {errors[field]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

### 1. Validation Timing
- **Immediate validation**: For required fields when user leaves the field
- **Real-time validation**: For format validation as user types
- **Deferred validation**: For complex validations after form submission
- **Async validation**: For uniqueness checks with debouncing

### 2. User Experience
- Provide clear, actionable error messages
- Highlight invalid fields visually
- Show success indicators for valid fields
- Group related validation messages
- Allow users to fix errors without losing data

### 3. Security Considerations
- Always validate on the server regardless of client validation
- Sanitize and validate all user inputs
- Implement rate limiting for validation endpoints
- Don't expose sensitive validation details

### 4. Performance
- Debounce async validations to avoid excessive API calls
- Cache validation results when appropriate
- Validate only what's necessary for the current context
- Use efficient validation libraries

Following these form validation patterns will help create user-friendly, secure, and reliable forms in web applications.