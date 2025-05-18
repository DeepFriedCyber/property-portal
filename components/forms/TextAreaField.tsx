// components/forms/TextAreaField.tsx
import React from 'react'

import FormField from './FormField'

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  name: string
  label: string
  error?: string
  touched?: boolean
  required?: boolean
  helpText?: string
  className?: string
  textareaClassName?: string
}

/**
 * Textarea field with validation
 */
const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  name,
  label,
  error,
  touched,
  required,
  helpText,
  className = '',
  textareaClassName = '',
  ...props
}) => {
  const showError = error && touched

  return (
    <FormField
      id={id}
      name={name}
      label={label}
      error={error}
      touched={touched}
      required={required}
      helpText={helpText}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        required={required}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${id}-error` : undefined}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
          ${showError ? 'border-red-300' : 'border-gray-300'}
          ${textareaClassName}
        `}
        {...props}
      />
    </FormField>
  )
}

export default TextAreaField
