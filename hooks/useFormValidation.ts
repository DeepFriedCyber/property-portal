// hooks/useFormValidation.ts
import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { validateForm, FormErrors, ValidationResult } from '@/lib/validation/form-validation';

interface UseFormValidationOptions<T> {
  initialValues: T;
  schema: z.ZodType<T>;
  onSubmit?: (data: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormValidationResult<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  setFieldError: (field: keyof T, error?: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => string | undefined;
  validateForm: () => boolean;
}

/**
 * Custom hook for form validation using Zod schemas
 * @param options Form validation options
 * @returns Form validation state and handlers
 */
export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
): UseFormValidationResult<T> {
  const {
    initialValues,
    schema,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true
  } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);
  
  // Validate the entire form
  const validateFormData = useCallback((): ValidationResult<T> => {
    return validateForm(schema, values);
  }, [schema, values]);
  
  // Check if the form is valid
  const isValid = Object.keys(errors).length === 0;
  
  // Validate a single field
  const validateField = useCallback((field: keyof T): string | undefined => {
    try {
      // Create a schema for just this field
      const fieldSchema = z.object({ [field]: schema.shape[field] });
      const result = fieldSchema.safeParse({ [field]: values[field] });
      
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const errorMessage = fieldErrors[field as string]?.[0];
        return errorMessage;
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error validating field ${String(field)}:`, error);
      return 'Validation error';
    }
  }, [schema, values]);
  
  // Set a field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      return newValues;
    });
    setIsDirty(true);
    
    if (validateOnChange) {
      const errorMessage = validateField(field);
      setErrors(prev => ({
        ...prev,
        [field]: errorMessage
      }));
    }
  }, [validateField, validateOnChange]);
  
  // Set a field as touched
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
    
    if (validateOnBlur && isTouched) {
      const errorMessage = validateField(field);
      setErrors(prev => ({
        ...prev,
        [field]: errorMessage
      }));
    }
  }, [validateField, validateOnBlur]);
  
  // Set a field error manually
  const setFieldError = useCallback((field: keyof T, error?: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);
  
  // Handle input change
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFieldValue(name as keyof T, parsedValue);
  }, [setFieldValue]);
  
  // Handle input blur
  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setFieldTouched(name as keyof T, true);
  }, [setFieldTouched]);
  
  // Validate the entire form
  const validateFormValues = useCallback(() => {
    const result = validateFormData();
    
    if (!result.success && result.errors) {
      setErrors(result.errors);
      return false;
    }
    
    setErrors({});
    return true;
  }, [validateFormData]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);
    
    // Validate the form
    const isValid = validateFormValues();
    
    if (!isValid || !onSubmit) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Set a generic form error
      setErrors(prev => ({
        ...prev,
        _form: 'An error occurred during submission. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateFormValues, onSubmit]);
  
  // Validate form when schema changes
  useEffect(() => {
    if (isDirty) {
      validateFormValues();
    }
  }, [schema, isDirty, validateFormValues]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    validateField,
    validateForm: validateFormValues
  };
}