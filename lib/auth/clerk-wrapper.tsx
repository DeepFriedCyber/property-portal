// lib/auth/clerk-wrapper.tsx
import { ClerkProvider, useUser as useClerkUser, SignedIn, SignedOut, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'

// Define the authentication state
interface AuthState {
  isLoaded: boolean
  isSignedIn: boolean | null
  isError: boolean
  errorMessage: string | null
  retryCount: number
  isRetrying: boolean
}

// Define the authentication context
interface AuthContextType {
  authState: AuthState
  user: ReturnType<typeof useClerkUser>['user'] | null
  retryAuth: () => void
  signOut: () => Promise<void>
  isAuthorized: (requiredRoles?: string[]) => boolean
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null)

// Custom hook to use the authentication context
export const useAuthWrapper = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthWrapper must be used within an AuthProvider')
  }
  return context
}

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: clerkLoaded, isSignedIn, user } = useClerkUser()
  const { signOut: clerkSignOut } = useAuth()
  const router = useRouter()

  // Authentication state
  const [authState, setAuthState] = useState<AuthState>({
    isLoaded: false,
    isSignedIn: null,
    isError: false,
    errorMessage: null,
    retryCount: 0,
    isRetrying: false,
  })

  // Maximum number of retry attempts
  const MAX_RETRY_ATTEMPTS = 3

  // Retry authentication
  const retryAuth = useCallback(() => {
    if (authState.retryCount >= MAX_RETRY_ATTEMPTS) {
      setAuthState(prev => ({
        ...prev,
        isError: true,
        errorMessage: 'Maximum retry attempts reached. Please refresh the page or try again later.',
        isRetrying: false,
      }))
      return
    }

    setAuthState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }))

    // Simulate a retry by forcing a re-render
    // In a real app, you might want to call a specific Clerk method to refresh the session
    setTimeout(() => {
      setAuthState(prev => ({
        ...prev,
        isRetrying: false,
      }))
    }, 1000)
  }, [authState.retryCount])

  // Sign out with error handling
  const handleSignOut = useCallback(async () => {
    try {
      if (clerkSignOut) {
        await clerkSignOut()
        router.push('/')
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // If sign out fails, we can still clear local state
      setAuthState(prev => ({
        ...prev,
        isSignedIn: false,
        isError: true,
        errorMessage: 'Failed to sign out properly. Please refresh the page.',
      }))
    }
  }, [clerkSignOut, router])

  // Check if user has required roles
  const isAuthorized = useCallback(
    (requiredRoles?: string[]) => {
      if (!isSignedIn || !user) return false
      if (!requiredRoles || requiredRoles.length === 0) return true

      // Get user roles from public metadata
      // This assumes roles are stored in publicMetadata.roles
      const userRoles = (user.publicMetadata?.roles as string[]) || []

      // Check if user has any of the required roles
      return requiredRoles.some(role => userRoles.includes(role))
    },
    [isSignedIn, user]
  )

  // Update auth state when Clerk state changes
  useEffect(() => {
    // If Clerk is still loading, don't update state yet
    if (!clerkLoaded) return

    setAuthState(prev => ({
      ...prev,
      isLoaded: true,
      isSignedIn,
      // Clear error state if authentication succeeds
      ...(isSignedIn && { isError: false, errorMessage: null }),
    }))
  }, [clerkLoaded, isSignedIn])

  // Handle offline/online status
  useEffect(() => {
    const handleOnline = () => {
      // When coming back online, check if we had an error and retry
      if (authState.isError) {
        retryAuth()
      }
    }

    const handleOffline = () => {
      // When going offline, set an appropriate error message
      setAuthState(prev => ({
        ...prev,
        isError: true,
        errorMessage: 'You are currently offline. Authentication services may be unavailable.',
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [authState.isError, retryAuth])

  // Context value
  const contextValue: AuthContextType = {
    authState,
    user,
    retryAuth,
    signOut: handleSignOut,
    isAuthorized,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Enhanced ClerkProvider with error handling
export const EnhancedClerkProvider: React.FC<{
  children: React.ReactNode
  publishableKey?: string
  appearance?: any
}> = ({ children, publishableKey, appearance }) => {
  return (
    <ClerkProvider publishableKey={publishableKey} appearance={appearance}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  )
}

// Authentication required component
export const AuthRequired: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredRoles?: string[]
}> = ({ children, fallback, requiredRoles }) => {
  const { authState, user, retryAuth, isAuthorized } = useAuthWrapper()

  // If still loading, show loading state
  if (!authState.isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  // If authentication error, show error state with retry button
  if (authState.isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">
            {authState.errorMessage || 'There was a problem authenticating your account.'}
          </p>
          <button
            onClick={retryAuth}
            disabled={authState.isRetrying}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {authState.isRetrying ? 'Retrying...' : 'Retry Authentication'}
          </button>
          <p className="mt-4 text-sm text-gray-600">
            If the problem persists, please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    )
  }

  // If not signed in, show fallback or default message
  if (!authState.isSignedIn) {
    return (
      <>
        <SignedOut>
          {fallback || (
            <div className="flex flex-col justify-center items-center min-h-screen p-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  Authentication Required
                </h2>
                <p className="text-blue-600 mb-4">Please sign in to access this page.</p>
                <a
                  href="/sign-in"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign In
                </a>
              </div>
            </div>
          )}
        </SignedOut>
      </>
    )
  }

  // If roles are required but user doesn't have them
  if (requiredRoles && requiredRoles.length > 0 && !isAuthorized(requiredRoles)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-yellow-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9"
            />
          </svg>
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Access Denied</h2>
          <p className="text-yellow-600 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  // If signed in and authorized, show children
  return <SignedIn>{children}</SignedIn>
}

// Export a hook for checking authorization
export const useAuthorization = () => {
  const { isAuthorized } = useAuthWrapper()
  return { isAuthorized }
}

// Export a hook for getting authentication state
export const useAuthentication = () => {
  const { authState, user, retryAuth, signOut } = useAuthWrapper()
  return {
    isLoaded: authState.isLoaded,
    isSignedIn: authState.isSignedIn,
    isError: authState.isError,
    errorMessage: authState.errorMessage,
    isRetrying: authState.isRetrying,
    user,
    retryAuth,
    signOut,
  }
}
