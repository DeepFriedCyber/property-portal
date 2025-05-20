// lib/middleware/express.d.ts
import 'express';

declare module 'express' {
  interface Request {
    /**
     * Unique identifier for the request
     */
    id?: string;
    
    /**
     * Authenticated user information
     */
    user?: {
      id: string;
      email?: string;
      role?: string;
      [key: string]: unknown;
    };
  }
}