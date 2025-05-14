# Using `useEffect` for Side Effects in React

The `useEffect` hook allows you to perform side effects in function components. Side effects include data fetching, subscriptions, manual DOM manipulations, and more.

## Basic Syntax

```jsx
useEffect(() => {
  // Side effect code
  
  // Optional cleanup function
  return () => {
    // Cleanup code
  };
}, [dependencies]); // Optional dependency array
```

## Common Use Cases

### 1. Data Fetching

```jsx
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []); // Empty array means this runs once on mount
```

### 2. Subscriptions (Event Listeners)

```jsx
useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup: remove the event listener when component unmounts
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### 3. Dependent Data Fetching

```jsx
useEffect(() => {
  if (!userId) return; // Skip if no userId
  
  const fetchUserData = async () => {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    const userData = await response.json();
    setUser(userData);
  };
  
  fetchUserData();
}, [userId]); // Re-run when userId changes
```

### 4. Timers and Intervals

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  // Cleanup: clear the interval when component unmounts
  return () => {
    clearInterval(timer);
  };
}, []);
```

## Dependency Array Behaviors

- **No dependency array**: Effect runs after every render
  ```jsx
  useEffect(() => {
    // Runs after every render
  });
  ```

- **Empty dependency array `[]`**: Effect runs once after initial render
  ```jsx
  useEffect(() => {
    // Runs once after initial render
  }, []);
  ```

- **With dependencies `[dep1, dep2]`**: Effect runs when any dependency changes
  ```jsx
  useEffect(() => {
    // Runs when dep1 or dep2 changes
  }, [dep1, dep2]);
  ```

## Cleanup Function

The cleanup function runs before the component unmounts and before the effect runs again (if dependencies change).

```jsx
useEffect(() => {
  // Subscribe to something
  const subscription = someAPI.subscribe();
  
  // Cleanup function
  return () => {
    // Unsubscribe when component unmounts or before effect runs again
    subscription.unsubscribe();
  };
}, [dependencies]);
```

## Best Practices

1. **Always include dependencies**: Include all values from the component scope that change over time and are used by the effect.

2. **Use the ESLint plugin**: The `eslint-plugin-react-hooks` package helps ensure you're using the correct dependencies.

3. **Avoid infinite loops**: Be careful not to update state in an effect without proper dependencies.

4. **Split effects by concern**: Use multiple `useEffect` hooks for unrelated side effects.

5. **Handle race conditions**: For async operations, ensure you don't update state after the component unmounts.

   ```jsx
   useEffect(() => {
     let isMounted = true;
     
     const fetchData = async () => {
       const response = await fetch('/api/data');
       const data = await response.json();
       
       if (isMounted) {
         setData(data); // Only update state if component is still mounted
       }
     };
     
     fetchData();
     
     return () => {
       isMounted = false; // Set flag when component unmounts
     };
   }, []);
   ```

## Next.js Considerations

For server-side rendering in Next.js, consider using these alternatives instead of `useEffect`:

- **`getServerSideProps`**: Fetch data on each request
- **`getStaticProps`**: Fetch data at build time
- **`getStaticPaths`**: Specify dynamic routes to pre-render

These methods avoid the "flash of loading content" that can happen with client-side data fetching in `useEffect`.

## Example Component

See the `UseEffectExample.tsx` component for a complete demonstration of these patterns.