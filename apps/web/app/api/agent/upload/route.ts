import { auth } from '@clerk/nextjs/server'
import { parse } from 'csv-parse/sync'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../../lib/db'
import { withRateLimit } from '../../../../lib/rate-limit'
import { Property } from '../../../../lib/types/property'

// Define the expected CSV columns for UK properties
const CSV_COLUMNS = [
  'address',
  'city',
  'county',
  'postcode',
  'price',
  'bedrooms',
  'bathrooms',
  'squareFeet',
  'description',
  'type',
  'councilTaxBand',
  'tenure',
  'epcRating',
]

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Type representing a row from the CSV file
 */
interface CSVPropertyRow {
  address: string
  city?: string
  county?: string
  postcode?: string
  price?: string
  bedrooms?: string
  bathrooms?: string
  squareFeet?: string
  description?: string
  type?: string
  councilTaxBand?: string
  tenure?: string
  epcRating?: string
  features?: string
  [key: string]: string | undefined // Allow for additional columns
}

/**
 * Validates and transforms CSV data into property objects
 */
function validateAndTransformCSV(csvData: CSVPropertyRow[]): {
  valid: Property[]
  invalid: { row: number; errors: string[] }[]
} {
  const valid: Property[] = []
  const invalid: { row: number; errors: string[] }[] = []

  csvData.forEach((row, index) => {
    const errors: string[] = []

    // Check required fields
    if (!row.address) {
      errors.push('Address is required')
    }

    // Validate numeric fields
    if (row.price && isNaN(Number(row.price))) {
      errors.push('Price must be a number')
    }

    if (row.bedrooms && isNaN(Number(row.bedrooms))) {
      errors.push('Bedrooms must be a number')
    }

    if (row.bathrooms && isNaN(Number(row.bathrooms))) {
      errors.push('Bathrooms must be a number')
    }

    if (row.squareFeet && isNaN(Number(row.squareFeet))) {
      errors.push('Square feet must be a number')
    }

    // Validate UK-specific fields
    if (
      row.councilTaxBand &&
      !['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(row.councilTaxBand.toUpperCase())
    ) {
      errors.push('Council Tax Band must be between A and H')
    }

    if (
      row.epcRating &&
      !['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(row.epcRating.toUpperCase())
    ) {
      errors.push('EPC Rating must be between A and G')
    }

    if (row.tenure && !['Freehold', 'Leasehold', 'Share of Freehold'].includes(row.tenure)) {
      errors.push('Tenure must be Freehold, Leasehold, or Share of Freehold')
    }

    if (errors.length > 0) {
      invalid.push({ row: index + 2, errors }) // +2 for header row and 0-indexing
    } else {
      // Transform to property object
      const property: Property = {
        id: uuidv4(),
        uploadId: '', // Will be set later
        address: row.address,
        city: row.city || undefined,
        state: row.county || undefined, // Map county to state field
        postcode: row.postcode || undefined, // UK postcode
        price: row.price ? Number(row.price) : undefined,
        bedrooms: row.bedrooms ? Number(row.bedrooms) : undefined,
        bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
        squareFeet: row.squareFeet ? Number(row.squareFeet) : undefined,
        description: row.description || undefined,
        status: 'available',
        createdAt: new Date().toISOString(),
        features: row.features ? row.features.split(',').map((f: string) => f.trim()) : undefined,
        // UK-specific fields
        councilTaxBand: row.councilTaxBand || undefined,
        tenure: row.tenure || undefined,
        epcRating: row.epcRating || undefined,
        // Note: 'type' field from CSV is not used as it's not in the Property interface
      }

      valid.push(property)
    }
  })

  return { valid, invalid }
}

/**
 * Handler for property CSV uploads with rate limiting
 */
async function handler(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to upload properties',
        },
        { status: 401 }
      )
    }

    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Request must be multipart/form-data',
        },
        { status: 400 }
      )
    }

    // Get the form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    // Validate file
    if (!file) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No file provided',
        },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      )
    }

    // Check file type (should be CSV)
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'File must be a CSV',
        },
        { status: 400 }
      )
    }

    // Read the file content
    const fileContent = await file.text()

    // Parse CSV
    let csvData: CSVPropertyRow[]
    try {
      csvData = parse(fileContent, {
        columns: true,
        skipEmptyLines: true,
        trim: true,
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Failed to parse CSV file. Please check the format.',
          details: error instanceof Error ? error.message : 'Unknown parsing error',
        },
        { status: 400 }
      )
    }

    // Validate CSV data
    if (csvData.length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'CSV file is empty',
        },
        { status: 400 }
      )
    }

    // Validate CSV columns - check if required columns exist
    const firstRow = csvData[0]
    const requiredColumns = ['address', 'postcode', 'price']
    const missingRequiredColumns = requiredColumns.filter(column => !(column in firstRow))

    if (missingRequiredColumns.length > 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'CSV file is missing required columns',
          details: `Missing required columns: ${missingRequiredColumns.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Check for recommended columns
    const recommendedColumns = CSV_COLUMNS.filter(col => !requiredColumns.includes(col))
    const missingRecommendedColumns = recommendedColumns.filter(column => !(column in firstRow))

    // We don't return an error for missing recommended columns, but we log them
    if (missingRecommendedColumns.length > 0) {
      console.warn(`CSV is missing recommended columns: ${missingRecommendedColumns.join(', ')}`)
    }

    // Validate and transform CSV data
    const { valid, invalid } = validateAndTransformCSV(csvData)

    // Generate upload ID
    const uploadId = uuidv4()

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        id: uploadId,
        userId,
        filename: file.name,
        status: 'processing',
        totalProperties: valid.length,
        invalidProperties: invalid.length,
        createdAt: new Date(),
        processingStats: JSON.stringify({
          totalRows: csvData.length,
          validRows: valid.length,
          invalidRows: invalid.length,
          startedAt: new Date().toISOString(),
        }),
      },
    })

    // If there are valid properties, create them in the database
    if (valid.length > 0) {
      // Set the upload ID for all properties
      const propertiesWithUploadId = valid.map(property => ({
        ...property,
        uploadId,
        createdBy: userId,
      }))

      // Create properties in the database
      await prisma.property.createMany({
        data: propertiesWithUploadId.map(property => ({
          id: property.id,
          uploadId: property.uploadId,
          address: property.address,
          city: property.city,
          state: property.state, // County in UK context
          postcode: property.postcode, // UK postcode
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.squareFeet, // Map to area field in the schema
          description: property.description,
          createdBy: property.createdBy,
          // UK-specific fields
          councilTaxBand: property.councilTaxBand,
          tenure: property.tenure,
          epcRating: property.epcRating,
        })),
      })

      // Update upload status
      await prisma.upload.update({
        where: { id: uploadId },
        data: {
          status: 'complete',
          updatedAt: new Date(),
          processingStats: JSON.stringify({
            totalRows: csvData.length,
            validRows: valid.length,
            invalidRows: invalid.length,
            completedAt: new Date().toISOString(),
          }),
        },
      })
    } else {
      // Update upload status to failed if no valid properties
      await prisma.upload.update({
        where: { id: uploadId },
        data: {
          status: 'failed',
          updatedAt: new Date(),
          processingStats: JSON.stringify({
            totalRows: csvData.length,
            validRows: 0,
            invalidRows: invalid.length,
            failedAt: new Date().toISOString(),
            reason: 'No valid properties found in the CSV',
          }),
        },
      })
    }

    // Return response
    return NextResponse.json(
      {
        message: 'Upload processed successfully',
        uploadId,
        propertyCount: valid.length,
        invalidCount: invalid.length,
        invalidRows: invalid.length > 0 ? invalid : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing upload:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Apply rate limiting: 5 requests per minute
export const POST = withRateLimit(handler, {
  limit: 5,
  interval: 60, // 60 seconds
  // Use user ID if available, otherwise fall back to IP
  identifierFn: async req => {
    const { userId } = await auth()
    return userId || req.headers.get('x-forwarded-for') || 'unknown-ip'
  },
})
