// components/forms/SelectField.tsx
import React from 'react';
import FormField from './FormField';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  error?: string;
  touched?: boolean;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  className?: string;
  selectClassName?: string;
}

/**
 * Select field with validation
 */
const SelectField: React.FC<SelectFieldProps> = ({
  id,
  name,
  label,
  options,
  error,
  touched,
  required,
  helpText,
  placeholder,
  className = '',
  selectClassName = '',
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
      <select
        id={id}
        name={name}
        required={required}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${id}-error` : undefined}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
          ${showError ? 'border-red-300' : 'border-gray-300'}
          ${selectClassName}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default SelectField;