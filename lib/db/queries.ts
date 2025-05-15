import { db, schema } from './index';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { withDatabaseErrorHandling, DatabaseQueryError } from './error-handler';
import { bindJsonbArray } from './utils';

// Types based on our schema
export type UploadRecord = typeof schema.uploadRecord.$inferSelect;
export type NewUploadRecord = typeof schema.uploadRecord.$inferInsert;

export type Property = typeof schema.property.$inferSelect;
export type NewProperty = typeof schema.property.$inferInsert;

// Upload Record Queries
export async function createUploadRecord(data: NewUploadRecord): Promise<UploadRecord> {
  return withDatabaseErrorHandling(async () => {
    // Validate required fields
    if (!data.uploaderId) {
      throw new Error('uploaderId is required');
    }
    
    const result = await db.insert(schema.uploadRecord)
      .values(data)
      .returning();
    
    if (!result.length) {
      throw new DatabaseQueryError('Failed to create upload record');
    }
    
    return result[0];
  }, { query: 'createUploadRecord' });
}

export async function getUploadRecordById(id: string): Promise<UploadRecord | undefined> {
  return withDatabaseErrorHandling(async () => {
    if (!id) {
      throw new Error('id is required');
    }
    
    const results = await db.select()
      .from(schema.uploadRecord)
      .where(eq(schema.uploadRecord.id, id));
    
    return results[0];
  }, { query: 'getUploadRecordById', params: [id] });
}

export async function getUploadRecordsByUploader(uploaderId: string): Promise<UploadRecord[]> {
  return withDatabaseErrorHandling(async () => {
    if (!uploaderId) {
      throw new Error('uploaderId is required');
    }
    
    return db.select()
      .from(schema.uploadRecord)
      .where(eq(schema.uploadRecord.uploaderId, uploaderId))
      .orderBy(desc(schema.uploadRecord.createdAt));
  }, { query: 'getUploadRecordsByUploader', params: [uploaderId] });
}

export async function updateUploadRecordStatus(id: string, status: string): Promise<UploadRecord | undefined> {
  return withDatabaseErrorHandling(async () => {
    if (!id) {
      throw new Error('id is required');
    }
    
    if (!status) {
      throw new Error('status is required');
    }
    
    const results = await db.update(schema.uploadRecord)
      .set({ status })
      .where(eq(schema.uploadRecord.id, id))
      .returning();
    
    return results[0];
  }, { query: 'updateUploadRecordStatus', params: [id, status] });
}

// Property Queries
export async function createProperty(data: NewProperty): Promise<Property> {
  return withDatabaseErrorHandling(async () => {
    // Validate required fields
    if (!data.uploadId) {
      throw new Error('uploadId is required');
    }
    
    if (!data.address) {
      throw new Error('address is required');
    }
    
    const result = await db.insert(schema.property)
      .values(data)
      .returning();
    
    if (!result.length) {
      throw new DatabaseQueryError('Failed to create property');
    }
    
    return result[0];
  }, { query: 'createProperty' });
}

/**
 * Get a property by its ID
 * @param id The property ID
 * @returns The property if found, undefined otherwise
 */
export async function getPropertyById(id: string): Promise<Property | undefined> {
  return withDatabaseErrorHandling(async () => {
    if (!id) {
      throw new Error('id is required');
    }
    
    const results = await db.select()
      .from(schema.property)
      .where(eq(schema.property.id, id));
    
    if (!results.length) {
      return undefined;
    }
    
    // Ensure the returned object conforms to the Property type
    const property = results[0];
    
    // Convert dates to ISO strings if they exist
    return {
      ...property,
      createdAt: property.createdAt instanceof Date 
        ? property.createdAt.toISOString() 
        : property.createdAt,
      updatedAt: property.updatedAt instanceof Date 
        ? property.updatedAt.toISOString() 
        : property.updatedAt
    } as Property;
  }, { query: 'getPropertyById', params: [id] });
}

/**
 * Get properties by upload ID
 * @param uploadId The upload ID
 * @returns Array of properties associated with the upload
 */
