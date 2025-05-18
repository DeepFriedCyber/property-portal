import { NextApiRequest, NextApiResponse } from 'next'

import { getPropertyById, getNearbyProperties } from '../../../lib/properties'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid property ID' })
  }

  if (req.method === 'GET') {
    try {
      // Get the property
      const property = await getPropertyById(id)

      if (!property) {
        return res.status(404).json({ error: 'Property not found' })
      }

      // Check if nearby properties are requested
      const includeNearby = req.query.nearby === 'true'
      let nearbyProperties = []

      if (includeNearby) {
        const distance = req.query.distance ? parseFloat(req.query.distance as string) : 10

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5

        nearbyProperties = await getNearbyProperties(id, distance, limit)
      }

      return res.status(200).json({
        property,
        nearbyProperties: includeNearby ? nearbyProperties : undefined,
      })
    } catch (error) {
      console.error('Error fetching property:', error)
      return res.status(500).json({ error: 'Failed to fetch property' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
