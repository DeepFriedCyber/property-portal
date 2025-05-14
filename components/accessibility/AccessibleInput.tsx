// AccessibleInput.tsx
import React, { useState } from 'react';

interface AccessibleInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  errorMessage?: string;
  className?: string;
  autoComplete?: string;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  pattern?: string;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '',
  helpText,
  errorMessage,
  className = '',
  autoComplete,
  maxLength,
  min,
  max,
  pattern
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate unique IDs for associated elements
  const helpTextId = helpText ? `${id}-help` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  
  // Combine IDs for aria-describedby
  const ariaDescribedby = [
    helpTextId,
    errorId
  ].filter(Boolean).join(' ') || undefined;
  
  // Determine if the input is in an error state
  const hasError = !!errorMessage;
  
  return (
    <div className={`form-field ${className} ${hasError ? 'has-error' : ''}`}>
      <label 
        htmlFor={id}
        className={required ? 'required-label' : ''}
      >
        {label}
        {required && (
          <span className="visually-hidden"> (required)</span>
        )}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-describedby={ariaDescribedby}
        aria-invalid={hasError}
        aria-required={required}
        className={hasError ? 'input-error' : ''}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        min={min}
        max={max}
        pattern={pattern}
      />
      
      {helpText && (
        <div id={helpTextId} className="help-text">
          {helpText}
        </div>
      )}
      
      {errorMessage && (
        <div 
          id={errorId} 
          className="error-message" 
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default AccessibleInput;