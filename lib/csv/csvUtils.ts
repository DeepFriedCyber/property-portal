import * as csvParse from 'csv-parse/sync'
import { NextResponse } from 'next/server'

import logger from '../../lib/logging/logger'

// Security constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const VALID_FILENAME_REGEX = /^[\w\.-]+$/ // Only allow alphanumeric, underscore, dot, and hyphen
export const STREAMING_THRESHOLD = 5 * 1024 * 1024 // 5MB threshold for streaming

export interface CsvRecord {
  [key: string]: string | number | boolean | null
}

export interface CsvValidationResult {
  isValid: boolean
  records?: CsvRecord[]
  response?: NextResponse
}

/**
 * Validates a file for CSV upload
 * @param file The file to validate
 * @returns Validation result with error response if invalid
 */
export function validateCsvFile(file: File): { isValid: boolean; response?: NextResponse } {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      response: NextResponse.json({ message: 'No file provided' }, { status: 400 }),
    }
  }

  // Validate filename to prevent path traversal attacks
  const fileName = file.name
  if (!fileName.match(VALID_FILENAME_REGEX)) {
    console.warn(`Rejected file with invalid filename: ${fileName}`)
    return {
      isValid: false,
      response: NextResponse.json(
        {
          message: 'Invalid filename',
          details: 'Filename can only contain letters, numbers, underscores, dots, and hyphens',
        },
        { status: 400 }
      ),
    }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    console.warn(`Rejected oversized file: ${fileName} (${file.size} bytes)`)
    return {
      isValid: false,
      response: NextResponse.json(
        {
          message: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB, received ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB`,
        },
        { status: 400 }
      ),
    }
  }

  // Check file type
  if (!file.name.endsWith('.csv')) {
    console.warn(`Rejected non-CSV file: ${fileName} (${file.type})`)
    return {
      isValid: false,
      response: NextResponse.json(
        {
          message: 'Only CSV files are allowed',
          details: 'Please upload a file with .csv extension',
        },
        { status: 400 }
      ),
    }
  }

  // Verify the file is not empty
  if (file.size === 0) {
    console.warn(`Rejected empty file: ${fileName} (0 bytes)`)
    return {
      isValid: false,
      response: NextResponse.json(
        {
          message: 'File is empty',
          details: 'The uploaded file contains no data',
        },
        { status: 400 }
      ),
    }
  }

  // Basic size validation
  if (file.size < 10) {
    // Arbitrary minimum for a valid CSV with headers
    console.warn(`Rejected file with insufficient content: ${fileName} (${file.size} bytes)`)
    return {
      isValid: false,
      response: NextResponse.json(
        {
          message: 'Invalid CSV content',
          details: 'The file appears to be too small to be a valid CSV with headers',
        },
        { status: 400 }
      ),
    }
  }

  return { isValid: true }
}

/**
 * Parses a CSV file and returns the records
 * @param file The CSV file to parse
 * @returns Parsed records or error response
 */
export async function parseCsvFile(file: File): Promise<CsvValidationResult> {
  logger.info(`Starting to process CSV file: ${file.name} (${file.size} bytes)`)

  try {
    let records: CsvRecord[] = []

    // For files under the threshold, use the direct parsing approach
    if (file.size < STREAMING_THRESHOLD) {
      // Use the direct parsing approach for smaller files
      const fileBuffer = await file.arrayBuffer()
      const fileContent = new TextDecoder().decode(fileBuffer)

      // Parse CSV
      records = parseCsv(fileContent)
      logger.info(`Parsed ${records.length} records from CSV file using direct parsing`)
    } else {
      // For larger files, use a chunked processing approach
      records = await parseChunkedCsvFile(file)
    }

    // Log successful parsing
    logger.info(`Successfully parsed CSV with ${records.length} records from file: ${file.name}`)

    // Validate CSV structure
    if (records.length === 0) {
      logger.warn(`Rejected empty CSV file: ${file.name}`)
      return {
        isValid: false,
        response: NextResponse.json(
          { message: 'CSV file is empty. Please provide a file with at least one record.' },
          { status: 400 }
        ),
      }
    }

    return { isValid: true, records }
  } catch (error) {
    logger.error(`Error parsing CSV file: ${file.name}`, error as Error)
    return {
      isValid: false,
      response: NextResponse.json(
        {
          message: 'Failed to parse CSV file',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      ),
    }
  }
}

/**
 * Parse a CSV string into records
 * @param content CSV content as string
 * @returns Parsed records
 */
export function parseCsv(content: string): CsvRecord[] {
  return csvParse.parse(content, {
    columns: true,
    skipEmptyLines: true,
    trim: true,
  })
}

/**
 * Validates that a CSV record has all required headers
 * @param record The first record from the CSV to check headers
 * @param requiredFields Array of required field names
 * @returns Array of missing field names (empty if all fields are present)
 */
export function validateCsvHeaders(record: CsvRecord, requiredFields: string[]): string[] {
  if (!record || typeof record !== 'object') {
    return requiredFields // All fields are missing if record is invalid
  }

  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (!(field in record)) {
      missingFields.push(field)
    }
  }

  return missingFields
}

/**
 * Validates that all required fields exist in the CSV records
 * @param records The CSV records to validate
 * @param requiredFields Array of required field names
 * @returns Validation result with error response if invalid
 */
export function validateCsvRecords(
  records: CsvRecord[],
  requiredFields: string[]
): { isValid: boolean; response?: NextResponse } {
  // First, check if all required fields exist in the CSV structure (using first record)
  const firstRecord = records[0]

  // Log the first record structure for debugging (excluding sensitive data)
  logger.info('First record structure:', { fields: Object.keys(firstRecord) })

  // Check if all required fields exist in the CSV structure
  for (const field of requiredFields) {
    if (!(field in firstRecord)) {
      logger.warn(`CSV missing required field: ${field}`, {
        availableFields: Object.keys(firstRecord),
        requiredFields,
      })
      return {
        isValid: false,
        response: NextResponse.json(
          {
            message: `CSV is missing required field: ${field}`,
            availableFields: Object.keys(firstRecord),
            requiredFields: requiredFields,
          },
          { status: 400 }
        ),
      }
    }
  }

  // Now validate all records to ensure consistency throughout the file
  logger.info(`Validating all ${records.length} records for required fields...`)

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    for (const field of requiredFields) {
      if (
        !(field in record) ||
        record[field] === null ||
        record[field] === undefined ||
        record[field] === ''
      ) {
        logger.warn(`Record at index ${i} is missing required field "${field}"`, {
          recordIndex: i,
          fieldName: field,
        })
        return {
          isValid: false,
          response: NextResponse.json(
            {
              message: `Missing or empty required field "${field}" in record ${i + 1}`,
              details: `All records must contain non-empty values for fields: ${requiredFields.join(
                ', '
              )}`,
              recordIndex: i,
              fieldName: field,
            },
            { status: 400 }
          ),
        }
      }
    }

    // Validate price field is a valid number
    if ('price' in record && isNaN(parseInt(String(record.price), 10))) {
      logger.warn(`Record at index ${i} has invalid price value`, {
        recordIndex: i,
        priceValue: record.price,
      })
      return {
        isValid: false,
        response: NextResponse.json(
          {
            message: `Invalid price value in record ${i + 1}`,
            details: `Price must be a valid number, found: "${record.price}"`,
            recordIndex: i,
          },
          { status: 400 }
        ),
      }
    }
  }

  logger.info('All records successfully validated for required fields')
  return { isValid: true }
}

/**
 * Processes a large CSV file in chunks to avoid memory issues
 * @param file The large CSV file to process
 * @returns Array of parsed records
 */
async function parseChunkedCsvFile(file: File): Promise<CsvRecord[]> {
  logger.info(`Using chunked processing for large file: ${file.name} (${file.size} bytes)`)

  // Get the file as an ArrayBuffer but process it in chunks
  const fileBuffer = await file.arrayBuffer()
  const CHUNK_SIZE = 1024 * 1024 // 1MB chunks
  const decoder = new TextDecoder()

  let csvContent = ''
  let processedBytes = 0
  let records: CsvRecord[] = []

  // Process the first chunk to extract headers
  const firstChunkSize = Math.min(CHUNK_SIZE, fileBuffer.byteLength)
  const firstChunk = new Uint8Array(fileBuffer, 0, firstChunkSize)
  const firstChunkText = decoder.decode(firstChunk, { stream: true })

  // Extract the header row
  const headerEndIndex = firstChunkText.indexOf('\n')
  if (headerEndIndex === -1) {
    throw new Error('Could not find header row in CSV file')
  }

  // We only need to extract the header to validate the file structure
  const headerLine = firstChunkText.substring(0, headerEndIndex).trim()
  logger.debug('CSV header line extracted', { headerLine })

  csvContent = firstChunkText
  processedBytes = firstChunkSize

  // Process the rest of the file in chunks
  while (processedBytes < fileBuffer.byteLength) {
    const chunkSize = Math.min(CHUNK_SIZE, fileBuffer.byteLength - processedBytes)
    const chunk = new Uint8Array(fileBuffer, processedBytes, chunkSize)
    const chunkText = decoder.decode(chunk, {
      stream: processedBytes + chunkSize < fileBuffer.byteLength,
    })

    csvContent += chunkText
    processedBytes += chunkSize

    // Log progress for very large files
    if (processedBytes % (10 * CHUNK_SIZE) === 0) {
      logger.info(`Processed ${processedBytes} of ${fileBuffer.byteLength} bytes`, {
        processedBytes,
        totalBytes: fileBuffer.byteLength,
        percentComplete: Math.round((processedBytes / fileBuffer.byteLength) * 100),
      })
    }

    // If we've accumulated enough data, parse and clear the buffer
    if (csvContent.length > 5 * CHUNK_SIZE) {
      // Make sure we break at a newline to avoid splitting records
      const lastNewlineIndex = csvContent.lastIndexOf('\n')
      if (lastNewlineIndex !== -1) {
        const contentToParse = csvContent.substring(0, lastNewlineIndex + 1)
        csvContent = csvContent.substring(lastNewlineIndex + 1)

        // Parse this chunk of CSV data
        try {
          const chunkRecords = parseCsv(contentToParse)
          records = records.concat(chunkRecords)
          logger.info(`Parsed records from chunk`, {
            chunkRecords: chunkRecords.length,
            totalRecords: records.length,
          })
        } catch (chunkError) {
          logger.error('Error parsing CSV chunk', chunkError as Error)
          throw chunkError
        }
      }
    }
  }

  // Parse any remaining content
  if (csvContent.length > 0) {
    try {
      const finalRecords = parseCsv(csvContent)
      records = records.concat(finalRecords)
      logger.info(`Parsed records from final chunk`, {
        finalRecords: finalRecords.length,
        totalRecords: records.length,
      })
    } catch (finalError) {
      logger.error('Error parsing final CSV chunk', finalError as Error)
      throw finalError
    }
  }

  return records
}
