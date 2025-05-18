/**
 * @deprecated This API route is deprecated and will be removed in a future version.
 * Please use the server actions in @/app/actions/items.ts instead.
 *
 * Migration steps:
 * 1. Import the server actions from @/app/actions/items
 * 2. Use the createItem or getItems functions directly in your components
 * 3. For forms, use the action attribute with the server action
 */

import type { NextApiRequest, NextApiResponse } from 'next'

import { createItemSchema, CreateItemInput } from '@/lib/schemas/itemSchemas'

// Import our standardized response types
type ApiResponse<T = Record<string, unknown>> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}

// Dummy database or service
const itemsDb: CreateItemInput[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method === 'POST') {
    try {
      // 1. Validate the request body
      const validationResult = createItemSchema.safeParse(req.body)

      if (!validationResult.success) {
        // If validation fails, return 422 with error messages
        return res.status(422).json({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.flatten().fieldErrors,
          },
        })
      }

      // 2. Use the validated data (it's now type-safe!)
      const validatedData: CreateItemInput = validationResult.data

      // Simulate saving to database
      // Log data in development only
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Received valid data:', validatedData)
      }
      itemsDb.push(validatedData) // In a real app, you'd interact with Drizzle ORM here

      // Return standardized success response
      return res.status(201).json({
        success: true,
        data: {
          message: 'Item created successfully',
          item: validatedData,
        },
      })
    } catch (error: unknown) {
      // Catch any other unexpected errors during processing
      // eslint-disable-next-line no-console
      console.error('Error creating item:', error)
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  } else {
    // Method not allowed - standardized error response
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED',
      },
    })
  }
}
