'use client';

interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
}

export function Skeleton({ className = '', shimmer = true }: SkeletonProps) {
  const baseClasses = 'relative rounded bg-gray-200 dark:bg-gray-800';
  const shimmerClasses = shimmer
    ? 'overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent'
    : '';

  return (
    <div
      className={`${baseClasses} ${shimmerClasses} ${className}`}
      style={{
        ...(shimmer && {
          '--shimmer-animation': 'shimmer 1.5s infinite',
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
        }),
      }}
    />
  );
}
