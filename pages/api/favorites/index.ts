import { NextApiRequest, NextApiResponse } from 'next'

import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
} from '../../../lib/db/propertyService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In a real application, you would get the user ID from the authenticated session
  // For this example, we'll use a query parameter
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' })
  }

  if (req.method === 'GET') {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : undefined
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

      // Get user's favorite properties with pagination
      const result = await getUserFavorites(userId, { page, limit })

      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return res.status(500).json({ error: 'Failed to fetch favorites' })
    }
  } else if (req.method === 'POST') {
    try {
      const { propertyId } = req.body

      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' })
      }

      // Add property to favorites
      const result = await addToFavorites(userId, propertyId)

      if (!result.success) {
        console.error('Error adding to favorites:', result.error)
        return res.status(500).json({ error: result.error, details: result.details })
      }

      return res.status(201).json(result)
    } catch (error) {
      console.error('Error adding to favorites:', error)
      return res.status(500).json({ error: 'Failed to add to favorites' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { propertyId } = req.body

      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' })
      }

      // Remove property from favorites
      const result = await removeFromFavorites(userId, propertyId)

      if (!result.success) {
        console.error('Error removing from favorites:', result.error)
        return res.status(500).json({ error: result.error, details: result.details })
      }

      return res.status(200).json(result)
    } catch (error) {
      console.error('Error removing from favorites:', error)
      return res.status(500).json({ error: 'Failed to remove from favorites' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
