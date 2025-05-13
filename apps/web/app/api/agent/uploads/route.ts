import { NextRequest, NextResponse } from 'next/server';

// Mock data - would be replaced with database queries
const mockUploads = [
  {
    id: '1',
    uploaderId: 'user-123',
    filename: 'london-properties.csv',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    propertyCount: 42
  },
  {
    id: '2',
    uploaderId: 'user-123',
    filename: 'manchester-listings.csv',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    propertyCount: 18
  },
  {
    id: '3',
    uploaderId: 'user-123',
    filename: 'birmingham-properties.csv',
    status: 'rejected',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    propertyCount: 7
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Get the user ID from the session
    // 2. Query the database for uploads by this user
    // 3. Return the results
    
    // Mock user ID
    const userId = 'user-123';
    
    // Filter uploads by user ID (in a real app, this would be a database query)
    const userUploads = mockUploads.filter(upload => upload.uploaderId === userId);
    
    // Sort by date (newest first)
    userUploads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return NextResponse.json({
      uploads: userUploads.map(upload => ({
        ...upload,
        // Don't expose the uploaderId in the response
        uploaderId: undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { message: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}