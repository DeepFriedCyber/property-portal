// utils/lazyLoad.tsx
'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

interface LazyLoadOptions {
  ssr?: boolean;
  loading?: React.ReactNode;
  delay?: number; // Delay in ms before showing the loading component
}

/**
 * Utility function to lazy load components with customizable loading state
 * @param importFunc Function that imports the component
 * @param options Configuration options
 * @returns Dynamically loaded component
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    ssr = false,
    loading = <DefaultLoadingComponent />,
    delay = 200,
  } = options;

  // Use Next.js dynamic import with the provided options
  const LazyComponent = dynamic(importFunc, {
    ssr,
    loading: delay > 0 ? () => <DelayedLoader delay={delay}>{loading}</DelayedLoader> : () => loading,
  });

  // Return a wrapped component that handles Suspense
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={loading}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Default loading component
function DefaultLoadingComponent() {
  return (
    <div className="flex items-center justify-center p-4 min-h-[100px] bg-gray-50 rounded-md">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}

// Component that delays showing the loading state to prevent flashes
function DelayedLoader({ children, delay }: { children: React.ReactNode; delay: number }) {
  const [shouldShow, setShouldShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return shouldShow ? <>{children}</> : null;
}

/**
 * Example usage:
 * 
 * // Import the component lazily
 * const LazyPropertyCard = lazyLoad(() => import('@/components/PropertyCard'), {
 *   ssr: false,
 *   loading: <PropertyCardSkeleton />,
 *   delay: 300,
 * });
 * 
 * // Use it like a regular component
 * <LazyPropertyCard property={property} />
 */