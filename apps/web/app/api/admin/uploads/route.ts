import { NextRequest, NextResponse } from 'next/server'

// Mock data - would be replaced with database queries
const mockUploads = [
  {
    id: '1',
    uploaderId: 'user-123',
    uploaderName: 'John Smith',
    filename: 'london-properties.csv',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    propertyCount: 42,
  },
  {
    id: '2',
    uploaderId: 'user-123',
    uploaderName: 'John Smith',
    filename: 'manchester-listings.csv',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    propertyCount: 18,
  },
  {
    id: '3',
    uploaderId: 'user-123',
    uploaderName: 'John Smith',
    filename: 'birmingham-properties.csv',
    status: 'rejected',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    propertyCount: 7,
  },
  {
    id: '4',
    uploaderId: 'user-456',
    uploaderName: 'Sarah Johnson',
    filename: 'edinburgh-listings.csv',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    propertyCount: 23,
  },
  {
    id: '5',
    uploaderId: 'user-789',
    uploaderName: 'Michael Brown',
    filename: 'glasgow-properties.csv',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    propertyCount: 31,
  },
]

export async function GET(_request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Verify the user has admin permissions
    // 2. Query the database for all uploads
    // 3. Calculate stats
    // 4. Return the results

    // Sort by date (newest first)
    const sortedUploads = [...mockUploads].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    // Calculate stats
    const stats = {
      totalProperties: mockUploads.reduce((sum, upload) => sum + upload.propertyCount, 0),
      pendingUploads: mockUploads.filter(upload => upload.status === 'pending').length,
      approvedUploads: mockUploads.filter(upload => upload.status === 'approved').length,
      rejectedUploads: mockUploads.filter(upload => upload.status === 'rejected').length,
    }

    return NextResponse.json({
      uploads: sortedUploads,
      stats,
    })
  } catch (error) {
    console.error('Error fetching admin uploads:', error)
    return NextResponse.json({ message: 'Failed to fetch uploads' }, { status: 500 })
  }
}
