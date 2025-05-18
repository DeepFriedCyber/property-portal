// components/forms/FormField.tsx
import React from 'react'

interface FormFieldProps {
  id: string
  name: string
  label: string
  error?: string
  touched?: boolean
  required?: boolean
  children: React.ReactNode
  helpText?: string
  className?: string
}

/**
 * Form field wrapper component with label and error handling
 */
const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  error,
  touched,
  required,
  children,
  helpText,
  className = '',
}) => {
  const showError = error && touched

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {helpText && !showError && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}

      {showError && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
