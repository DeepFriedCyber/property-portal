import { NextRequest, NextResponse } from 'next/server'

/**
 * Placeholder API handler for property CSV uploads
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      message: 'Upload API not implemented yet',
      uploadId: 'mock-upload-id',
      propertyCount: 0,
    },
    { status: 200 }
  )
}
