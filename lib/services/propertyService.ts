import { CsvRecord } from '@root/lib/csv/csvUtils';
import { db, schema } from '@root/lib/db';
import { processUploadEmbeddings } from '@root/lib/db/property-processor';
import {
  createUploadRecord,
  createProperty,
  getUploadRecordsByUploader,
} from '@root/lib/db/queries';
import logger from '@root/lib/logging/logger';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface PropertyUploadResult {
  success: boolean;
  upload: {
    id: string;
    status: string;
  };
  propertiesCreated: number;
  error?: string;
}

/**
 * Saves property records to the database
 * @param userId The ID of the user uploading the properties
 * @param fileName The name of the uploaded file
 * @param records The property records to save
 * @returns Object containing upload ID and property count
 */
export async function saveProperties(userId: string, fileName: string, records: CsvRecord[]) {
  logger.info(`Starting to save ${records.length} properties for user ${userId}`);

  const uploadId = uuidv4();

  // Create the upload record
  const upload = await createUploadRecord({
    id: uploadId,
    uploaderId: userId,
    filename: fileName,
    status: 'pending',
    createdAt: new Date(),
  });

  // Save each property record
  let savedCount = 0;
  for (const record of records) {
    await createProperty({
      id: uuidv4(),
      uploadId: upload.id,
      address: record.address,
      price: parseInt(record.price, 10),
      bedrooms: record.bedrooms ? parseInt(record.bedrooms, 10) : null,
      bathrooms: record.bathrooms ? parseFloat(record.bathrooms) : null,
      squareFeet: record.squareFeet ? parseInt(record.squareFeet, 10) : null,
      description: record.description || null,
      type: record.type || null,
      yearBuilt: record.yearBuilt ? parseInt(record.yearBuilt, 10) : null,
      lotSize: record.lotSize || null,
      parkingSpaces: record.parkingSpaces ? parseInt(record.parkingSpaces, 10) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    savedCount++;
  }

  logger.info(`Successfully saved ${savedCount} properties for upload ${uploadId}`);

  return {
    uploadId,
    propertyCount: records.length,
  };
}

/**
 * Processes property records and saves them to the database
 * @param records The property records to save
 * @param userId The ID of the user uploading the properties
 * @param filename The name of the uploaded file
 * @returns Result of the upload operation
 */
export async function processPropertyUpload(
  records: CsvRecord[],
  userId: string,
  filename: string
): Promise<PropertyUploadResult> {
  logger.info(`Starting database transaction for ${records.length} properties`);

  try {
    const result = await db.transaction(async (tx: typeof db) => {
      // Use the saveProperties function to handle the database operations
      const { uploadId, propertyCount } = await saveProperties(userId, filename, records);

      // Update upload status to complete
      await tx
        .update(schema.uploadRecord)
        .set({ status: 'complete' })
        .where(eq(schema.uploadRecord.id, uploadId))
        .execute();

      logger.info(`Successfully processed ${propertyCount} properties for upload ${uploadId}`);

      // Get the upload record to return
      const upload = await tx
        .select()
        .from(schema.uploadRecord)
        .where(eq(schema.uploadRecord.id, uploadId))
        .then((rows) => rows[0]);

      return {
        upload,
        propertiesCreated: propertyCount,
      };
    });

    // Trigger embedding generation in the background
    // We don't await this to avoid blocking the response
    triggerEmbeddingGeneration(result.upload.id);

    return {
      success: true,
      upload: {
        id: result.upload.id,
        status: 'complete',
      },
      propertiesCreated: result.propertiesCreated,
    };
  } catch (error) {
    logger.error('Error processing property upload', error as Error, {
      userId,
      filename,
      recordCount: records.length,
    });

    return {
      success: false,
      upload: {
        id: '',
        status: 'failed',
      },
      propertiesCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Triggers the generation of embeddings for an upload in the background
 * @param uploadId The ID of the upload to generate embeddings for
 */
function triggerEmbeddingGeneration(uploadId: string): void {
  processUploadEmbeddings(uploadId).catch((err: Error) => {
    logger.error(`Error generating embeddings for upload ${uploadId}`, err, {
      uploadId,
      timestamp: new Date().toISOString(),
    });

    // Update upload status to reflect embedding failure
    db.update(schema.uploadRecord)
      .set({ status: 'embedding_failed' })
      .where(eq(schema.uploadRecord.id, uploadId))
      .execute()
      .catch((updateErr: Error) => {
        logger.error(`Failed to update upload status for ${uploadId}`, updateErr, {
          uploadId,
        });
      });

    // TODO: Implement a notification system or retry mechanism
    // For example, you could add this failed upload to a queue for retry
    // or send a notification to the user or admin
  });
}

/**
 * Checks if a user has uploaded before
 * @param userId The ID of the user to check
 * @returns Whether the user has uploaded before
 */
export async function checkUserUploadHistory(userId: string): Promise<boolean> {
  try {
    const previousUploads = await getUploadRecordsByUploader(userId);

    // If this is the user's first upload, log it for monitoring
    if (previousUploads.length === 0) {
      logger.info(`First-time upload from user ${userId}`, { userId, firstUpload: true });
      return false;
    }

    return true;
  } catch (userCheckError) {
    logger.error(`Error checking user upload history for ${userId}`, userCheckError as Error, {
      userId,
    });
    // We'll continue processing even if this check fails
    // It's just for monitoring purposes
    return false;
  }
}
