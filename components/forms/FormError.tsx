// components/forms/FormError.tsx
import React from 'react'

interface FormErrorProps {
  error?: string
  className?: string
}

/**
 * Form-level error display component
 */
const FormError: React.FC<FormErrorProps> = ({ error, className = '' }) => {
  if (!error) return null

  return (
    <div
      className={`p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    </div>
  )
}

export default FormError
