# Loading States with Skeletons and Spinners

This guide explains how to implement loading states in your React components to improve user experience during data fetching operations.

## Available Components

### 1. Spinner

A simple spinning loader that indicates an ongoing process.

```jsx
import Spinner from './loaders/Spinner';

// Basic usage
<Spinner />

// With customization
<Spinner 
  size="large"     // 'small', 'medium', or 'large'
  color="#3b82f6"  // Any valid CSS color
  className="my-custom-class"
/>
```

### 2. Skeleton

A placeholder that mimics the shape of the content that will eventually appear.

```jsx
import Skeleton from './loaders/Skeleton';

// Basic usage
<Skeleton />

// With customization
<Skeleton 
  width={200}           // Number (px) or string (e.g., '50%')
  height={24}           // Number (px) or string
  borderRadius={4}      // Number (px) or string
  animation="pulse"     // 'pulse', 'wave', or 'none'
  className="my-custom-class"
/>
```

### 3. PropertyCardSkeleton

A pre-built skeleton specifically for property cards.

```jsx
import PropertyCardSkeleton from './loaders/PropertyCardSkeleton';

// Single skeleton
<PropertyCardSkeleton />

// Multiple skeletons
<PropertyCardSkeleton count={3} />
```

## Implementation Patterns

### Basic Loading State

```jsx
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spinner size="large" />;
  }

  return <div>{/* Render your data */}</div>;
};
```

### Skeleton Loading Pattern

```jsx
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        // Show skeletons while loading
        <div className="skeleton-container">
          <Skeleton height={32} width="50%" className="title-skeleton" />
          <Skeleton height={200} className="image-skeleton" />
          <Skeleton height={16} className="text-skeleton" />
          <Skeleton height={16} width="80%" className="text-skeleton" />
        </div>
      ) : (
        // Show actual content when loaded
        <div className="content">
          <h2>{data?.title}</h2>
          <img src={data?.imageUrl} alt={data?.title} />
          <p>{data?.description}</p>
        </div>
      )}
    </div>
  );
};
```

### Advanced Loading States

For more complex UIs, you can use a state machine approach:

```jsx
// Define possible loading states
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingState('loading');
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
        setLoadingState('success');
      } catch (error) {
        setError(error.message);
        setLoadingState('error');
      }
    };

    fetchData();
  }, []);

  // Render based on loading state
  if (loadingState === 'loading') {
    return <PropertyCardSkeleton count={3} />;
  }

  if (loadingState === 'error') {
    return <div className="error">{error}</div>;
  }

  if (loadingState === 'success') {
    return <div>{/* Render your data */}</div>;
  }

  return null; // 'idle' state
};
```

## Best Practices

1. **Match the skeleton to your content**: Make sure your skeleton placeholders closely resemble the actual content that will be loaded.

2. **Use animations sparingly**: Subtle animations like pulse or wave can make the loading state feel more dynamic, but too much animation can be distracting.

3. **Consider the loading duration**: For very quick operations (< 300ms), it might be better to not show a loading state at all to avoid flickering.

4. **Provide feedback for long operations**: For operations that take more than a few seconds, consider showing progress indicators or messages.

5. **Maintain layout stability**: Ensure that your page doesn't jump or reflow when content loads by giving skeletons the same dimensions as the expected content.

6. **Accessibility**: Make sure your loading states are accessible by using appropriate ARIA attributes.

## Example Implementation

See the `PropertyListingWithLoaders.tsx` component for a complete example of implementing loading states with both spinners and skeletons.