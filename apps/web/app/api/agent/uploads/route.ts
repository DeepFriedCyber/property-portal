import { NextRequest, NextResponse } from 'next/server';

import { withAuth, successResponse, errorResponse, HttpStatus } from '@/lib/auth/api-auth';
import {
  getUploadRecordsByUploader,
  countPropertiesByUploadId,
  UploadRecord,
} from '@/lib/db/queries';

// Enhanced GET handler with proper authentication and error handling
export const GET = withAuth(
  async (req: NextRequest, authResult: { userId: string | null }) => {
    try {
      const { userId } = authResult;

      // Get all uploads for this user from the database
      const uploads = await getUploadRecordsByUploader(userId!);

      // For each upload, get the property count with error handling
      const uploadsWithCounts = await Promise.all(
        uploads.map(async (upload: UploadRecord) => {
          try {
            const propertyCount = await countPropertiesByUploadId(upload.id);
            return {
              ...upload,
              propertyCount,
              // Don't expose the uploaderId in the response
              uploaderId: undefined,
            };
          } catch (error) {
            console.error(`Error getting property count for upload ${upload.id}:`, error);
            // Return the upload with count 0 if there's an error
            return {
              ...upload,
              propertyCount: 0,
              countError: true,
              // Don't expose the uploaderId in the response
              uploaderId: undefined,
            };
          }
        })
      );

      return successResponse({
        uploads: uploadsWithCounts,
      });
    } catch (error) {
      console.error('Error fetching uploads:', error);
      return errorResponse(
        'Failed to fetch uploads',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'FETCH_ERROR',
        { message: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },
  // Authentication options
  {
    requireAuth: true,
    requiredRoles: ['agent', 'admin'],
  }
);
