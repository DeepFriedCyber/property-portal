// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { semanticSearch } from '../../../lib/search'

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
  const results = await semanticSearch(query)
  return NextResponse.json(results)
}
