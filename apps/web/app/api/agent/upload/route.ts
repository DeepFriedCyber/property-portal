import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as csvParse from 'csv-parse/sync';
import { createUploadRecord, createProperty } from '../../../../../lib/db/queries';
import { db } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { message: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }
    
    // Get user ID from session (this would be implemented with your auth system)
    const userId = 'user-123'; // Mock user ID
    
    // Read and parse CSV file
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);
    
    try {
      // Parse CSV
      const records = csvParse.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      // Validate CSV structure
      if (records.length === 0) {
        return NextResponse.json(
          { message: 'CSV file is empty' },
          { status: 400 }
        );
      }
      
      // Check required fields
      const requiredFields = ['address', 'price'];
      const firstRecord = records[0];
      
      for (const field of requiredFields) {
        if (!(field in firstRecord)) {
          return NextResponse.json(
            { message: `CSV is missing required field: ${field}` },
            { status: 400 }
          );
        }
      }
      
      // Use a transaction to ensure all operations succeed or fail together
      const result = await db.transaction(async (tx) => {
        // Create upload record in the database
        const upload = await createUploadRecord({
          id: uuidv4(),
          uploaderId: userId,
          filename: file.name,
          status: 'pending',
          createdAt: new Date()
        });
        
        // Process and save each property record
        for (const record of records) {
          await createProperty({
            id: uuidv4(),
            uploadId: upload.id,
            address: record.address,
            price: parseInt(record.price, 10),
            bedrooms: record.bedrooms ? parseInt(record.bedrooms, 10) : null,
            type: record.type || null,
            dateSold: record.dateSold ? new Date(record.dateSold) : null,
            embedding: null // We'll handle embeddings separately
          });
        }
        
        return {
          upload,
          propertyCount: records.length
        };
      });
      
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
      console.error('CSV parsing error:', parseError);
      return NextResponse.json(
        { message: 'Failed to parse CSV file. Please check the format.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the upload' },
      { status: 500 }
    );
  }
}