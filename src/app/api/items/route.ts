import { NextResponse } from 'next/server';
import { createItemSchema, CreateItemInput } from '@/lib/schemas/itemSchemas'; // Adjust path if needed

// Dummy database or service
const itemsDb: CreateItemInput[] = [];

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    // 1. Validate the request body
    const validationResult = createItemSchema.safeParse(requestBody);

    if (!validationResult.success) {
      // If validation fails, return 400 with error messages
      return NextResponse.json(
        {
          message: 'Invalid request data',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Use the validated data (it's now type-safe!)
    const validatedData: CreateItemInput = validationResult.data;

    // Simulate saving to database
    console.log('Received valid data:', validatedData);
    itemsDb.push(validatedData); // In a real app, you'd interact with Drizzle ORM here

    return NextResponse.json({ message: 'Item created successfully', item: validatedData }, { status: 201 });
  } catch (error: any) {
    // Catch errors from request.json() or other unexpected errors
    console.error('Error creating item:', error);
    if (error instanceof SyntaxError) { // Handle JSON parsing errors specifically
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}