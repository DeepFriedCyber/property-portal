import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  onClick, 
  children 
}) => {
  const style = {
    padding: '8px 16px',
    backgroundColor: variant === 'primary' ? '#007bff' : '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };
  
  return (
    <button style={style} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;