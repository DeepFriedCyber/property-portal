// lib/auth/api-auth.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error response type
interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Create an error response
 * @param message Error message
 * @param status HTTP status code
 * @param code Error code
 * @param details Additional error details
 * @returns NextResponse with error details
 */
export function errorResponse(
  message: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: any
): NextResponse {
  const error: ErrorResponse = {
    message,
  };

  if (code) error.code = code;
  if (details) error.details = details;

  return NextResponse.json({ error }, { status });
}

/**
 * Create a success response
 * @param data Response data
 * @param status HTTP status code
 * @returns NextResponse with data
 */
export function successResponse<T>(data: T, status: number = HttpStatus.OK): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Authentication options
 */
interface AuthOptions {
  requireAuth?: boolean;
  requiredRoles?: string[];
}

/**
 * Authenticated handler result
 */
interface AuthResult {
  userId: string | null;
  sessionClaims: any | null;
  roles: string[];
  isAuthenticated: boolean;
  isAuthorized: boolean;
  error?: NextResponse;
}

/**
 * Check authentication and authorization for an API route
 * @param req Next.js request
 * @param options Authentication options
 * @returns Authentication result
 */
export async function checkAuth(req: NextRequest, options: AuthOptions = {}): Promise<AuthResult> {
  const { requireAuth = true, requiredRoles = [] } = options;

  try {
    // Get authentication data from Clerk
    const authResult = await auth();
    const { userId, sessionClaims } = authResult;

    // Extract roles from session claims
    const roles = (sessionClaims?.roles as string[]) || [];

    // Check if user is authenticated
    const isAuthenticated = !!userId;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return {
        userId,
        sessionClaims,
        roles,
        isAuthenticated,
        isAuthorized: false,
        error: errorResponse('Authentication required', HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'),
      };
    }

    // Check if user has required roles
    const isAuthorized =
      !requiredRoles.length || roles.some((role) => requiredRoles.includes(role));

    // If user doesn't have required roles
    if (requireAuth && isAuthenticated && !isAuthorized) {
      return {
        userId,
        sessionClaims,
        roles,
        isAuthenticated,
        isAuthorized,
        error: errorResponse('Insufficient permissions', HttpStatus.FORBIDDEN, 'FORBIDDEN', {
          requiredRoles,
        }),
      };
    }

    // Authentication and authorization successful
    return {
      userId,
      sessionClaims,
      roles,
      isAuthenticated,
      isAuthorized,
    };
  } catch (error) {
    console.error('Authentication error:', error);

    // Return authentication error
    return {
      userId: null,
      sessionClaims: null,
      roles: [],
      isAuthenticated: false,
      isAuthorized: false,
      error: errorResponse(
        'Authentication service error',
        HttpStatus.SERVICE_UNAVAILABLE,
        'AUTH_SERVICE_ERROR'
      ),
    };
  }
}

/**
 * Higher-order function to wrap API route handlers with authentication
 * @param handler API route handler
 * @param options Authentication options
 * @returns Wrapped handler with authentication
 */
export function withAuth(
  handler: (req: NextRequest, authResult: AuthResult) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication
      const authResult = await checkAuth(req, options);

      // If authentication failed, return error response
      if (authResult.error) {
        return authResult.error;
      }

      // Call handler with authentication result
      return await handler(req, authResult);
    } catch (error) {
      console.error('API route error:', error);

      // Return generic error response
      return errorResponse(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR'
      );
    }
  };
}
