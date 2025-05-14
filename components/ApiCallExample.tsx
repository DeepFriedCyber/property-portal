// ApiCallExample.tsx
import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { 
  fetchWithRetry, 
  NetworkError, 
  TimeoutError, 
  ApiError,
  createCircuitBreaker,
  withCircuitBreaker
} from '../lib/api/fetchUtils';

interface Property {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  type: string;
}

// Create a circuit breaker for the properties API
const propertiesCircuitBreaker = createCircuitBreaker({
  name: 'properties-api',
  failureThreshold: 3,
  resetTimeout: 15000 // 15 seconds
});

const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [circuitStatus, setCircuitStatus] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>(
    propertiesCircuitBreaker.getStatus()
  );

  useEffect(() => {
    // Create an AbortController for cancelling the fetch request
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Check circuit breaker status and update UI
        const currentStatus = propertiesCircuitBreaker.getStatus();
        setCircuitStatus(currentStatus);
        
        if (currentStatus === 'OPEN') {
          setError('Service is temporarily unavailable. Please try again later.');
          setLoading(false);
          return;
        }
        
        // Using circuit breaker pattern with our fetch utility
        const data = await withCircuitBreaker(
          // Primary function
          () => fetchWithRetry<Property[]>(
            '/api/properties',
            { signal },
            3,  // 3 retries
            300, // 300ms initial backoff
            5000 // 5 second timeout
          ),
          // Circuit breaker
          propertiesCircuitBreaker,
          // Fallback function (optional - returns empty array if API is down)
          () => Promise.resolve([])
        );
        
        setProperties(data);
        setError(null);
        
        // Update circuit status after successful request
        setCircuitStatus(propertiesCircuitBreaker.getStatus());
      } catch (err) {
        // Type guard for different error types
        if (err instanceof TimeoutError) {
          setError('Request timed out. Please check your connection and try again.');
        } else if (err instanceof NetworkError) {
          setError('Network error occurred. Please check your connection and try again.');
        } else if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 403) {
            setError('You are not authorized to access this resource.');
          } else if (err.status === 404) {
            setError('The requested resource was not found.');
          } else if (err.status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(`API error: ${err.message}`);
          }
        } else if (err instanceof Error) {
          // Don't update state if the request was aborted
          if (err.name === 'AbortError') {
            console.log('Fetch aborted');
            return;
          }
          
          setError(`Error: ${err.message}`);
          console.error('Error fetching properties:', err);
        } else {
          setError('An unknown error occurred. Please try again later.');
          console.error('Unknown error:', err);
        }
        
        // Update circuit status after failed request
        setCircuitStatus(propertiesCircuitBreaker.getStatus());
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();

    // Cleanup function to abort fetch when component unmounts
    return () => {
      controller.abort();
      console.log('Property fetch aborted');
    };
  }, [retryCount]); // Dependency on retryCount to trigger refetch

  // Function to retry loading data with proper error handling
  const handleRetry = () => {
    setError(null);
    
    // If circuit is OPEN, try to reset it after the timeout period
    if (circuitStatus === 'OPEN') {
      const now = Date.now();
      const lastFailure = propertiesCircuitBreaker['lastFailure'] as unknown as number;
      const resetTimeout = 15000; // Same as in circuit breaker creation
      
      if (lastFailure && now - lastFailure > resetTimeout) {
        // Manually reset the circuit breaker for demonstration purposes
        propertiesCircuitBreaker.reset();
        setCircuitStatus(propertiesCircuitBreaker.getStatus());
      }
    }
    
    setRetryCount(prev => prev + 1); // Increment retry count to trigger useEffect
  };

  // Helper function to get circuit status badge
  const getCircuitStatusBadge = () => {
    let className = 'circuit-status';
    let label = '';
    
    switch (circuitStatus) {
      case 'CLOSED':
        className += ' closed';
        label = 'API: Healthy';
        break;
      case 'HALF_OPEN':
        className += ' half-open';
        label = 'API: Testing';
        break;
      case 'OPEN':
        className += ' open';
        label = 'API: Down';
        break;
    }
    
    return <div className={className}>{label}</div>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        {getCircuitStatusBadge()}
        <div className="loading-spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        {getCircuitStatusBadge()}
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          onClick={handleRetry} 
          className="retry-button"
          disabled={circuitStatus === 'OPEN'}
        >
          {circuitStatus === 'OPEN' ? 'Service Unavailable' : 'Try Again'}
        </button>
        {circuitStatus === 'OPEN' && (
          <p className="circuit-message">
            The service is temporarily unavailable. Please try again later.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="property-list">
      <div className="property-header">
        <h2>Available Properties</h2>
        {getCircuitStatusBadge()}
      </div>
      
      {properties.length === 0 ? (
        <div className="empty-state">
          <p>No properties found.</p>
          <button onClick={handleRetry} className="refresh-button">
            Refresh
          </button>
        </div>
      ) : (
        <ul>
          {properties.map(property => (
            <li key={property.id} className="property-card">
              <h3>{property.address}</h3>
              <p>Price: ${property.price.toLocaleString()}</p>
              <p>Bedrooms: {property.bedrooms}</p>
              <p>Type: {property.type}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Wrap the component with ErrorBoundary for additional safety
const ApiCallExample = () => {
  // Custom error handler for the ErrorBoundary
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to monitoring service or analytics in a real app
    console.error('Error caught by boundary in ApiCallExample:', error, errorInfo);
    
    // You could also reset the circuit breaker here if needed
    if (propertiesCircuitBreaker.getStatus() !== 'CLOSED') {
      console.log('Resetting circuit breaker due to React error');
      propertiesCircuitBreaker.reset();
    }
  };
  
  return (
    <div className="api-call-example">
      <h1>Property Listings</h1>
      <div className="api-description">
        <p>
          This component demonstrates robust API calls with timeout handling, 
          retry logic, and circuit breaker pattern.
        </p>
      </div>
      <ErrorBoundary 
        onError={handleError}
        fallback={
          <div className="error-fallback">
            <h3>Something went wrong</h3>
            <p>The property listing component encountered an error.</p>
            <button 
              onClick={() => window.location.reload()}
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
        }
      >
        <PropertyList />
      </ErrorBoundary>
    </div>
  );
};

export default ApiCallExample;