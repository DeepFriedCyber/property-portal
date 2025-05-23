# Error Handling & Performance Guide

This document outlines the error handling and performance optimization strategies implemented in the Property Portal application.

## Error Handling

### Frontend Error Handling

1. **Global Error Boundary**
   - `GlobalErrorHandler`: Captures and logs all unhandled errors
   - `RouteErrorBoundary`: Handles route-specific errors
   - `EnhancedErrorBoundary`: Base error boundary component with customizable fallback UI
   - `global-error.tsx`: Next.js global error page for catastrophic errors

2. **Error Logging**
   - Structured logging with context and tags
   - Integration with Sentry for error tracking
   - Integration with LogRocket for session replay
   - Custom logger with different log levels (debug, info, warn, error, fatal)

### API Error Handling

1. **Error Middleware**
   - Standardized error response format
   - Custom `ApiError` class with helper methods
   - Handling of different error types (validation, authentication, etc.)
   - Request ID tracking for correlation

2. **Not Found Handler**
   - Catches requests to non-existent routes
   - Returns standardized 404 responses

## Performance Optimizations

### Image Optimization

1. **Next.js Image Configuration**
   - Automatic WebP/AVIF format conversion
   - Responsive image sizes
   - Image caching
   - Lazy loading

2. **OptimizedImage Component**
   - Progressive loading with blur-up effect
   - Error handling with fallback images
   - Aspect ratio preservation
   - Loading indicators

### Lazy Loading

1. **Component Lazy Loading**
   - Dynamic imports with Next.js
   - Custom `lazyLoad` utility
   - Configurable loading states
   - Delayed loaders to prevent flashes

### Code Splitting

1. **Webpack Configuration**
   - Vendor chunk splitting
   - Commons chunk for shared code
   - Dynamic imports for route-based code splitting

2. **Next.js Optimizations**
   - Server components
   - Optimistic client cache
   - SWC minification
   - Console removal in production

## Implementation Examples

### Using the Error Boundary

```tsx
<RouteErrorBoundary
  fallback={<CustomErrorComponent />}
  onError={(error) => trackError(error)}
>
  <YourComponent />
</RouteErrorBoundary>
```

### Using the OptimizedImage Component

```tsx
<OptimizedImage
  src="/images/property.jpg"
  alt="Property"
  width={800}
  height={600}
  lowQualitySrc="/images/property-low.jpg"
  fallbackSrc="/images/placeholder.jpg"
  aspectRatio={4/3}
/>
```

### Lazy Loading Components

```tsx
const LazyPropertyCard = lazyLoad(() => import('@/components/PropertyCard'), {
  ssr: false,
  loading: <PropertyCardSkeleton />,
  delay: 300,
});

// Use it like a regular component
<LazyPropertyCard property={property} />
```

### API Error Handling

```typescript
try {
  // Your code
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    throw ApiError.badRequest('Database error', error);
  }
  throw ApiError.internalServer('Something went wrong', error);
}
```

## Best Practices

1. **Always use error boundaries** for component-level error handling
2. **Log errors with context** to aid debugging
3. **Use OptimizedImage** instead of regular img tags
4. **Lazy load heavy components** that are not immediately visible
5. **Implement proper API error responses** with meaningful status codes and messages