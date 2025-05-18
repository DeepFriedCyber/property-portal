import { NextRequest, NextResponse } from 'next/server'

import { ApiErrors } from '../helpers/apiErrorHelpers'

/**
 * User role types
 */
export enum UserRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
}

/**
 * Permission levels for different operations
 */
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

/**
 * Map of roles to their permission levels
 */
const rolePermissions: Record<UserRole, PermissionLevel[]> = {
  [UserRole.VIEWER]: [PermissionLevel.READ],
  [UserRole.EDITOR]: [PermissionLevel.READ, PermissionLevel.WRITE],
  [UserRole.ADMIN]: [
    PermissionLevel.READ,
    PermissionLevel.WRITE,
    PermissionLevel.DELETE,
    PermissionLevel.ADMIN,
  ],
}

/**
 * Map of HTTP methods to required permission levels
 */
const methodPermissions: Record<string, PermissionLevel> = {
  GET: PermissionLevel.READ,
  POST: PermissionLevel.WRITE,
  PATCH: PermissionLevel.WRITE,
  PUT: PermissionLevel.WRITE,
  DELETE: PermissionLevel.DELETE,
}

/**
 * Extract and verify the authentication token from the request
 * @param req The Next.js request
 * @returns The user information if authenticated, null otherwise
 */
async function verifyAuthToken(
  req: NextRequest
): Promise<{ userId: string; role: UserRole } | null> {
  // Get the authorization header
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  // TODO: Implement actual token verification with your auth provider
  // This is a placeholder implementation
  if (token === 'test-admin-token') {
    return { userId: 'admin-user-id', role: UserRole.ADMIN }
  } else if (token === 'test-editor-token') {
    return { userId: 'editor-user-id', role: UserRole.EDITOR }
  } else if (token === 'test-viewer-token') {
    return { userId: 'viewer-user-id', role: UserRole.VIEWER }
  }

  return null
}

/**
 * Check if a user has the required permission level
 * @param userRole The user's role
 * @param requiredPermission The required permission level
 * @returns Boolean indicating if the user has the required permission
 */
function hasPermission(userRole: UserRole, requiredPermission: PermissionLevel): boolean {
  return rolePermissions[userRole].includes(requiredPermission)
}

/**
 * Authentication middleware for API routes
 * @param handler The API route handler
 * @param options Configuration options for the middleware
 * @returns A wrapped handler with authentication checks
 */
export function withAuth(
  handler: (req: NextRequest, user: { userId: string; role: UserRole }) => Promise<NextResponse>,
  options: {
    requiredPermission?: PermissionLevel
    bypassAuth?: boolean
  } = {}
) {
  return async (req: NextRequest) => {
    // Skip authentication if bypassAuth is true
    if (options.bypassAuth) {
      // Use a default admin user for bypassed auth
      return handler(req, { userId: 'system', role: UserRole.ADMIN })
    }

    // Verify the authentication token
    const user = await verifyAuthToken(req)

    // If no user is found, return unauthorized
    if (!user) {
      return ApiErrors.unauthorized('Authentication required')
    }

    // Determine the required permission based on the HTTP method or options
    const requiredPermission =
      options.requiredPermission || methodPermissions[req.method] || PermissionLevel.READ

    // Check if the user has the required permission
    if (!hasPermission(user.role, requiredPermission)) {
      return ApiErrors.forbidden('You do not have permission to perform this action')
    }

    // Call the handler with the authenticated user
    return handler(req, user)
  }
}
