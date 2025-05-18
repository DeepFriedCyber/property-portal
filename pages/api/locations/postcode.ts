import { NextApiRequest, NextApiResponse } from 'next'
import { getPostcodeDetails } from '../../../lib/services/locationService'

/**
 * API endpoint for getting detailed information about a UK postcode
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
    const { postcode } = req.query

    // Validate postcode parameter
    if (!postcode || typeof postcode !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid postcode parameter',
      })
    }

    // Get postcode details
    const result = await getPostcodeDetails(postcode)

    if (!result) {
      return res.status(404).json({
        error: 'Postcode not found',
        message: `No location data found for postcode: ${postcode}`,
      })
    }

    return res.status(200).json({ result })
  } catch (error) {
    console.error('Error in postcode details API:', error)

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
