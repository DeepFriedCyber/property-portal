// AccessibleForm.tsx
import React, { useState } from 'react';

import AccessibleButton from './AccessibleButton';
import AccessibleInput from './AccessibleInput';

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: (value: string) => string | undefined;
  autoComplete?: string;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  pattern?: string;
}

interface AccessibleFormProps {
  fields: FormField[];
  onSubmit: (formData: Record<string, string>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  title?: string;
  description?: string;
  className?: string;
  initialValues?: Record<string, string>;
  loading?: boolean;
}

const AccessibleForm: React.FC<AccessibleFormProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  title,
  description,
  className = '',
  initialValues = {},
  loading = false,
}) => {
  // Initialize form values from initialValues or empty strings
  const [formValues, setFormValues] = useState<Record<string, string>>(
    fields.reduce(
      (values, field) => {
        values[field.id] = initialValues[field.id] || '';
        return values;
      },
      {} as Record<string, string>
    )
  );

  // Track validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track if form has been submitted
  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (id: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: '',
      }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      // Check required fields
      if (field.required && !formValues[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
        isValid = false;
      }
      // Run custom validation if provided
      else if (field.validation && formValues[field.id]) {
        const error = field.validation(formValues[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      onSubmit(formValues);
    } else {
      // Focus the first field with an error
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      firstErrorField?.focus();

      // Announce errors to screen readers
      const errorCount = Object.keys(errors).length;
      const errorMessage = `Form contains ${errorCount} error${
        errorCount > 1 ? 's' : ''
      }. Please correct and try again.`;

      // Use aria-live region to announce errors
      const liveRegion = document.getElementById('form-errors-live');
      if (liveRegion) {
        liveRegion.textContent = errorMessage;
      }
    }
  };

  return (
    <div className={`accessible-form-container ${className}`}>
      {/* Hidden live region for announcing errors */}
      <div id="form-errors-live" className="visually-hidden" aria-live="assertive"></div>

      <form
        onSubmit={handleSubmit}
        className="accessible-form"
        noValidate // Disable browser validation to handle it ourselves
      >
        {title && <h2 className="form-title">{title}</h2>}

        {description && (
          <p id="form-description" className="form-description">
            {description}
          </p>
        )}

        <div className="form-fields">
          {fields.map((field) => (
            <AccessibleInput
              key={field.id}
              id={field.id}
              label={field.label}
              type={field.type}
              value={formValues[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
              helpText={field.helpText}
              errorMessage={submitted ? errors[field.id] : undefined}
              autoComplete={field.autoComplete}
              maxLength={field.maxLength}
              min={field.min}
              max={field.max}
              pattern={field.pattern}
            />
          ))}
        </div>

        <div className="form-actions">
          <AccessibleButton
            type="submit"
            disabled={loading}
            className="submit-button"
            aria-busy={loading ? 'true' : 'false'}
          >
            {loading ? 'Submitting...' : submitLabel}
          </AccessibleButton>

          {onCancel && (
            <AccessibleButton
              type="button"
              onClick={onCancel}
              className="cancel-button"
              variant="outline"
              disabled={loading}
            >
              {cancelLabel}
            </AccessibleButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default AccessibleForm;
