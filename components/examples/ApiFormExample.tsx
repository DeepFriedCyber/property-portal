'use client';

import React, { useState } from 'react';
import { z } from 'zod';

import { TextField, FormError } from '@/components/forms';
import { useApi } from '@/hooks/useApi';
import { useFormValidation } from '@/hooks/useFormValidation';
import { ApiError } from '@/lib/api/error-handling';

// Define the form schema using Zod
const loginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Infer the form data type from the schema
type LoginFormData = z.infer<typeof loginFormSchema>;

// Initial form values
const initialValues: LoginFormData = {
  email: '',
  password: '',
};

/**
 * API form example component
 */
const ApiFormExample: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);

  // Use our API hook
  const api = useApi({
    onError: (error: ApiError) => {
      // Handle API errors
      if (error.isValidationError()) {
        // Get validation errors from the API
        const validationErrors = error.getValidationErrors();

        // Set field errors
        Object.entries(validationErrors).forEach(([field, message]) => {
          setFieldError(field as keyof LoginFormData, message);
        });
      } else {
        // Set a generic server error
        setServerError(error.message);
      }
    },
  });

  // Use our form validation hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
  } = useFormValidation({
    initialValues,
    schema: loginFormSchema,
    onSubmit: async (data) => {
      setServerError(null);

      // Simulate API call
      try {
        // This is a simulated API call that will always fail with validation errors
        // In a real app, you would use api.post('/api/login', data)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate a validation error from the API
        throw new ApiError('Validation failed', 422, 'VALIDATION_ERROR', {
          email: 'This email is not registered',
          password: 'Incorrect password',
        });
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.isValidationError()) {
            // Get validation errors from the API
            const validationErrors = error.getValidationErrors();

            // Set field errors
            Object.entries(validationErrors).forEach(([field, message]) => {
              setFieldError(field as keyof LoginFormData, message);
            });
          } else {
            // Set a generic server error
            setServerError(error.message);
          }
        } else {
          setServerError('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login Example</h2>

      {/* Form-level errors */}
      <FormError error={errors._form || serverError} />

      {/* API loading state */}
      {api.isLoading && (
        <div className="p-3 mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing request...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />

        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div className="pt-2">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting || api.isLoading}
          >
            {isSubmitting || api.isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p>This example demonstrates handling API validation errors.</p>
        <p className="mt-2">Try submitting the form to see simulated API validation errors.</p>
      </div>
    </div>
  );
};

export default ApiFormExample;
