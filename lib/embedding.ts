// No longer using axios
import * as dotenv from 'dotenv'
import OpenAI from 'openai'

// Load environment variables
dotenv.config()

// Define embedding model options
export type EmbeddingProvider = 'openai' | 'lmstudio'

// Interface for embedding options
interface EmbeddingOptions {
  provider?: EmbeddingProvider
  model?: string
  apiKey?: string
  apiUrl?: string
  timeout?: number
  maxRetries?: number
  backoffFactor?: number
  fallbackProvider?: EmbeddingProvider
}

// Default options
const defaultOptions: EmbeddingOptions = {
  provider: 'openai',
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
  apiUrl: process.env.LLM_API_URL || 'http://localhost:11434/api/embeddings',
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  backoffFactor: 2,
  fallbackProvider: 'lmstudio',
}

// Circuit breaker state
interface CircuitBreakerState {
  failures: number
  lastFailure: number | null
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

const circuitBreakers: Record<EmbeddingProvider, CircuitBreakerState> = {
  openai: {
    failures: 0,
    lastFailure: null,
    status: 'CLOSED',
  },
  lmstudio: {
    failures: 0,
    lastFailure: null,
    status: 'CLOSED',
  },
}

// Circuit breaker configuration
const FAILURE_THRESHOLD = 5
const RESET_TIMEOUT = 30000 // 30 seconds

/**
 * Check if circuit breaker allows the request
 * @param provider The provider to check
 * @returns Whether the request is allowed
 */
function canMakeRequest(provider: EmbeddingProvider): boolean {
  const breaker = circuitBreakers[provider]

  // If circuit is closed, allow the request
  if (breaker.status === 'CLOSED') {
    return true
  }

  // If circuit is open, check if it's time to try again
  if (breaker.status === 'OPEN') {
    const now = Date.now()
    if (breaker.lastFailure && now - breaker.lastFailure > RESET_TIMEOUT) {
      // Move to half-open state
      breaker.status = 'HALF_OPEN'
      console.log(`Circuit breaker for ${provider} is now HALF_OPEN`)
      return true
    }
    return false
  }

  // If circuit is half-open, allow one test request
  return true
}

/**
 * Record a successful request
 * @param provider The provider that succeeded
 */
function recordSuccess(provider: EmbeddingProvider): void {
  const breaker = circuitBreakers[provider]

  if (breaker.status === 'HALF_OPEN') {
    // Reset the circuit breaker
    breaker.failures = 0
    breaker.lastFailure = null
    breaker.status = 'CLOSED'
    console.log(`Circuit breaker for ${provider} is now CLOSED`)
  }
}

/**
 * Record a failed request
 * @param provider The provider that failed
 */
function recordFailure(provider: EmbeddingProvider): void {
  const breaker = circuitBreakers[provider]

  breaker.failures += 1
  breaker.lastFailure = Date.now()

  if (breaker.status === 'CLOSED' && breaker.failures >= FAILURE_THRESHOLD) {
    breaker.status = 'OPEN'
    console.log(`Circuit breaker for ${provider} is now OPEN`)
  } else if (breaker.status === 'HALF_OPEN') {
    breaker.status = 'OPEN'
    console.log(`Circuit breaker for ${provider} is now OPEN after failed test`)
  }
}

/**
 * Retry a function with exponential backoff
 * @param fn The function to retry
 * @param maxRetries Maximum number of retries
 * @param backoffFactor Backoff factor for exponential backoff
 * @returns The result of the function
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  backoffFactor: number
): Promise<T> {
  let lastError: Error = new Error('Unknown error occurred during retry')

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry if we've reached max retries
      if (attempt === maxRetries) break

      // Don't retry for certain errors
      if (error instanceof Error) {
        // Don't retry for authentication errors
        if (error.message.includes('authentication') || error.message.includes('API key')) {
          break
        }
      }

      // Wait with exponential backoff before retrying
      const delay = 1000 * Math.pow(backoffFactor, attempt)
      // Removed console.log statement to avoid unexpected console output
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Cache for embeddings
const cache = new Map<string, number[]>()

/**
 * Generate embeddings for a text using either OpenAI or LM Studio
 * @param text The text to generate embeddings for
 * @param options Configuration options
 * @returns An array of numbers representing the embedding vector
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  // Check cache first
  if (cache.has(text)) {
    return cache.get(text)!
  }

  // Merge default options with provided options
  const config = { ...defaultOptions, ...options }

  // Validate input
  if (!text || text.trim() === '') {
    throw new Error('Text cannot be empty')
  }

  // Try primary provider
  const primaryProvider = config.provider || 'openai'

  try {
    // Check if circuit breaker allows the request
    if (!canMakeRequest(primaryProvider)) {
      console.log(`Circuit breaker for ${primaryProvider} is OPEN, using fallback provider`)

      // If fallback provider is specified and different from primary, try it
      if (config.fallbackProvider && config.fallbackProvider !== primaryProvider) {
        const result = await generateEmbeddingWithProvider(text, {
          ...config,
          provider: config.fallbackProvider,
        })
        cache.set(text, result)
        return result
      }

      throw new Error(`${primaryProvider} service is unavailable and no fallback is available`)
    }

    // Try with primary provider
    const result = await generateEmbeddingWithProvider(text, config)
    recordSuccess(primaryProvider)
    cache.set(text, result)
    return result
  } catch (error) {
    console.error(`Error with primary provider ${primaryProvider}:`, error)
    recordFailure(primaryProvider)

    // If fallback provider is specified and different from primary, try it
    if (config.fallbackProvider && config.fallbackProvider !== primaryProvider) {
      console.log(`Trying fallback provider: ${config.fallbackProvider}`)

      try {
        if (canMakeRequest(config.fallbackProvider)) {
          const result = await generateEmbeddingWithProvider(text, {
            ...config,
            provider: config.fallbackProvider,
          })
          recordSuccess(config.fallbackProvider)
          cache.set(text, result)
          return result
        }
      } catch (fallbackError) {
        console.error(`Error with fallback provider ${config.fallbackProvider}:`, fallbackError)
        recordFailure(config.fallbackProvider)
      }
    }

    // If we get here, both primary and fallback failed
    throw new Error(`Failed to generate embedding: ${(error as Error).message}`)
  }
}

/**
 * Generate embeddings with a specific provider
 */
async function generateEmbeddingWithProvider(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  // Use OpenAI API
  if (options.provider === 'openai') {
    return await withRetry(
      () => generateOpenAIEmbedding(text, options),
      options.maxRetries || 3,
      options.backoffFactor || 2
    )
  }
  // Use LM Studio API
  else if (options.provider === 'lmstudio') {
    return await withRetry(
      () => generateLMStudioEmbedding(text, options),
      options.maxRetries || 3,
      options.backoffFactor || 2
    )
  } else {
    throw new Error(`Unsupported provider: ${options.provider}`)
  }
}

/**
 * Generate embeddings using OpenAI API
 */
async function generateOpenAIEmbedding(text: string, options: EmbeddingOptions): Promise<number[]> {
  if (!options.apiKey) {
    throw new Error('OpenAI API key is required')
  }

  const openai = new OpenAI({
    apiKey: options.apiKey,
    timeout: options.timeout || 10000,
    maxRetries: 0, // We handle retries ourselves
  })

  try {
    const response = await openai.embeddings.create({
      model: options.model || 'text-embedding-3-small',
      input: text,
      encodingFormat: 'float',
    })

    return response.data[0].embedding
  } catch (error) {
    // Enhance error message with more context
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error(`OpenAI rate limit exceeded: ${error.message}`)
      } else if (error.message.includes('401')) {
        throw new Error(`OpenAI authentication error: ${error.message}`)
      } else if (error.message.includes('timeout')) {
        throw new Error(`OpenAI request timed out: ${error.message}`)
      }
    }
    throw error
  }
}

