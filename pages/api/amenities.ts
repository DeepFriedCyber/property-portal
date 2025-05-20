import type { NextApiRequest, NextApiResponse } from 'next'

import { fetchNearbyAmenities } from '../../lib/amenities'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const lat = parseFloat((req.query.lat as string) || '')
  const lng = parseFloat((req.query.lng as string) || '')

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: 'Missing lat/lng parameters' })
  }

  try {
    const data = await fetchNearbyAmenities(lat, lng)
    return res.status(200).json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to fetch amenities' })
  }
}
