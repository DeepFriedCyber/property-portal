import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as csvParse from 'csv-parse/sync';
import { createUploadRecord, createProperty } from '../../../../../lib/db/queries';
import { db } from '../../../../../lib/db';
import { processUploadEmbeddings } from '../../../../../lib/db/property-processor';
import { auth } from '@clerk/nextjs/server';

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_FILENAME_REGEX = /^[\w\.-]+$/; // Only allow alphanumeric, underscore, dot, and hyphen

export async function POST(request: NextRequest) {
  try {
    // Get the user ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
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
    
    // Read and parse CSV file
    let fileBuffer: ArrayBuffer;
    let fileContent: string;
    
    try {
      // Read file content with security checks
      fileBuffer = await file.arrayBuffer();
      
      // Security check: Verify the file content is not empty
      if (fileBuffer.byteLength === 0) {
        console.warn(`Rejected empty file: ${fileName} (0 bytes)`);
        return NextResponse.json(
          { 
            message: 'File is empty',
            details: 'The uploaded file contains no data'
          },
          { status: 400 }
        );
      }
      
      // Decode the file content with error handling
      fileContent = new TextDecoder().decode(fileBuffer);
      
      // Security check: Basic content validation
      if (fileContent.length < 10) { // Arbitrary minimum for a valid CSV with headers
        console.warn(`Rejected file with insufficient content: ${fileName} (${fileContent.length} chars)`);
        return NextResponse.json(
          { 
            message: 'Invalid CSV content',
            details: 'The file appears to be too small to be a valid CSV with headers'
          },
          { status: 400 }
        );
      }
    } catch (decodeError) {
      console.error('File decoding error:', {
        error: decodeError instanceof Error ? decodeError.message : 'Unknown error',
        fileName: fileName,
        fileSize: file.size
      });
      
      return NextResponse.json(
        { 
          message: 'Failed to read file content',
          details: 'The file could not be decoded properly'
        },
        { status: 400 }
      );
    }
    
    try {
      // Parse CSV
      const records = csvParse.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
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
      
      try {
        const result = await db.transaction(async (tx) => {
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
        
        return result;
      } catch (dbError) {
        console.error('Database transaction failed:', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          stack: dbError instanceof Error ? dbError.stack : undefined,
          recordCount: records.length,
          fileName: file.name
        });
        
        throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
      
      // Trigger embedding generation in the background
      // We don't await this to avoid blocking the response
      processUploadEmbeddings(result.upload.id).catch(err => {
        console.error(`Error generating embeddings for upload ${result.upload.id}:`, err);
        // Consider implementing a notification system or retry mechanism here
      });
      
      console.info(`Successfully processed upload ${result.upload.id} with ${result.propertyCount} properties`);
      
      return NextResponse.json({
        message: 'File uploaded successfully',
        upload: {
          ...result.upload,
          propertyCount: result.propertyCount,
          // Don't expose the uploaderId in the response
          uploaderId: undefined
        }
      });
    } catch (parseError) {
      // Detailed CSV parsing error logging
      console.error('CSV parsing error:', {
        error: parseError.message,
        stack: parseError.stack,
        fileName: file.name,
        fileSize: file.size,
        contentPreview: fileContent.substring(0, 200) + '...' // Log a preview of the content
      });
      
      return NextResponse.json(
        { 
          message: `Failed to parse CSV file: ${parseError.message}`,
          details: 'Please check the CSV format and ensure it follows the required structure.',
          help: 'Make sure the CSV has headers and the data is properly formatted.'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Detailed general error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Upload error:', {
      message: errorMessage,
      stack: errorStack,
      userId: userId || 'unknown',
      endpoint: 'POST /api/agent/upload'
    });
    
    return NextResponse.json(
      { 
        message: 'An error occurred while processing the upload',
        details: errorMessage,
        requestId: uuidv4() // Include a request ID that can be referenced in logs
      },
      { status: 500 }
    );
  }
}