# Form Patterns

## Form Structure

### Basic Form Layout
```jsx
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h2 className="form-title">Contact Us</h2>
        <p className="form-description">We'd love to hear from you</p>
      </div>
      
      <div className="form-body">
        <FormField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        
        <FormField
          label="Message"
          name="message"
          as="textarea"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          required
        />
      </div>
      
      <div className="form-footer">
        <Button 
          type="submit" 
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
};
```

## Form Field Components

### Input Field
```jsx
const FormField = ({ 
  label, 
  name, 
  type = 'text',
  as = 'input',
  error, 
  helperText,
  required = false,
  ...props 
}) => {
  const Component = as;
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="form-required" aria-label="required">*</span>}
      </label>
      
      <Component
        id={fieldId}
        name={name}
        type={type}
        className="form-input"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          [
            error ? errorId : null,
            helperText ? helperId : null
          ].filter(Boolean).join(' ') || undefined
        }
        {...props}
      />
      
      {error && (
        <span id={errorId} className="form-error" role="alert">
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span id={helperId} className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};
```

### Select Field
```jsx
const SelectField = ({ 
  label, 
  name, 
  options, 
  placeholder = 'Select an option',
  error,
  required = false,
  ...props 
}) => {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      
      <select
        id={name}
        name={name}
        className="form-select"
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
```

### Checkbox Field
```jsx
const CheckboxField = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error,
  required = false 
}) => {
  return (
    <div className={`form-field form-field--checkbox ${error ? 'form-field--error' : ''}`}>
      <label className="form-checkbox-label">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="form-checkbox"
          aria-invalid={error ? 'true' : 'false'}
          required={required}
        />
        <span className="form-checkbox-indicator"></span>
        <span className="form-checkbox-text">
          {label}
          {required && <span className="form-required">*</span>}
        </span>
      </label>
      
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
```

### Radio Group
```jsx
const RadioGroup = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  return (
    <fieldset className={`form-fieldset ${error ? 'form-fieldset--error' : ''}`}>
      <legend className="form-legend">
        {label}
        {required && <span className="form-required">*</span>}
      </legend>
      
      <div className="form-radio-group">
        {options.map((option) => (
          <label key={option.value} className="form-radio-label">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="form-radio"
              aria-invalid={error ? 'true' : 'false'}
            />
            <span className="form-radio-indicator"></span>
            <span className="form-radio-text">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
};
```

## Form Validation

### Validation Hook
```jsx
const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    setValues,
    setErrors
  };
};
```

### Validation Rules
```jsx
const validationRules = {
  name: [
    (value) => !value ? 'Name is required' : '',
    (value) => value.length < 2 ? 'Name must be at least 2 characters' : ''
  ],
  email: [
    (value) => !value ? 'Email is required' : '',
    (value) => !/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : ''
  ],
  password: [
    (value) => !value ? 'Password is required' : '',
    (value) => value.length < 8 ? 'Password must be at least 8 characters' : '',
    (value) => !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value) 
      ? 'Password must contain uppercase, lowercase, and number' : ''
  ],
  confirmPassword: [
    (value) => !value ? 'Please confirm your password' : '',
    (value, values) => value !== values.password ? 'Passwords do not match' : ''
  ]
};
```

## Multi-Step Forms

```jsx
const MultiStepForm = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="multi-step-form">
      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`progress-step ${index <= currentStep ? 'progress-step--completed' : ''}`}
            >
              <span className="progress-step-number">{index + 1}</span>
              <span className="progress-step-label">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-content">
        {steps[currentStep].component}
      </div>

      <div className="form-navigation">
        {currentStep > 0 && (
          <Button variant="secondary" onClick={prevStep}>
            Previous
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="submit">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};
```

## CSS Styles

```css
.form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

.form-required {
  color: var(--color-red-500);
  margin-left: 0.25rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field--error .form-input,
.form-field--error .form-select,
.form-field--error .form-textarea {
  border-color: var(--color-red-500);
}

.form-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-red-600);
}

.form-helper {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

/* Checkbox Styles */
.form-checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.form-checkbox {
  position: absolute;
  opacity: 0;
}

.form-checkbox-indicator {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-gray-300);
  border-radius: 0.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
  position: relative;
}

.form-checkbox:checked + .form-checkbox-indicator {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.form-checkbox:checked + .form-checkbox-indicator::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.875rem;
}

/* Radio Styles */
.form-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.form-radio {
  position: absolute;
  opacity: 0;
}

.form-radio-indicator {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-gray-300);
  border-radius: 50%;
  margin-right: 0.75rem;
  position: relative;
}

.form-radio:checked + .form-radio-indicator {
  border-color: var(--color-primary-500);
}

.form-radio:checked + .form-radio-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-primary-500);
  border-radius: 50%;
}
```

## Best Practices

### Form Design
- Use clear, descriptive labels
- Group related fields logically
- Provide helpful error messages
- Show validation feedback in real-time
- Use appropriate input types

### Accessibility
- Associate labels with form controls
- Use fieldsets for radio button groups
- Provide clear error messages
- Support keyboard navigation
- Include proper ARIA attributes

### User Experience
- Minimize required fields
- Use progressive disclosure for complex forms
- Provide clear submission feedback
- Save form progress when possible
- Use appropriate input constraints