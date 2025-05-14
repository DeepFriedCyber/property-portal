import type { NextApiRequest, NextApiResponse } from 'next';
import { createItemSchema, CreateItemInput } from '@/lib/schemas/itemSchemas';

// Import our standardized response types
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

// Dummy database or service
const itemsDb: CreateItemInput[] = [];

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    try {
      // 1. Validate the request body
      const validationResult = createItemSchema.safeParse(req.body);

      if (!validationResult.success) {
        // If validation fails, return 422 with error messages
        return res.status(422).json({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.flatten().fieldErrors
          }
        });
      }

      // 2. Use the validated data (it's now type-safe!)
      const validatedData: CreateItemInput = validationResult.data;

      // Simulate saving to database
      console.log('Received valid data:', validatedData);
      itemsDb.push(validatedData); // In a real app, you'd interact with Drizzle ORM here

      // Return standardized success response
      return res.status(201).json({
        success: true,
        data: {
          message: 'Item created successfully',
          item: validatedData
        }
      });
    } catch (error) {
      // Catch any other unexpected errors during processing
      console.error('Error creating item:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  } else {
    // Method not allowed - standardized error response
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }
}