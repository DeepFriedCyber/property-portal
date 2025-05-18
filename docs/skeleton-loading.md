# Skeleton Loading in Property Portal

This document explains the skeleton loading approach used in the Property Portal application.

## Overview

Skeleton loading is a UI pattern that shows a placeholder that resembles the page's layout while content is loading. This approach provides several benefits:

- **Perceived Performance**: Users perceive the application as faster because they see a visual representation of the content immediately
- **Reduced Layout Shifts**: The skeleton matches the final layout, preventing jarring layout shifts when content loads
- **Better User Experience**: Users can anticipate what content is loading, reducing cognitive load

## Implementation

### Skeleton Component

We've implemented a reusable `Skeleton` component that provides a consistent loading state across the application:

```tsx
// src/app/components/ui/Skeleton.tsx
'use client'

interface SkeletonProps {
  className?: string
  shimmer?: boolean
}

export function Skeleton({ className = '', shimmer = true }: SkeletonProps) {
  const baseClasses = 'relative rounded bg-gray-200 dark:bg-gray-800'
  const shimmerClasses = shimmer
    ? 'overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent'
    : ''

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
  )
}
```

### Shimmer Animation

The shimmer effect is implemented using a CSS animation that creates a subtle moving highlight across the skeleton elements. This animation is defined in the Tailwind configuration:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
}
```

## Usage

### Property Detail Skeleton

The property detail page uses a skeleton that matches the layout of the final content:

```tsx
function PropertyDetailSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
      {/* Image skeleton */}
      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/3" />

        {/* Additional skeleton elements... */}
      </div>
    </div>
  )
}
```

### Property List Skeleton

The property list page uses a skeleton that shows multiple property cards:

```tsx
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Property cards skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-8 flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}
```

## Integration with Next.js

Next.js provides several ways to show loading states:

1. **Page Loading**: Using a `loading.tsx` file in the same directory as the page
2. **Suspense Boundaries**: Using `<Suspense>` with a fallback component
3. **Route Groups**: Using route groups to share loading states

Our application uses all these approaches to provide a consistent loading experience.

## Best Practices

1. **Match the Final Layout**: Skeleton elements should closely match the size and position of the final content
2. **Use Consistent Styling**: Use the same styling for all skeleton elements
3. **Avoid Excessive Animation**: Keep animations subtle to avoid distracting users
4. **Support Dark Mode**: Ensure skeleton elements look good in both light and dark mode
5. **Accessibility**: Ensure loading states are properly announced to screen readers

## Comparison with Other Approaches

### Skeleton Loading vs. Spinners

Skeleton loading provides a better user experience than spinners because:

- It gives users a preview of the content structure
- It reduces perceived loading time
- It prevents layout shifts when content loads

### Skeleton Loading vs. Progress Bars

Skeleton loading is often better than progress bars for content-heavy pages because:

- It doesn't require calculating actual progress
- It provides more context about what's loading
- It creates a smoother transition to the final content

## Conclusion

Skeleton loading with shimmer effects provides an optimal loading experience for users of the Property Portal application. By using a consistent approach across the application, we create a polished and professional feel while improving perceived performance.
