// AccessibleButton.tsx
import React from 'react';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaPressed?: boolean;
  ariaDescribedby?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  ariaDescribedby,
  disabled = false,
  className = '',
  type = 'button',
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left'
}) => {
  // Determine if we need to use aria-label
  // If the button only contains an icon and no text, aria-label is required
  const needsAriaLabel = !children && icon && !ariaLabel;
  
  if (needsAriaLabel) {
    console.warn('AccessibleButton: Buttons with only icons must have an aria-label');
  }
  
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      aria-describedby={ariaDescribedby}
    >
      {icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default AccessibleButton;