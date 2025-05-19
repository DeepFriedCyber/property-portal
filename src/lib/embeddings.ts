/**
 * Utility functions for working with text embeddings
 */

const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000'

/**
 * Generate embeddings for a list of texts
 * @param texts - Array of texts to embed
 * @returns Promise with array of embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
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
    console.error('Error generating embeddings:', error)
    throw error
  }
}

/**
 * Generate an embedding for a property based on its title, location, and description
 * @param property - Property object with title, location, and optional description
 * @returns Promise with embedding vector
 */
export async function generatePropertyEmbedding(property: {
  title: string
  location: string
  description?: string
}): Promise<number[]> {
  // Combine property fields into a single text for embedding
  const text = [property.title, property.location, property.description || ''].join(' ')

  const embeddings = await generateEmbeddings([text])
  return embeddings[0]
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}
