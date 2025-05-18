import { NextRequest, NextResponse } from 'next/server'

// Placeholder API route
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      message: 'API route not implemented yet',
      uploads: [],
    },
    { status: 200 }
  )
}
