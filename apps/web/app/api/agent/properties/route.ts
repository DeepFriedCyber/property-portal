import { NextRequest, NextResponse } from 'next/server'

/**
 * Placeholder API for agent properties
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    properties: [
      {
        id: '1',
        address: '123 Main St, Anytown, USA',
        price: 350000,
        bedrooms: 3,
        type: 'House',
      },
      {
        id: '2',
        address: '456 Oak Ave, Somewhere, USA',
        price: 275000,
        bedrooms: 2,
        type: 'Apartment',
      },
    ],
  })
}
