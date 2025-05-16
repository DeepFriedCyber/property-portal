// Skeleton.tsx
import React from 'react';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  className = '',
  animation = 'pulse',
}) => {
  const animationClass = animation !== 'none' ? styles[`skeleton--${animation}`] : '';

  return (
    <div
      className={`${styles.skeleton} ${animationClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
