import { NextRequest, NextResponse } from 'next/server';

/**
 * Placeholder API for properties
 */
export async function GET(_request: NextRequest) {
  // Mock property data
  const mockProperty = {
    id: '1',
    address: '123 Main St, Anytown, USA',
    price: 350000,
    bedrooms: 3,
    type: 'House',
  };

  return NextResponse.json({
    success: true,
    data: mockProperty,
  });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      id: '123',
      message: 'Property created successfully',
    },
  });
}

export async function PATCH(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      id: '123',
      message: 'Property updated successfully',
    },
  });
}

export async function DELETE(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      id: '123',
      message: 'Property deleted successfully',
    },
  });
}
