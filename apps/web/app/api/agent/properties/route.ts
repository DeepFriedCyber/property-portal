import { NextRequest, NextResponse } from 'next/server';

// Mock data - would be replaced with database queries
const mockProperties = [
  {
    id: '101',
    uploadId: '1',
    address: '123 Oxford Street, London W1D 1DF',
    price: 750000,
    bedrooms: 3,
    type: 'Apartment',
    dateSold: null
  },
  {
    id: '102',
    uploadId: '1',
    address: '45 Baker Street, London NW1 6XE',
    price: 1250000,
    bedrooms: 4,
    type: 'Townhouse',
    dateSold: null
  },
  {
    id: '103',
    uploadId: '1',
    address: '78 Kensington High Street, London W8 5SE',
    price: 2100000,
    bedrooms: 5,
    type: 'Detached',
    dateSold: null
  },
  {
    id: '104',
    uploadId: '2',
    address: '15 Deansgate, Manchester M3 2EY',
    price: 320000,
    bedrooms: 2,
    type: 'Apartment',
    dateSold: null
  },
  {
    id: '105',
    uploadId: '2',
    address: '27 Portland Street, Manchester M1 3LD',
    price: 450000,
    bedrooms: 3,
    type: 'Terraced',
    dateSold: null
  },
  {
    id: '106',
    uploadId: '3',
    address: '8 Broad Street, Birmingham B1 2HG',
    price: 275000,
    bedrooms: 2,
    type: 'Apartment',
    dateSold: null
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Get the user ID from the session
    // 2. Query the database for properties linked to this user's uploads
    // 3. Return the results
    
    // Mock user ID
    const userId = 'user-123';
    
    // Mock upload IDs for this user
    const userUploadIds = ['1', '2', '3'];
    
    // Filter properties by user's upload IDs (in a real app, this would be a database query)
    const userProperties = mockProperties.filter(property => 
      userUploadIds.includes(property.uploadId)
    );
    
    return NextResponse.json({
      properties: userProperties
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { message: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}