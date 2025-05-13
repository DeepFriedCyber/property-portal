import type { NextApiRequest, NextApiResponse } from 'next';
import { createItemSchema, CreateItemInput } from '@/lib/schemas/itemSchemas'; // Adjust path if needed

// Dummy database or service
const itemsDb: CreateItemInput[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // 1. Validate the request body
      const validationResult = createItemSchema.safeParse(req.body);

      if (!validationResult.success) {
        // If validation fails, return 400 with error messages
        return res.status(400).json({
          message: 'Invalid request data',
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      // 2. Use the validated data (it's now type-safe!)
      const validatedData: CreateItemInput = validationResult.data;

      // Simulate saving to database
      console.log('Received valid data:', validatedData);
      itemsDb.push(validatedData); // In a real app, you'd interact with Drizzle ORM here

      return res.status(201).json({ message: 'Item created successfully', item: validatedData });
    } catch (error) {
      // Catch any other unexpected errors during processing
      console.error('Error creating item:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}