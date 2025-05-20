// apps/api/src/routes/users.ts
import { Router } from 'express';

import {
  BadRequest,
  NotFound,
  Unauthorized,
  Forbidden,
} from '../../../../lib/middleware/errorHandler';
import { createRateLimitMiddleware } from '../../../../lib/rate-limit/factory';
import { winstonLogger as logger } from '../../../../lib/logging/winston-logger';

const router = Router();

// Apply rate limiting to user routes
// Profile operations should be limited to prevent abuse
const profileLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  prefix: 'ratelimit:users:profile:',
});

/**
 * GET /api/users/me
 * Get the current user's profile
 */
router.get('/me', profileLimiter, (req, res, next) => {
  try {
    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required');
    }

    // Log the request
    logger.info('Fetching current user profile', {
      context: {
        userId: req.user.id,
        requestId: req.id,
      },
    });

    // Return user data
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get a user by ID (admin only)
 */
router.get('/:id', profileLimiter, (req, res, next) => {
  try {
    const { id } = req.params;

    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required');
    }

    // Check authorization (only admins can view other users)
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw Forbidden('You do not have permission to view this user');
    }

    // Log the request
    logger.info(`Fetching user with ID: ${id}`, {
      context: {
        targetUserId: id,
        requestingUserId: req.user.id,
        requestId: req.id,
      },
    });

    // Simulate fetching user from database
    const user = fetchUserById(id);

    // Handle not found case
    if (!user) {
      throw NotFound(`User with ID ${id} not found`);
    }

    // Return user data
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 * Update the current user's profile
 */
router.put('/me', profileLimiter, (req, res, next) => {
  try {
    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required');
    }

    // Extract update data
    const { name, email } = req.body;

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      throw BadRequest('Invalid email format');
    }

    // Create update object
    const updateData: Partial<User> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    // Log the update
    logger.info('Updating user profile', {
      context: {
        userId: req.user.id,
        updateFields: Object.keys(updateData),
        requestId: req.id,
      },
    });

    // Simulate updating user in database
    const updatedUser = updateUser(req.user.id, updateData);

    // Return updated user data
    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Export router
export default router;

// Helper functions

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Define user interface
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}

// Mock functions to simulate database operations
function fetchUserById(id: string): User | null {
  // Simulate not found for specific IDs
  if (id === 'not-found' || id === '404') {
    return null
  }

  // Return mock user data
  return {
    id,
    email: `user-${id}@example.com`,
    name: `User ${id}`,
    role: id === 'admin' ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  }
}

function updateUser(id: string, data: Partial<User>): User {
  // Get existing user
  const user = fetchUserById(id)
  
  if (!user) {
    throw new Error(`User with ID ${id} not found`)
  }

  // Return updated user
  return {
    ...user,
    ...data,
    id, // Ensure ID doesn't change
  }
}
