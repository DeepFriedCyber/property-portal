import { NextRequest, NextResponse } from 'next/server';
import { getUploadRecordsByUploader, getPropertiesByUploadId } from '../../../../../lib/db/queries';
import { db, schema } from '../../../../../lib/db';
import { inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would get the user ID from the session
    // For now, we'll use a placeholder
    const userId = 'user-123';
    
    // Get all uploads for this user
    const uploads = await getUploadRecordsByUploader(userId);
    
    // Extract upload IDs
    const uploadIds = uploads.map(upload => upload.id);
    
    if (uploadIds.length === 0) {
      // If user has no uploads, return empty array
      return NextResponse.json({ properties: [] });
    }
    
    // Get all properties for these uploads in a single query
    const properties = await db.select()
      .from(schema.property)
      .where(inArray(schema.property.uploadId, uploadIds));
    
    return NextResponse.json({
      properties: properties
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { message: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}