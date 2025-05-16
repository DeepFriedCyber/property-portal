import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { parseCsv, validateCsvHeaders } from '@root/lib/csv/csvUtils';
import { userHasRole } from '@root/lib/auth/authUtils';
import { saveProperties } from '@root/lib/services/propertyService';
import logger from '@root/lib/logging/logger';

/**
 * Creates a forbidden response
 * @returns NextResponse with 403 status
 */
function forbiddenResp() {
  return NextResponse.json(
    {
      message: 'Forbidden - Insufficient permissions',
      details: 'Only agents and administrators can upload property data',
    },
    { status: 403 }
  );
}

/**
 * Creates a response for missing required fields
 * @param missing Array of missing field names
 * @returns NextResponse with 400 status
 */
function missingFieldResp(missing: string[] = []) {
  return NextResponse.json(
    {
      message: 'Missing required fields',
      details: `The CSV must include these fields: ${missing.join(', ')}`,
      missingFields: missing,
    },
    { status: 400 }
  );
}

/**
 * API handler for property CSV uploads
 * Handles authentication, file validation, CSV parsing, and database operations
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication and authorization
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      logger.warn('Unauthorized access attempt to upload endpoint');
      return NextResponse.json(
        { message: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    if (!userHasRole(sessionClaims, ['agent', 'admin'])) {
      logger.warn(`User ${userId} attempted to upload without required role`);
      return forbiddenResp();
    }

    // 2. Parse FormData and validate file
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // File validation checks
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const VALID_FILENAME_REGEX = /^[\w\.-]+$/;

    if (!file.name.match(VALID_FILENAME_REGEX)) {
      logger.warn(`Rejected file with invalid filename: ${file.name}`);
      return NextResponse.json(
        {
          message: 'Invalid filename',
          details: 'Filename can only contain letters, numbers, underscores, dots, and hyphens',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      logger.warn(`Rejected oversized file: ${file.name} (${file.size} bytes)`);
      return NextResponse.json(
        {
          message: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB, received ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      logger.warn(`Rejected non-CSV file: ${file.name} (${file.type})`);
      return NextResponse.json(
        {
          message: 'Only CSV files are allowed',
          details: 'Please upload a file with .csv extension',
        },
        { status: 400 }
      );
    }

    // 3. Parse and validate CSV
    const content = await file.arrayBuffer();
    const records = parseCsv(new TextDecoder().decode(content));

    if (records.length === 0) {
      logger.warn(`Rejected empty CSV file: ${file.name}`);
      return NextResponse.json(
        { message: 'CSV file is empty. Please provide a file with at least one record.' },
        { status: 400 }
      );
    }

    const requiredFields = ['address', 'price'];
    const missing = validateCsvHeaders(records[0], requiredFields);
    if (missing.length > 0) {
      logger.warn(`CSV missing required fields: ${missing.join(', ')}`);
      return missingFieldResp(missing);
    }

    // 4. Save to database (transaction)
    logger.info(`Processing ${records.length} records from file ${file.name}`, { userId });
    const { uploadId, propertyCount } = await saveProperties(userId, file.name, records);

    // 5. Respond with success
    logger.info(`Successfully processed upload ${uploadId} with ${propertyCount} properties`, {
      userId,
      uploadId,
    });
    return NextResponse.json({
      message: 'Upload successful',
      uploadId,
      propertyCount,
    });
  } catch (error) {
    // Log the error and return a sanitized response
    logger.error('Error processing upload', error as Error);
    return NextResponse.json(
      {
        message: 'An error occurred while processing the upload',
        details: 'Please try again or contact support if the problem persists',
      },
      { status: 500 }
    );
  }
}
