import React from 'react';
import clsx from 'clsx';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const buttonClassName = clsx(
    'px-4 py-2 rounded font-semibold transition-colors',
    {
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50': variant === 'primary' && !disabled,
      'bg-gray-200 text-black hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50': variant === 'secondary' && !disabled,
      'bg-gray-300 text-gray-500 cursor-not-allowed': disabled,
    },
    className
  );

  return (
    <button 
      onClick={onClick} 
      className={buttonClassName}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
export { Button };