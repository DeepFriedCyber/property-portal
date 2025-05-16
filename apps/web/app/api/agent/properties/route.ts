import { auth } from '@clerk/nextjs/server';
import { db, schema } from '@root/lib/db';
import { getUploadRecordsByUploader, getPropertiesByUploadId } from '@root/lib/db/queries';
import { inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all uploads for this user
    const uploads = await getUploadRecordsByUploader(userId);

    // Extract upload IDs
    const uploadIds = uploads.map((upload: { id: string }) => upload.id);

    if (uploadIds.length === 0) {
      // If user has no uploads, return empty array
      return NextResponse.json({ properties: [] });
    }

    // Get all properties for these uploads in a single query
    const properties = await db
      .select()
      .from(schema.property)
      .where(inArray(schema.property.uploadId, uploadIds));

    return NextResponse.json({
      properties: properties,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ message: 'Failed to fetch properties' }, { status: 500 });
  }
}
