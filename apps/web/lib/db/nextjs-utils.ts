import { NextRequest, NextResponse } from 'next/server'

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Standard API response format
 */
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  statusCode: number
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(data: T, statusCode: HttpStatus = HttpStatus.OK): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    statusCode,
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  details?: unknown
): NextResponse {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    statusCode,
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Higher-order function that wraps API handlers with database error handling
 */
export function withDatabaseHandler<T, Params extends unknown[] = []>(
  handler: (req: NextRequest, ...args: Params) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: Params): Promise<NextResponse> => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      console.error('Database operation failed:', error)

      return errorResponse(
        'DATABASE_ERROR',
        'An error occurred while processing your request',
        HttpStatus.INTERNAL_SERVER_ERROR,
        process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined
      )
    }
  }
}
