// UseEffectExample.tsx
import React, { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
}

// Custom error types for better type checking
interface NetworkError extends Error {
  name: 'NetworkError';
}

interface TimeoutError extends Error {
  name: 'TimeoutError';
}

type ApiError = NetworkError | TimeoutError | Error;

// Fetch with timeout utility
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout = 8000
): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timed out') as TimeoutError;
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    const networkError = new Error('Network error occurred') as NetworkError;
    networkError.name = 'NetworkError';
    throw networkError;
  }
};

// Retry function with exponential backoff
const fetchWithRetry = async <T,>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300,
  timeout = 8000
): Promise<T> => {
  let lastError: ApiError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      const error = err as ApiError;
      lastError = error;
      
      // Don't retry if we've reached max retries
      if (attempt === retries) break;
      
      // Don't retry for certain status codes
      if (error.message.includes('Status: 404') || 
          error.message.includes('Status: 401')) {
        break;
      }
      
      // Wait with exponential backoff before retrying
      const delay = backoff * Math.pow(2, attempt);
      console.log(`Retrying fetch (${attempt + 1}/${retries}) after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

const UseEffectExample = () => {
  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  
  // State for selected user and their posts
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // State for window width (for resize event example)
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Retry handler for user data
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryTrigger(prev => prev + 1);
  }, []);

  // Retry handler for posts data
  const handlePostsRetry = useCallback(() => {
    setPostsError(null);
    // Re-trigger the posts fetch by resetting and setting the selectedUserId
    const currentId = selectedUserId;
    setSelectedUserId(null);
    setTimeout(() => setSelectedUserId(currentId), 100);
  }, [selectedUserId]);

  // Effect for fetching users (runs once on component mount)
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Using fetchWithRetry with timeout and retry logic
        const data = await fetchWithRetry<User[]>(
          'https://jsonplaceholder.typicode.com/users',
          { signal },
          2,  // 2 retries
          300, // 300ms initial backoff
          5000 // 5 second timeout
        );
        
        setUsers(data);
        setError(null);
      } catch (err) {
        // Type guard for different error types
        if (err instanceof Error) {
          // Don't update state if the request was aborted
          if (err.name === 'AbortError') {
            console.log('Users fetch aborted');
            return;
          }
          
          // Handle specific error types
          if (err.name === 'TimeoutError') {
            setError('Request timed out. Please check your connection and try again.');
          } else if (err.name === 'NetworkError') {
            setError('Network error occurred. Please check your connection and try again.');
          } else {
            setError('Failed to fetch users. Please try again later.');
          }
          
          console.error('Error fetching users:', err);
        } else {
          setError('An unknown error occurred. Please try again later.');
          console.error('Unknown error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Cleanup function (will run when component unmounts)
    return () => {
      controller.abort();
      console.log('Component unmounted, cleaning up user fetch resources');
    };
  }, [retryTrigger]); // Dependency on retryTrigger to allow manual retries

  // Effect for fetching posts when a user is selected
  useEffect(() => {
    // Skip if no user is selected
    if (selectedUserId === null) return;
    
    let isMounted = true; // Flag to prevent state updates if component unmounts
    const controller = new AbortController();
    const { signal } = controller;
    
    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);
        
        // Using fetchWithRetry with timeout and retry logic
        const data = await fetchWithRetry<Post[]>(
          `https://jsonplaceholder.typicode.com/posts?userId=${selectedUserId}`,
          { signal },
          2,  // 2 retries
          300, // 300ms initial backoff
          5000 // 5 second timeout
        );
        
        // Only update state if component is still mounted
        if (isMounted) {
          setUserPosts(data);
        }
      } catch (err) {
        if (isMounted) {
          // Type guard for different error types
          if (err instanceof Error) {
            // Don't update state if the request was aborted
            if (err.name === 'AbortError') {
              console.log('Posts fetch aborted');
              return;
            }
            
            // Handle specific error types
            if (err.name === 'TimeoutError') {
              setPostsError('Request timed out. Please check your connection and try again.');
            } else if (err.name === 'NetworkError') {
              setPostsError('Network error occurred. Please check your connection and try again.');
            } else {
              setPostsError('Failed to fetch posts. Please try again later.');
            }
            
            console.error('Error fetching posts:', err);
          } else {
            setPostsError('An unknown error occurred. Please try again later.');
            console.error('Unknown error:', err);
          }
        }
      } finally {
        if (isMounted) {
          setPostsLoading(false);
        }
      }
    };

    fetchUserPosts();

    // Cleanup function
    return () => {
      isMounted = false; // Prevent state updates if component unmounts
      controller.abort(); // Abort any in-progress fetch
      console.log(`Cleaning up posts fetch for user ${selectedUserId}`);
    };
  }, [selectedUserId]); // This effect runs when selectedUserId changes

  // Effect for window resize event (subscription example)
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('Removed resize event listener');
    };
  }, []); // Empty dependency array for one-time setup

  // Function to handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="use-effect-example">
      <h1>useEffect Examples</h1>
      
      <div className="window-width">
        <h2>Window Width (Resize Event Example)</h2>
        <p>Current window width: {windowWidth}px</p>
        <p className="hint">Try resizing your browser window</p>
      </div>

      <div className="users-section">
        <h2>Users (Data Fetching Example)</h2>
        
        {loading ? (
          <div className="loading-indicator">
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button 
              onClick={handleRetry} 
              className="retry-button"
              aria-label="Retry loading users"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="user-list">
            <p>Select a user to see their posts:</p>
            <ul>
              {users.map(user => (
                <li key={user.id}>
                  <button 
                    onClick={() => handleUserSelect(user.id)}
                    className={selectedUserId === user.id ? 'selected' : ''}
                  >
                    {user.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedUserId && (
        <div className="posts-section">
          <h2>Posts by User (Dependent Data Fetching)</h2>
          
          {postsLoading ? (
            <div className="loading-indicator">
              <p>Loading posts...</p>
            </div>
          ) : postsError ? (
            <div className="error-container">
              <div className="error-message">{postsError}</div>
              <button 
                onClick={handlePostsRetry} 
                className="retry-button"
                aria-label="Retry loading posts"
              >
                Retry
              </button>
            </div>
          ) : userPosts.length > 0 ? (
            <ul className="post-list">
              {userPosts.map(post => (
                <li key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts found for this user.</p>
          )}
        </div>
      )}

      <div className="notes">
        <h3>Notes on useEffect:</h3>
        <ul>
          <li>
            <strong>Empty dependency array []</strong>: Effect runs once after initial render
          </li>
          <li>
            <strong>With dependencies [dep1, dep2]</strong>: Effect runs when any dependency changes
          </li>
          <li>
            <strong>No dependency array</strong>: Effect runs after every render
          </li>
          <li>
            <strong>Return function</strong>: Cleanup logic that runs before next effect or unmount
          </li>
          <li>
            <strong>For SSR (Next.js)</strong>: Use getServerSideProps or getStaticProps instead
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UseEffectExample;