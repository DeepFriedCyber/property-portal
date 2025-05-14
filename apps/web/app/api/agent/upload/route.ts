import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as csvParse from 'csv-parse/sync';
import { createUploadRecord, createProperty, getUploadRecordsByUploader } from '@root/lib/db/queries';
import { db, schema } from '@root/lib/db';
import { processUploadEmbeddings } from '@root/lib/db/property-processor';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_FILENAME_REGEX = /^[\w\.-]+$/; // Only allow alphanumeric, underscore, dot, and hyphen

export async function POST(request: NextRequest) {
  // Define userId at the function scope level so it's available in all blocks
  let userId: string | null = null;
  
  try {
    // Get the user ID and authentication data from Clerk
    const authResult = await auth();
    userId = authResult.userId;
    const { sessionClaims } = authResult;
    
    // Check if user is authenticated
    if (!userId) {
      console.warn('Unauthorized access attempt to upload endpoint');
      return NextResponse.json(
        { message: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has the required role (agent or admin)
    // This assumes Clerk is configured with custom roles in session claims
    const userRoles = sessionClaims?.roles as string[] || [];
    const hasRequiredRole = userRoles.some(role => ['agent', 'admin'].includes(role));
    
    if (!hasRequiredRole) {
      console.warn(`User ${userId} attempted to upload without required role`);
      return NextResponse.json(
        { 
          message: 'Forbidden - Insufficient permissions',
          details: 'Only agents and administrators can upload property data'
        },
        { status: 403 }
      );
    }
    
    // Verify the user has uploaded before or has an active account
    try {
      const previousUploads = await getUploadRecordsByUploader(userId);
      
      // If this is the user's first upload, log it for monitoring
      if (previousUploads.length === 0) {
        console.info(`First-time upload from user ${userId}`);
      }
    } catch (userCheckError) {
      console.error(`Error checking user upload history for ${userId}:`, userCheckError);
      // We'll continue processing even if this check fails
      // It's just for monitoring purposes
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Security check: Validate filename to prevent path traversal attacks
    const fileName = file.name;
    if (!fileName.match(VALID_FILENAME_REGEX)) {
      console.warn(`Rejected file with invalid filename: ${fileName}`);
      return NextResponse.json(
        { 
          message: 'Invalid filename', 
          details: 'Filename can only contain letters, numbers, underscores, dots, and hyphens'
        }, 
        { status: 400 }
      );
    }
    
    // Security check: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`Rejected oversized file: ${fileName} (${file.size} bytes)`);
      return NextResponse.json(
        { 
          message: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB, received ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      console.warn(`Rejected non-CSV file: ${fileName} (${file.type})`);
      return NextResponse.json(
        { 
          message: 'Only CSV files are allowed',
          details: 'Please upload a file with .csv extension'
        },
        { status: 400 }
      );
    }
    
    // Process and parse CSV file using a more efficient approach
    try {
      // Security check: Verify the file is not empty
      if (file.size === 0) {
        console.warn(`Rejected empty file: ${fileName} (0 bytes)`);
        return NextResponse.json(
          { 
            message: 'File is empty',
            details: 'The uploaded file contains no data'
          },
          { status: 400 }
        );
      }
      
      // Security check: Basic size validation
      if (file.size < 10) { // Arbitrary minimum for a valid CSV with headers
        console.warn(`Rejected file with insufficient content: ${fileName} (${file.size} bytes)`);
        return NextResponse.json(
          { 
            message: 'Invalid CSV content',
            details: 'The file appears to be too small to be a valid CSV with headers'
          },
          { status: 400 }
        );
      }
      
      console.info(`Starting to process CSV file: ${fileName} (${file.size} bytes)`);
      
      // We'll use a hybrid approach based on file size
      let records: any[] = [];
      
      // For files under the threshold, use the direct parsing approach
      // This is simpler and works well for most uploads
      const STREAMING_THRESHOLD = 5 * 1024 * 1024; // 5MB threshold for streaming
      
      if (file.size < STREAMING_THRESHOLD) {
        // Use the direct parsing approach for smaller files
        const fileBuffer = await file.arrayBuffer();
        const fileContent = new TextDecoder().decode(fileBuffer);
        
        // Parse CSV
        records = csvParse.parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
        
        console.info(`Parsed ${records.length} records from CSV file using direct parsing`);
      } else {
        // For larger files, use a chunked processing approach
        // This processes the file in smaller chunks to avoid memory issues
        console.info(`Using chunked processing for large file: ${fileName} (${file.size} bytes)`);
        
        // Get the file as an ArrayBuffer but process it in chunks
        const fileBuffer = await file.arrayBuffer();
        const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
        const decoder = new TextDecoder();
        
        let csvContent = '';
        let headerRow = '';
        let processedBytes = 0;
        
        // Process the first chunk to extract headers
        const firstChunkSize = Math.min(CHUNK_SIZE, fileBuffer.byteLength);
        const firstChunk = new Uint8Array(fileBuffer, 0, firstChunkSize);
        const firstChunkText = decoder.decode(firstChunk, { stream: true });
        
        // Extract the header row
        const headerEndIndex = firstChunkText.indexOf('\n');
        if (headerEndIndex === -1) {
          throw new Error('Could not find header row in CSV file');
        }
        
        headerRow = firstChunkText.substring(0, headerEndIndex).trim();
        csvContent = firstChunkText;
        processedBytes = firstChunkSize;
        
        // Process the rest of the file in chunks
        while (processedBytes < fileBuffer.byteLength) {
          const chunkSize = Math.min(CHUNK_SIZE, fileBuffer.byteLength - processedBytes);
          const chunk = new Uint8Array(fileBuffer, processedBytes, chunkSize);
          const chunkText = decoder.decode(chunk, { stream: processedBytes + chunkSize < fileBuffer.byteLength });
          
          csvContent += chunkText;
          processedBytes += chunkSize;
          
          // Log progress for very large files
          if (processedBytes % (10 * CHUNK_SIZE) === 0) {
            console.info(`Processed ${processedBytes} of ${fileBuffer.byteLength} bytes (${Math.round(processedBytes / fileBuffer.byteLength * 100)}%)`);
          }
          
          // If we've accumulated enough data, parse and clear the buffer
          if (csvContent.length > 5 * CHUNK_SIZE) {
            // Make sure we break at a newline to avoid splitting records
            const lastNewlineIndex = csvContent.lastIndexOf('\n');
            if (lastNewlineIndex !== -1) {
              const contentToParse = csvContent.substring(0, lastNewlineIndex + 1);
              csvContent = csvContent.substring(lastNewlineIndex + 1);
              
              // Parse this chunk of CSV data
              try {
                const chunkRecords = csvParse.parse(contentToParse, {
                  columns: true,
                  skip_empty_lines: true,
                  trim: true
                });
                
                records = records.concat(chunkRecords);
                console.info(`Parsed ${chunkRecords.length} records from chunk, total: ${records.length}`);
              } catch (chunkError) {
                console.error('Error parsing CSV chunk:', chunkError);
                throw chunkError;
              }
            }
          }
        }
        
        // Parse any remaining content
        if (csvContent.length > 0) {
          try {
            const finalRecords = csvParse.parse(csvContent, {
              columns: true,
              skip_empty_lines: true,
              trim: true
            });
            
            records = records.concat(finalRecords);
            console.info(`Parsed ${finalRecords.length} records from final chunk, total: ${records.length}`);
          } catch (finalError) {
            console.error('Error parsing final CSV chunk:', finalError);
            throw finalError;
          }
        }
      }
      
      // Log successful parsing
      console.info(`Successfully parsed CSV with ${records.length} records from file: ${file.name}`);
      
      // Validate CSV structure
      if (records.length === 0) {
        console.warn(`Rejected empty CSV file: ${file.name}`);
        return NextResponse.json(
          { message: 'CSV file is empty. Please provide a file with at least one record.' },
          { status: 400 }
        );
      }
      
      // Define required fields
      const requiredFields = ['address', 'price'];
      
      // First, check if all required fields exist in the CSV structure (using first record)
      const firstRecord = records[0];
      
      // Log the first record structure for debugging (excluding sensitive data)
      console.info('First record structure:', Object.keys(firstRecord));
      
      // Check if all required fields exist in the CSV structure
      for (const field of requiredFields) {
        if (!(field in firstRecord)) {
          console.warn(`CSV missing required field: ${field}. Available fields: ${Object.keys(firstRecord).join(', ')}`);
          return NextResponse.json(
            { 
              message: `CSV is missing required field: ${field}`,
              availableFields: Object.keys(firstRecord),
              requiredFields: requiredFields
            },
            { status: 400 }
          );
        }
      }
      
      // Now validate all records to ensure consistency throughout the file
      console.info(`Validating all ${records.length} records for required fields...`);
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        for (const field of requiredFields) {
          if (!(field in record) || record[field] === null || record[field] === undefined || record[field] === '') {
            console.warn(`Record at index ${i} is missing required field "${field}" or has empty value`);
            return NextResponse.json(
              { 
                message: `Missing or empty required field "${field}" in record ${i + 1}`,
                details: `All records must contain non-empty values for fields: ${requiredFields.join(', ')}`,
                recordIndex: i,
                fieldName: field
              },
              { status: 400 }
            );
          }
        }
        
        // Validate price field is a valid number
        if (isNaN(parseInt(record.price, 10))) {
          console.warn(`Record at index ${i} has invalid price value: "${record.price}"`);
          return NextResponse.json(
            { 
              message: `Invalid price value in record ${i + 1}`,
              details: `Price must be a valid number, found: "${record.price}"`,
              recordIndex: i
            },
            { status: 400 }
          );
        }
      }
      
      console.info('All records successfully validated for required fields');
      
      // Use a transaction to ensure all operations succeed or fail together
      console.info(`Starting database transaction for ${records.length} properties`);
      
      let result;
      try {
        result = await db.transaction(async (tx) => {
          // Create upload record in the database
          const uploadId = uuidv4();
          console.info(`Creating upload record with ID: ${uploadId}`);
          
          const upload = await createUploadRecord({
            id: uploadId,
            uploaderId: userId,
            filename: file.name,
            status: 'pending',
            createdAt: new Date()
          });
          
          // Process and save each property record
          console.info(`Processing ${records.length} property records for upload ${upload.id}`);
          
          let processedCount = 0;
          for (const record of records) {
            try {
              // Since we've already validated required fields, we can safely create the property
              // But we'll still use defensive programming for optional fields
              await createProperty({
                id: uuidv4(),
                uploadId: upload.id,
                address: record.address.trim(), // Trim whitespace
                price: parseInt(record.price, 10), // Already validated as a number
                bedrooms: record.bedrooms ? parseInt(record.bedrooms, 10) : null,
                type: record.type ? record.type.trim() : null,
                dateSold: record.dateSold ? new Date(record.dateSold) : null,
                embedding: null // We'll handle embeddings separately
              });
              processedCount++;
              
              // Log progress for large uploads
              if (processedCount % 100 === 0) {
                console.info(`Processed ${processedCount}/${records.length} properties`);
              }
            } catch (recordError) {
              // Log the specific record that failed
              console.error('Failed to process property record:', {
                error: recordError instanceof Error ? recordError.message : 'Unknown error',
                record: JSON.stringify(record)
              });
              // Re-throw to trigger transaction rollback
              throw recordError;
            }
          }
          
          console.info(`Successfully processed all ${processedCount} property records`);
          
          return {
            upload,
            propertyCount: records.length
          };
        });
      } catch (dbError) {
        console.error('Database transaction failed:', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          stack: dbError instanceof Error ? dbError.stack : undefined,
          recordCount: records.length,
          fileName: file.name
        });
        
        return NextResponse.json(
          { 
            message: 'Database operation failed',
            details: dbError instanceof Error ? dbError.message : 'Unknown error',
            requestId: uuidv4() // Include a request ID that can be referenced in logs
          },
          { status: 500 }
        );
      }
      
      // Trigger embedding generation in the background
      // We don't await this to avoid blocking the response
      processUploadEmbeddings(result.upload.id).catch(err => {
        console.error(`Error generating embeddings for upload ${result.upload.id}:`, {
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          uploadId: result.upload.id,
          timestamp: new Date().toISOString()
        });
        
        // Update the upload status to indicate embedding generation failed
        db.update(schema.uploadRecord)
          .set({ status: 'embedding_failed' })
          .where(eq(schema.uploadRecord.id, result.upload.id))
          .execute()
          .catch(updateErr => {
            console.error(`Failed to update upload status for ${result.upload.id}:`, updateErr);
          });
          
        // TODO: Implement a notification system or retry mechanism
        // For example, you could add this failed upload to a queue for retry
        // or send a notification to the user or admin
      });
      
      // Log the successful upload with user ID for audit purposes
      console.info(`Successfully processed upload ${result.upload.id} with ${result.propertyCount} properties by user ${userId}`);
      
      // Create a sanitized version of the upload record for the response
      // This ensures we don't accidentally expose sensitive information
      const sanitizedUpload = {
        id: result.upload.id,
        filename: result.upload.filename,
        status: result.upload.status,
        createdAt: result.upload.createdAt,
        propertyCount: result.propertyCount
        // Explicitly omit uploaderId and any other sensitive fields
      };
      
      return NextResponse.json({
        message: 'File uploaded successfully',
        upload: sanitizedUpload
      });
    } catch (parseError) {
      // Generate a unique error reference ID
      const errorReferenceId = uuidv4();
      
      // Detailed CSV parsing error logging for internal debugging
      console.error('CSV parsing error:', {
        referenceId: errorReferenceId,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        stack: parseError instanceof Error ? parseError.stack : 'No stack trace available',
        fileName: file.name,
        fileSize: file.size,
        userId: userId,
        timestamp: new Date().toISOString(),
        // We don't include content preview in the chunked parsing approach
        // as fileContent might not be defined, and we want to avoid memory issues
      });
      
      // Return a helpful but sanitized error response
      return NextResponse.json(
        { 
          message: 'Failed to parse CSV file',
          details: 'Please check the CSV format and ensure it follows the required structure.',
          help: 'Make sure the CSV has headers and the data is properly formatted.',
          referenceId: errorReferenceId
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Generate a unique error reference ID that can be used to correlate logs with user reports
    const errorReferenceId = uuidv4();
    
    // Detailed general error logging with sensitive information for internal use only
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log detailed error information for debugging (including sensitive data)
    console.error('Upload error:', {
      referenceId: errorReferenceId,
      message: errorMessage,
      stack: errorStack,
      userId: userId || 'unknown',
      endpoint: 'POST /api/agent/upload',
      timestamp: new Date().toISOString(),
      fileName: 'unknown', // File might not be available in the error context
      fileSize: 'unknown'  // File might not be available in the error context
    });
    
    // Return a sanitized error response without exposing internal details or sensitive information
    return NextResponse.json(
      { 
        message: 'An error occurred while processing the upload',
        details: 'Please try again or contact support if the problem persists',
        referenceId: errorReferenceId // Include reference ID so users can report issues
      },
      { status: 500 }
    );
  }
}