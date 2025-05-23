// lib/types/express.d.ts
import 'express'

declare global {
  namespace Express {
    interface Request {
      /**
       * Unique identifier for the request
       * Added by requestIdMiddleware in lib/middleware/errorHandler.ts
       */
      id?: string
    }
  }
}