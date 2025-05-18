// lib/validation/form-validation.ts
import { z } from 'zod'

/**
 * Type for form validation errors
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>

/**
 * Type for form validation result
 */
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: FormErrors<T>
}

/**
 * Format Zod validation errors into a more user-friendly format for forms
 * @param error Zod error object
 * @returns Formatted error object with field paths and messages
 */
export function formatZodFormErrors<T>(error: z.ZodError): FormErrors<T> {
  const formattedErrors: Record<string, string> = {}

  error.errors.forEach(err => {
    const path = err.path.join('.')
    const fieldName = path || 'value'

    // Create more specific error messages based on error code
    let message = err.message

    switch (err.code) {
      case 'invalid_type':
        if (err.expected === 'string' && err.received === 'undefined') {
          message = 'This field is required'
        } else {
          message = `Expected ${err.expected}, received ${err.received}`
        }
        break
      case 'too_small':
        if (err.type === 'string') {
          if (err.minimum === 1) {
            message = 'This field cannot be empty'
          } else {
            message = `Must be at least ${err.minimum} characters`
          }
        } else if (err.type === 'number') {
          message = `Must be greater than or equal to ${err.minimum}`
        } else if (err.type === 'array') {
          message = `Must have at least ${err.minimum} item(s)`
        }
        break
      case 'too_big':
        if (err.type === 'string') {
          message = `Must be at most ${err.maximum} characters`
        } else if (err.type === 'number') {
          message = `Must be less than or equal to ${err.maximum}`
        } else if (err.type === 'array') {
          message = `Must have at most ${err.maximum} item(s)`
        }
        break
      case 'invalid_string':
        if (err.validation === 'email') {
          message = 'Must be a valid email address'
        } else if (err.validation === 'url') {
          message = 'Must be a valid URL'
        } else if (err.validation === 'uuid') {
          message = 'Must be a valid UUID'
        }
        break
      case 'invalid_enum_value':
        message = `Must be one of: ${err.options.map(o => `'${o}'`).join(', ')}`
        break
      case 'invalid_date':
        message = 'Must be a valid date'
        break
    }

    formattedErrors[fieldName] = message
  })

  return formattedErrors as FormErrors<T>
}

/**
 * Validate form data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Form data to validate
 * @returns Validation result with success flag, data, and errors
 */
export function validateForm<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data)
    return {
      success: true,
      data: validData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatZodFormErrors<T>(error),
      }
    }

    // For other errors, return a generic error
    return {
      success: false,
      errors: { _form: 'An unexpected error occurred during validation' } as FormErrors<T>,
    }
  }
}

/**
 * Create a form validator function for a specific schema
 * @param schema Zod schema to validate against
 * @returns Validator function that takes form data and returns validation result
 */
export function createFormValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): ValidationResult<T> => validateForm(schema, data)
}

/**
 * Validate a single form field against a Zod schema
 * @param schema Zod schema for the field
 * @param value Field value to validate
 * @returns Validation error message or undefined if valid
 */
export function validateField<T>(schema: z.ZodType<T>, value: unknown): string | undefined {
  try {
    schema.parse(value)
    return undefined
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatZodFormErrors<{ value: T }>(error)
      return errors.value
    }
    return 'Invalid value'
  }
}

/**
 * Common validation schemas for reuse
 */
export const ValidationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  url: z.string().url('Please enter a valid URL'),
  price: z.number().positive('Price must be a positive number'),
  integer: z.number().int('Must be a whole number'),
  positiveInteger: z.number().int('Must be a whole number').positive('Must be a positive number'),
  nonNegativeInteger: z
    .number()
    .int('Must be a whole number')
    .nonnegative('Must be zero or positive'),
  uuid: z.string().uuid('Invalid ID format'),
}
