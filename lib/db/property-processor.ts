import { db, schema } from './index';
import { eq, and, isNull } from 'drizzle-orm';
import { generateEmbedding, generateEmbeddingBatch } from '../embedding';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get embedding provider from environment variables
const embeddingProvider = process.env.EMBEDDING_PROVIDER as 'openai' | 'lmstudio' || 'lmstudio';
const embeddingModel = process.env.LLM_MODEL || 'bge-base-en';

/**
 * Generate a text representation of a property for embedding
 */
export function generatePropertyText(property: any): string {
  const parts = [
    property.address,
    `${property.bedrooms || ''} bedroom`,
    property.type || '',
    `£${property.price || ''}`
  ];
  
  return parts.filter(Boolean).join(', ');
}

/**
 * Process a single property to generate and store its embedding
 */
export async function processPropertyEmbedding(propertyId: string): Promise<void> {
  // Get the property from the database
  const properties = await db.select()
    .from(schema.property)
    .where(eq(schema.property.id, propertyId));
  
  if (properties.length === 0) {
    throw new Error(`Property not found: ${propertyId}`);
  }
  
  const property = properties[0];
  
  // Generate text representation
  const text = generatePropertyText(property);
  
  // Generate embedding
  const embedding = await generateEmbedding(text, {
    provider: embeddingProvider,
    model: embeddingModel
  });
  
  // Update property with embedding
  // The vector column will be updated automatically by the trigger if it exists
  await db.update(schema.property)
    .set({ embedding })
    .where(eq(schema.property.id, propertyId));
  
  console.log(`Generated embedding for property ${propertyId}`);
}

/**
 * Process all properties for a specific upload
 */
export async function processUploadEmbeddings(uploadId: string): Promise<void> {
  // Get all properties for this upload that don't have embeddings yet
  const properties = await db.select()
    .from(schema.property)
    .where(
      and(
        eq(schema.property.uploadId, uploadId),
        isNull(schema.property.embedding)
      )
    );
  
  if (properties.length === 0) {
    console.log(`No properties found for upload ${uploadId} that need embeddings`);
    return;
  }
  
  console.log(`Processing ${properties.length} properties for upload ${uploadId}`);
  
  // Generate text representations for all properties
  const texts = properties.map(generatePropertyText);
  
  // Generate embeddings in batch
  const embeddings = await generateEmbeddingBatch(texts, {
    provider: embeddingProvider,
    model: embeddingModel
  });
  
  // Update each property with its embedding
  // The vector column will be updated automatically by the trigger if it exists
  for (let i = 0; i < properties.length; i++) {
    await db.update(schema.property)
      .set({ embedding: embeddings[i] })
      .where(eq(schema.property.id, properties[i].id));
  }
  
  console.log(`Generated embeddings for ${properties.length} properties`);
}

/**
 * Process all properties in the database that don't have embeddings
 */
export async function processAllMissingEmbeddings(): Promise<void> {
  // Get all properties that don't have embeddings
  const properties = await db.select()
    .from(schema.property)
    .where(isNull(schema.property.embedding));
  
  if (properties.length === 0) {
    console.log('No properties found that need embeddings');
    return;
  }
  
  console.log(`Processing ${properties.length} properties that need embeddings`);
  
  // Process in batches of 50
  const batchSize = 50;
  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);
    
    // Generate text representations for this batch
    const texts = batch.map(generatePropertyText);
    
    // Generate embeddings in batch
    const embeddings = await generateEmbeddingBatch(texts, {
      provider: embeddingProvider,
      model: embeddingModel
    });
    
    // Update each property with its embedding
    // The vector column will be updated automatically by the trigger if it exists
    for (let j = 0; j < batch.length; j++) {
      await db.update(schema.property)
        .set({ embedding: embeddings[j] })
        .where(eq(schema.property.id, batch[j].id));
    }
    
    console.log(`Processed batch ${i / batchSize + 1} of ${Math.ceil(properties.length / batchSize)}`);
    
    // Add a delay between batches to avoid rate limits
    if (i + batchSize < properties.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`Generated embeddings for ${properties.length} properties`);
}