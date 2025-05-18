import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // This file ensures the route is properly configured
  // The actual rendering is handled by page.tsx
  return new Response(null, {
    status: 200,
  })
}
