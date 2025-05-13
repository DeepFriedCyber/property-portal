import { db, schema } from './index';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Types based on our schema
export type UploadRecord = typeof schema.uploadRecord.$inferSelect;
export type NewUploadRecord = typeof schema.uploadRecord.$inferInsert;

export type Property = typeof schema.property.$inferSelect;
export type NewProperty = typeof schema.property.$inferInsert;

// Upload Record Queries
export async function createUploadRecord(data: NewUploadRecord): Promise<UploadRecord> {
  const result = await db.insert(schema.uploadRecord)
    .values(data)
    .returning();
  
  return result[0];
}

export async function getUploadRecordById(id: string): Promise<UploadRecord | undefined> {
  const results = await db.select()
    .from(schema.uploadRecord)
    .where(eq(schema.uploadRecord.id, id));
  
  return results[0];
}

export async function getUploadRecordsByUploader(uploaderId: string): Promise<UploadRecord[]> {
  return db.select()
    .from(schema.uploadRecord)
    .where(eq(schema.uploadRecord.uploaderId, uploaderId))
    .orderBy(desc(schema.uploadRecord.createdAt));
}

export async function updateUploadRecordStatus(id: string, status: string): Promise<UploadRecord | undefined> {
  const results = await db.update(schema.uploadRecord)
    .set({ status })
    .where(eq(schema.uploadRecord.id, id))
    .returning();
  
  return results[0];
}

// Property Queries
export async function createProperty(data: NewProperty): Promise<Property> {
  const result = await db.insert(schema.property)
    .values(data)
    .returning();
  
  return result[0];
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const results = await db.select()
    .from(schema.property)
    .where(eq(schema.property.id, id));
  
  return results[0];
}

export async function getPropertiesByUploadId(uploadId: string): Promise<Property[]> {
  return db.select()
    .from(schema.property)
    .where(eq(schema.property.uploadId, uploadId));
}

export async function updateProperty(id: string, data: Partial<NewProperty>): Promise<Property | undefined> {
  const results = await db.update(schema.property)
    .set(data)
    .where(eq(schema.property.id, id))
    .returning();
  
  return results[0];
}

export async function deleteProperty(id: string): Promise<void> {
  await db.delete(schema.property)
    .where(eq(schema.property.id, id));
}

// Count properties by upload ID
export async function countPropertiesByUploadId(uploadId: string): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(schema.property)
    .where(eq(schema.property.uploadId, uploadId));
  
  return result[0].count;
}

// Vector search for properties (if you have embeddings)
export async function searchPropertiesByEmbedding(embedding: number[], limit: number = 10): Promise<Property[]> {
  // This uses PostgreSQL's vector operations to find similar properties
  // Note: This requires the pgvector extension to be installed in your database
  return db.select()
    .from(schema.property)
    .where(sql`embedding is not null`)
    .orderBy(sql`embedding <-> ${JSON.stringify(embedding)}::jsonb`)
    .limit(limit);
}