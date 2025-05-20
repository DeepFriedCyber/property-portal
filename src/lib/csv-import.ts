import { z } from 'zod'

import { createPropertySchema } from './schemas/propertySchemas'

// Type for CSV validation errors
export type CSVValidationError = {
  row: number
  errors: Record<string, string[]>
}

// Type for CSV validation result
export type CSVValidationResult = {
  valid: boolean
  data: z.infer<typeof createPropertySchema>[]
  errors: CSVValidationError[]
}

/**
 * Parse and validate a CSV string containing property data
 * @param csvString The CSV string to parse and validate
 * @returns Validation result with parsed data and any errors
 */
export function validatePropertyCSV(csvString: string): CSVValidationResult {
  // Initialize the result
  const result: CSVValidationResult = {
    valid: true,
    data: [],
    errors: [],
  }

  // Split the CSV into lines
  const lines = csvString.trim().split('\n')

  // Ensure there's at least a header and one data row
  if (lines.length < 2) {
    result.valid = false
    result.errors.push({
      row: 0,
      errors: {
        file: ['CSV file must contain a header row and at least one data row'],
      },
    })
    return result
  }

  // Parse the header row
  const header = parseCSVLine(lines[0])

  // Validate required columns
  const requiredColumns = ['title', 'location', 'price', 'bedrooms', 'bathrooms']
  const missingColumns = requiredColumns.filter(col => !header.includes(col))

  if (missingColumns.length > 0) {
    result.valid = false
    result.errors.push({
      row: 0,
      errors: {
        header: [`Missing required columns: ${missingColumns.join(', ')}`],
      },
    })
    return result
  }

  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const rowData = parseCSVLine(line)

    // Create an object from the CSV row
    const propertyData: Record<string, any> = {}
    header.forEach((column, index) => {
      if (index < rowData.length) {
        // Convert numeric values
        if (['price', 'bedrooms', 'bathrooms', 'area', 'lat', 'lng'].includes(column)) {
          propertyData[column] = parseFloat(rowData[index])
        } else {
          propertyData[column] = rowData[index]
        }
      }
    })

    // Validate the property data
    const validationResult = createPropertySchema.safeParse(propertyData)

    if (validationResult.success) {
      result.data.push(validationResult.data)
    } else {
      result.valid = false
      result.errors.push({
        row: i,
        errors: validationResult.error.flatten().fieldErrors,
      })
    }
  }

  return result
}

/**
 * Parse a CSV line into an array of values
 * Handles quoted values with commas inside them
 * @param line The CSV line to parse
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      // Add character to current field
      current += char
    }
  }

  // Add the last field
  result.push(current.trim())

  return result
}
