import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFavorites, addToFavorites, removeFromFavorites } from '../../../lib/properties'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In a real application, you would get the user ID from the authenticated session
  // For this example, we'll use a query parameter
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' })
  }

  if (req.method === 'GET') {
    try {
      // Get user's favorite properties
      const favorites = await getUserFavorites(userId)
      return res.status(200).json({ favorites })
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
      await addToFavorites(userId, propertyId)
      return res.status(201).json({ message: 'Property added to favorites' })
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
      await removeFromFavorites(userId, propertyId)
      return res.status(200).json({ message: 'Property removed from favorites' })
    } catch (error) {
      console.error('Error removing from favorites:', error)
      return res.status(500).json({ error: 'Failed to remove from favorites' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
