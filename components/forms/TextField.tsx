// components/forms/TextField.tsx
import React from 'react';

import FormField from './FormField';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  helpText?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  className?: string;
  inputClassName?: string;
}

/**
 * Text input field with validation
 */
const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  label,
  error,
  touched,
  required,
  helpText,
  type = 'text',
  className = '',
  inputClassName = '',
  ...props
}) => {
  const showError = error && touched;

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
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${id}-error` : undefined}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
          ${showError ? 'border-red-300' : 'border-gray-300'}
          ${inputClassName}
        `}
        {...props}
      />
    </FormField>
  );
};

export default TextField;
