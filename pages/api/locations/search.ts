import { NextApiRequest, NextApiResponse } from 'next'

import { autocompleteUKLocation } from '../../../lib/services/locationService'

/**
 * API endpoint for location search and autocomplete
 *
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query } = req.query

    // Validate query parameter
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid query parameter',
      })
    }

    // Get location suggestions
    const results = await autocompleteUKLocation(query)

    return res.status(200).json({ results })
  } catch (error) {
    console.error('Error in location search API:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('MAPTILER_API_KEY')) {
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'MapTiler API key is not configured',
        })
      }

      if (error.message.includes('MapTiler API error')) {
        return res.status(502).json({
          error: 'External API error',
          message: error.message,
        })
      }
    }

    // Generic error response
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
