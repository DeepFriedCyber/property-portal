/**
 * Custom validation error class for handling form validation errors
 */
export class ValidationError extends Error {
  code: string;
  fieldErrors: Record<string, string>;

  constructor(
    message: string = 'Validation failed',
    code: string = 'VALIDATION_ERROR',
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.fieldErrors = fieldErrors;

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Validate form data and throw ValidationError if validation fails
 */
export function validateFormData<T extends Record<string, unknown>>(
  data: T,
  validationRules: Record<keyof T, (value: unknown) => string | null>
): T {
  const errors: Record<string, string> = {};

  // Check each field against its validation rule
  for (const [field, validate] of Object.entries(validationRules)) {
    const error = validate(data[field]);
    if (error) {
      errors[field] = error;
    }
  }

  // If there are any errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Form validation failed', 'VALIDATION_ERROR', errors);
  }

  // Return the validated data
  return data;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (value: unknown): string | null => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength:
    (min: number) =>
    (value: string): string | null => {
      if (!value) return null;
      if (value.length < min) {
        return `Must be at least ${min} characters`;
      }
      return null;
    },

  maxLength:
    (max: number) =>
    (value: string): string | null => {
      if (!value) return null;
      if (value.length > max) {
        return `Must be no more than ${max} characters`;
      }
      return null;
    },

  numeric: (value: string): string | null => {
    if (!value) return null;
    if (!/^\d+$/.test(value)) {
      return 'Must contain only numbers';
    }
    return null;
  },

  price: (value: string | number): string | null => {
    if (!value) return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue < 0) {
      return 'Please enter a valid price';
    }
    return null;
  },
};
