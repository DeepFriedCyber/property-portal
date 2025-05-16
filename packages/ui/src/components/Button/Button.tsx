import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css'; // We'll create a basic CSS file

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const modeClass = `button--${variant}`;
  const sizeClass = `button--${size}`;
  const loadingClass = isLoading ? 'button--loading' : '';
  const disabledClass = disabled || isLoading ? 'button--disabled' : '';

  return (
    <button
      type="button"
      className={`button ${modeClass} ${sizeClass} ${loadingClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="button__loader"></span> : children}
    </button>
  );
};
