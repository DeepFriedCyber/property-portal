# Error Boundary Component

This Error Boundary component prevents crashes in sub-components and provides user-friendly error messages.

## Basic Usage

Wrap any component that might throw an error with the ErrorBoundary component:

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className="app">
      <ErrorBoundary>
        <ComponentThatMightError />
      </ErrorBoundary>
    </div>
  );
}
```

## Advanced Usage

### Custom Fallback UI

You can provide a custom fallback UI to be displayed when an error occurs:

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const customFallback = (
    <div className="custom-error">
      <h2>Oops! Something went wrong.</h2>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );

  return (
    <div className="app">
      <ErrorBoundary fallback={customFallback}>
        <ComponentThatMightError />
      </ErrorBoundary>
    </div>
  );
}
```

### Error Handling

You can provide an error handler function to log or report errors:

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const handleError = (error, errorInfo) => {
    // Send error to your error reporting service
    console.error('Error caught:', error, errorInfo);
    // logErrorToService(error, errorInfo);
  };

  return (
    <div className="app">
      <ErrorBoundary onError={handleError}>
        <ComponentThatMightError />
      </ErrorBoundary>
    </div>
  );
}
```

## Best Practices

1. Use multiple Error Boundaries throughout your application to isolate errors to specific sections.
2. Place Error Boundaries at strategic locations where you want to prevent the entire UI from crashing.
3. Provide meaningful error messages to help users understand what went wrong.
4. Include a way for users to recover from errors (e.g., a refresh button).
5. Log errors to a monitoring service to track and fix issues.

## Limitations

Error Boundaries do not catch errors in:

- Event handlers
- Asynchronous code (e.g., `setTimeout` or `requestAnimationFrame` callbacks)
- Server-side rendering
- Errors thrown in the Error Boundary itself

For these cases, use traditional try-catch statements.