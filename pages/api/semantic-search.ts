import { NextApiRequest, NextApiResponse } from 'next'

import { semanticPropertySearch } from '@/lib/semantic-search'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const q = (req.query.q as string) || ''

  if (!q) {
    return res.status(400).json({ message: 'Missing query param `q`' })
  }

  try {
    const results = await semanticPropertySearch(q)
    return res.status(200).json(results)
  } catch (err) {
    console.error('Semantic search failed', err)
    return res.status(500).json({ message: 'Internal error' })
  }
}
