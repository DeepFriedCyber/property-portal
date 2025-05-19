import { NextApiRequest, NextApiResponse } from 'next'

import { getProperties, PropertyFilter, PaginationOptions } from '../../../lib/db/propertyService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Extract query parameters
      const { minPrice, maxPrice, location, page, limit } = req.query

      // Build filter object
      const filter: PropertyFilter = {}

      if (minPrice) {
        filter.minPrice = parseFloat(minPrice as string)
      }

      if (maxPrice) {
        filter.maxPrice = parseFloat(maxPrice as string)
      }

      if (location) {
        filter.location = location as string
      }

      // Build pagination options
      const pagination: PaginationOptions = {}

      if (page) {
        pagination.page = parseInt(page as string)
      }

      if (limit) {
        pagination.limit = parseInt(limit as string)
      }

      // Get properties
      const result = await getProperties(filter, pagination)

      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching properties:', error)
      return res.status(500).json({ error: 'Failed to fetch properties' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
