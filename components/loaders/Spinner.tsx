// Spinner.tsx
import React from 'react';

import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = '#3b82f6', // Default to blue
  className = '',
}) => {
  const sizeClass = `spinner--${size}`;

  return (
    <div
      className={`${styles.spinner} ${styles[sizeClass]} ${className}`}
      style={{ borderTopColor: color }}
      aria-label="Loading"
      role="status"
    >
      <span className={styles.visuallyHidden}>Loading...</span>
    </div>
  );
};

export default Spinner;
