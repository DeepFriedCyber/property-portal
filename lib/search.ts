// lib/search.ts
import { getAllListings, Property } from './getListings'
import { getEmbeddingsBatch } from './vector'

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot && normA && normB ? dot / (normA * normB) : 0
}

export async function semanticSearch(query: string, topK = 10): Promise<Property[]> {
  const listings = await getAllListings()
  const queryVector = (await getEmbeddingsBatch([query]))[0]

  const scored = listings
    .filter(p => p.embedding)
    .map(p => ({
      ...p,
      score: cosineSimilarity(p.embedding!, queryVector),
    }))

  return scored.sort((a, b) => b.score - a.score).slice(0, topK)
}
