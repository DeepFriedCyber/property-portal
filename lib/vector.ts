// lib/vector.ts
/**
 * Functions for working with vector embeddings
 */

const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:5000'

/**
 * Get embeddings for a batch of texts
 * @param texts Array of texts to get embeddings for
 * @returns Promise resolving to array of embedding vectors
 */
export async function getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    })

    if (!response.ok) {
      throw new Error(`Embedding service error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.embeddings
  } catch (error) {
    console.error('Error getting embeddings:', error)
    throw error
  }
}

/**
 * Get embedding for a single text
 * @param text Text to get embedding for
 * @returns Promise resolving to embedding vector
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const embeddings = await getEmbeddingsBatch([text])
  return embeddings[0]
}

/**
 * Get embedding for a property based on its title, location, and description
 * @param property Property object
 * @returns Promise resolving to embedding vector
 */
export async function getPropertyEmbedding(property: {
  title: string
  location: string
  description?: string
}): Promise<number[]> {
  const text = [property.title, property.location, property.description || ''].join(' ')

  return getEmbedding(text)
}
