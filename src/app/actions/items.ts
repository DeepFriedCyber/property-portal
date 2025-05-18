'use server'

import { revalidatePath } from 'next/cache'
import { createItemSchema, CreateItemInput } from '@/lib/schemas/itemSchemas'
import { z } from 'zod'

// Dummy database or service
const itemsDb: CreateItemInput[] = []

// Type for our standardized response
type ActionResponse<T = Record<string, unknown>> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}

/**
 * Create a new item using server action
 */
export async function createItem(
  formData: FormData | z.infer<typeof createItemSchema>
): Promise<ActionResponse> {
  try {
    // Handle both FormData and direct object input
    const rawData = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

    // Validate the input data
    const validationResult = createItemSchema.safeParse(rawData)

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
      }
    }

    // Use the validated data (it's now type-safe!)
    const validatedData: CreateItemInput = validationResult.data

    // Simulate saving to database
    // Log data in development only
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Received valid data:', validatedData)
    }

    itemsDb.push(validatedData) // In a real app, you'd interact with your database here

    // Revalidate any paths that display items
    revalidatePath('/items')

    // Return standardized success response
    return {
      success: true,
      data: {
        message: 'Item created successfully',
        item: validatedData,
      },
    }
  } catch (error: unknown) {
    // Catch any other unexpected errors during processing
    console.error('Error creating item:', error)
    return {
      success: false,
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      },
    }
  }
}

/**
 * Get all items
 */
export async function getItems(): Promise<ActionResponse> {
  try {
    return {
      success: true,
      data: {
        items: itemsDb,
      },
    }
  } catch (error: unknown) {
    console.error('Error fetching items:', error)
    return {
      success: false,
      error: {
        message: 'Failed to fetch items',
        code: 'FETCH_ERROR',
      },
    }
  }
}