export async function getPropertiesByUploadId(uploadId: string): Promise<Property[]> {
  return withDatabaseErrorHandling(async () => {
    if (!uploadId) {
      throw new Error('uploadId is required');
    }
    
    const results = await db.select()
      .from(schema.property)
      .where(eq(schema.property.uploadId, uploadId));
    
    // Ensure all returned objects conform to the Property type
    return results.map(property => ({
      ...property,
      createdAt: property.createdAt instanceof Date 
        ? property.createdAt.toISOString() 
        : property.createdAt,
      updatedAt: property.updatedAt instanceof Date 
        ? property.updatedAt.toISOString() 
        : property.updatedAt
    } as Property));
  }, { query: 'getPropertiesByUploadId', params: [uploadId] });
}

/**
 * Update a property by ID
 * @param id The property ID
 * @param data The data to update
 * @returns The updated property if found, undefined otherwise
 */
export async function updateProperty(id: string, data: Partial<NewProperty>): Promise<Property | undefined> {
  return withDatabaseErrorHandling(async () => {
    if (!id) {
      throw new Error('id is required');
    }
    
    if (Object.keys(data).length === 0) {
      throw new Error('No data provided for update');
    }
    
    // Add updatedAt if not provided
    const updateData = {
      ...data,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
    };
    
    const results = await db.update(schema.property)
      .set(updateData)
      .where(eq(schema.property.id, id))
      .returning();
    
    if (!results.length) {
      return undefined;
    }
    
    // Ensure the returned object conforms to the Property type
    const property = results[0];
    
    return {
      ...property,
      createdAt: property.createdAt instanceof Date 
        ? property.createdAt.toISOString() 
        : property.createdAt,
      updatedAt: property.updatedAt instanceof Date 
        ? property.updatedAt.toISOString() 
        : property.updatedAt
    } as Property;
  }, { query: 'updateProperty', params: [id] });
}

export async function deleteProperty(id: string): Promise<void> {
  return withDatabaseErrorHandling(async () => {
    if (!id) {
      throw new Error('id is required');
    }
    
    await db.delete(schema.property)
      .where(eq(schema.property.id, id));
  }, { query: 'deleteProperty', params: [id] });
}

// Count properties by upload ID
export async function countPropertiesByUploadId(uploadId: string): Promise<number> {
  return withDatabaseErrorHandling(async () => {
    if (!uploadId) {
      throw new Error('uploadId is required');
    }
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(schema.property)
      .where(eq(schema.property.uploadId, uploadId));
    
    return result[0].count;
  }, { query: 'countPropertiesByUploadId', params: [uploadId] });
}

// Vector search for properties (if you have embeddings)
export async function searchPropertiesByEmbedding(embedding: number[], limit: number = 10): Promise<Property[]> {
  return withDatabaseErrorHandling(async () => {
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Valid embedding array is required');
    }
    
    // Validate limit
    const validLimit = Math.max(1, Math.min(100, limit)); // Ensure limit is between 1 and 100
    
    // This uses PostgreSQL's vector operations to find similar properties
    // Note: This requires the pgvector extension to be installed in your database
    return db.select()
      .from(schema.property)
      .where(sql`embedding is not null`)
      .orderBy(sql`embedding <-> ${bindJsonbArray(embedding)}`)
      .limit(validLimit);
  }, { query: 'searchPropertiesByEmbedding', params: [embedding.length, limit] });
}

/**
 * Execute a database transaction with proper error handling
 * @param operations Function containing the operations to execute in a transaction
 * @returns The result of the transaction
 */
export async function withTransaction<T>(operations: () => Promise<T>): Promise<T> {
  return withDatabaseErrorHandling(async () => {
    return await db.transaction(async (tx) => {
      try {
        return await operations();
      } catch (error) {
        // Ensure transaction is rolled back on error
        throw error;
      }
    });
  }, { query: 'withTransaction' });
}

/**
 * Batch insert properties with error handling and transaction support
 * @param properties Array of properties to insert
 * @returns Array of inserted properties
 */
export async function batchInsertProperties(properties: NewProperty[]): Promise<Property[]> {
  return withTransaction(async () => {
    if (!properties.length) {
      return [];
    }
    
    // Validate all properties have required fields
    properties.forEach((property, index) => {
      if (!property.uploadId) {
        throw new Error(`Property at index ${index} is missing uploadId`);
      }
      if (!property.address) {
        throw new Error(`Property at index ${index} is missing address`);
      }
    });
    
    const result = await db.insert(schema.property)
      .values(properties)
      .returning();
    
    return result;
  });
}