/**
 * Generate embeddings using LM Studio/Ollama API
 */
async function generateLMStudioEmbedding(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  if (!options.apiUrl) {
    throw new Error('LM Studio/Ollama API URL is required')
  }

  try {
    const res = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({ model: 'mistral', prompt: text }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) throw new Error('Ollama failed')

    const json = await res.json()
    return json.embedding
  } catch (err) {
    console.warn('Falling back to OpenAI for embedding...')
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    })

    const json = await res.json()
    return json.data[0].embedding
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts Array of texts to generate embeddings for
 * @param options Configuration options
 * @returns Array of embedding vectors
 */
export async function generateEmbeddingBatch(
  texts: string[],
  options: EmbeddingOptions = {}
): Promise<number[][]> {
  // Process in batches to avoid rate limits
  const batchSize = 20
  const results: number[][] = []
  const errors: Error[] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    try {
      // Process batch with Promise.allSettled to handle partial failures
      const batchPromises = batch.map(text => generateEmbedding(text, options))
      const batchResults = await Promise.allSettled(batchPromises)

      // Process results and collect errors
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error(`Error processing item ${i + index}:`, result.reason)
          errors.push(result.reason)
          // Push a placeholder for failed embeddings
          results.push([])
        }
      })

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error)
      // For catastrophic batch errors, fill with empty arrays
      for (let j = 0; j < batch.length; j++) {
        results.push([])
      }
    }
  }

  // If all embeddings failed, throw an error
  if (results.every(arr => arr.length === 0)) {
    throw new Error(`Failed to generate any embeddings: ${errors[0]?.message || 'Unknown error'}`)
  }

  return results
}

/**
 * Calculate cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  // Validate inputs
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new TypeError('Both arguments must be arrays')
  }

  if (a.length === 0 || b.length === 0) {
    throw new Error('Vectors cannot be empty')
  }

  if (a.length !== b.length) {
    throw new Error(`Vectors must have the same length: ${a.length} vs ${b.length}`)
  }

  // Check if vectors contain valid numbers
  for (let i = 0; i < a.length; i++) {
    if (typeof a[i] !== 'number' || isNaN(a[i])) {
      throw new TypeError(`First vector contains non-numeric value at index ${i}`)
    }
    if (typeof b[i] !== 'number' || isNaN(b[i])) {
      throw new TypeError(`Second vector contains non-numeric value at index ${i}`)
    }
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))

  // Ensure the result is within the valid range
  if (similarity < -1 || similarity > 1) {
    console.warn(
      `Cosine similarity calculation resulted in an out-of-range value: ${similarity}. Clamping to [-1, 1].`
    )
    return Math.max(-1, Math.min(1, similarity))
  }

  return similarity
}
