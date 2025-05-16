// ErrorBoundaryExample.tsx
import React from 'react';

import ErrorBoundary from './ErrorBoundary';

// Example component that might throw an error
const BuggyCounter = () => {
  const [counter, setCounter] = React.useState(0);

  const handleClick = () => {
    setCounter((prevCounter) => prevCounter + 1);
  };

  if (counter === 5) {
    // Simulate an error when counter reaches 5
    throw new Error('I crashed when counter reached 5!');
  }

  return (
    <div>
      <p>Counter: {counter}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};

// Custom fallback UI
const CustomFallback = () => (
  <div style={{ padding: '20px', border: '1px solid #f44336', borderRadius: '4px' }}>
    <h3 style={{ color: '#f44336' }}>Oops! Something went wrong</h3>
    <p>We're sorry for the inconvenience. Our team has been notified.</p>
    <button onClick={() => window.location.reload()}>Refresh Page</button>
  </div>
);

// Example of how to use ErrorBoundary
const ErrorBoundaryExample = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you might send this to an error reporting service
    console.error('Caught an error:', error, errorInfo);
  };

  return (
    <div>
      <h1>Error Boundary Example</h1>

      {/* Basic usage */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Basic Error Boundary</h2>
        <ErrorBoundary>
          <BuggyCounter />
        </ErrorBoundary>
      </div>

      {/* With custom fallback UI */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Error Boundary with Custom Fallback</h2>
        <ErrorBoundary fallback={<CustomFallback />}>
          <BuggyCounter />
        </ErrorBoundary>
      </div>

      {/* With error handler */}
      <div>
        <h2>Error Boundary with Error Handler</h2>
        <ErrorBoundary onError={handleError}>
          <BuggyCounter />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ErrorBoundaryExample;
