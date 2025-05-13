import OpenAI from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Define embedding model options
export type EmbeddingProvider = 'openai' | 'lmstudio';

// Interface for embedding options
interface EmbeddingOptions {
  provider?: EmbeddingProvider;
  model?: string;
  apiKey?: string;
  apiUrl?: string;
}

// Default options
const defaultOptions: EmbeddingOptions = {
  provider: 'openai',
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
  apiUrl: process.env.LLM_API_URL || 'http://localhost:11434/api/embeddings'
};

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
  // Merge default options with provided options
  const config = { ...defaultOptions, ...options };
  
  // Validate input
  if (!text || text.trim() === '') {
    throw new Error('Text cannot be empty');
  }

  try {
    // Use OpenAI API
    if (config.provider === 'openai') {
      return await generateOpenAIEmbedding(text, config);
    }
    // Use LM Studio API
    else if (config.provider === 'lmstudio') {
      return await generateLMStudioEmbedding(text, config);
    }
    else {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings using OpenAI API
 */
async function generateOpenAIEmbedding(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  if (!options.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const openai = new OpenAI({
    apiKey: options.apiKey
  });

  const response = await openai.embeddings.create({
    model: options.model || 'text-embedding-3-small',
    input: text,
    encoding_format: 'float'
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings using LM Studio API
 */
async function generateLMStudioEmbedding(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  if (!options.apiUrl) {
    throw new Error('LM Studio API URL is required');
  }

  const response = await axios.post(
    options.apiUrl,
    {
      model: options.model || 'bge-base-en',
      prompt: text
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data && response.data.embedding) {
    return response.data.embedding;
  } else {
    throw new Error('Invalid response from LM Studio API');
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
  const batchSize = 20;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const promises = batch.map(text => generateEmbedding(text, options));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Add a small delay between batches to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Calculate cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}