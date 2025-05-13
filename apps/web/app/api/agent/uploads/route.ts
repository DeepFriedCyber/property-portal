import { NextRequest, NextResponse } from 'next/server';
import { getUploadRecordsByUploader, countPropertiesByUploadId } from '@/lib/db/queries';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all uploads for this user from the database
    const uploads = await getUploadRecordsByUploader(userId);
    
    // For each upload, get the property count
    const uploadsWithCounts = await Promise.all(
      uploads.map(async (upload) => {
        const propertyCount = await countPropertiesByUploadId(upload.id);
        return {
          ...upload,
          propertyCount,
          // Don't expose the uploaderId in the response
          uploaderId: undefined
        };
      })
    );
    
    return NextResponse.json({
      uploads: uploadsWithCounts
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { message: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}