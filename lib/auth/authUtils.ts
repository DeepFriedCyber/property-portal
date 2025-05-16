import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Checks if a user has any of the allowed roles
 * @param sessionClaims The session claims object from Clerk auth
 * @param allowed Array of allowed role names
 * @returns Boolean indicating if the user has any of the allowed roles
 */
export function userHasRole(sessionClaims: any, allowed: string[]): boolean {
  const roles = (sessionClaims?.roles as string[]) || [];
  return roles.some((role) => allowed.includes(role));
}

/**
 * Validates user authentication and checks for specific roles
 * @param requiredRoles Array of roles that are allowed to access the resource
 * @returns Object containing authentication result and response (if auth failed)
 */
export async function validateUserRoles(requiredRoles: string[] = ['agent', 'admin']) {
  // Get the user ID and authentication data from Clerk
  const authResult = await auth();
  const userId = authResult.userId;
  const { sessionClaims } = authResult;

  // Check if user is authenticated
  if (!userId) {
    console.warn('Unauthorized access attempt');
    return {
      isAuthorized: false,
      userId: null,
      response: NextResponse.json(
        { message: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Check if user has any of the required roles
  const hasRequiredRole = userHasRole(sessionClaims, requiredRoles);

  if (!hasRequiredRole) {
    console.warn(`User ${userId} attempted access without required role`);
    return {
      isAuthorized: false,
      userId,
      response: NextResponse.json(
        {
          message: 'Forbidden - Insufficient permissions',
          details: `This action requires one of these roles: ${requiredRoles.join(', ')}`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    isAuthorized: true,
    userId,
    response: null,
  };
}

/**
 * Validates user authentication and role permissions for property uploads
 * @returns Object containing authentication result and response (if auth failed)
 */
export async function validateUserAuth() {
  // Use the more generic validateUserRoles function with default roles for property uploads
  return validateUserRoles(['agent', 'admin']);
}
