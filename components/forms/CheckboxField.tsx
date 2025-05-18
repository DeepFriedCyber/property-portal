// components/forms/CheckboxField.tsx
import React from 'react'

interface CheckboxFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  name: string
  label: string
  error?: string
  touched?: boolean
  required?: boolean
  helpText?: string
  className?: string
  labelClassName?: string
}

/**
 * Checkbox field with validation
 */
const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  name,
  label,
  error,
  touched,
  required,
  helpText,
  className = '',
  labelClassName = '',
  ...props
}) => {
  const showError = error && touched

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            name={name}
            type="checkbox"
            required={required}
            aria-invalid={showError ? 'true' : 'false'}
            aria-describedby={showError ? `${id}-error` : undefined}
            className={`
              h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500
              ${showError ? 'border-red-300' : 'border-gray-300'}
            `}
            {...props}
          />
        </div>

        <div className="ml-3 text-sm">
          <label htmlFor={id} className={`font-medium text-gray-700 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {helpText && !showError && <p className="text-gray-500">{helpText}</p>}
        </div>
      </div>

      {showError && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default CheckboxField
