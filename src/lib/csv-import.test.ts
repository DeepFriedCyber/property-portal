import { describe, it, expect } from 'vitest'

import { validatePropertyCSV } from './csv-import'

describe('CSV Import Validation', () => {
  it('should validate a valid CSV file', () => {
    const validCSV = `title,location,price,bedrooms,bathrooms,area,lat,lng
"Luxury Apartment","London, UK",500000,2,2,1200,51.5074,-0.1278
"Cozy Cottage","Bath, UK",350000,3,1,950,51.3751,-2.3617
"Modern Flat","Manchester, UK",275000,1,1,750,53.4808,-2.2426`

    const result = validatePropertyCSV(validCSV)

    expect(result.valid).toBe(true)
    expect(result.data.length).toBe(3)
    expect(result.errors.length).toBe(0)

    // Check the first property
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        title: 'Luxury Apartment',
        location: 'London, UK',
        price: 500000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        lat: 51.5074,
        lng: -0.1278,
      })
    )
  })

  it('should handle CSV with quoted values containing commas', () => {
    const csvWithCommas = `title,location,price,bedrooms,bathrooms
"Luxury Apartment, Central","London, Westminster, UK",500000,2,2`

    const result = validatePropertyCSV(csvWithCommas)

    expect(result.valid).toBe(true)
    expect(result.data.length).toBe(1)
    expect(result.data[0].title).toBe('Luxury Apartment, Central')
    expect(result.data[0].location).toBe('London, Westminster, UK')
  })

  it('should reject CSV with missing required columns', () => {
    const invalidCSV = `title,location,bedrooms
"Luxury Apartment","London, UK",2`

    const result = validatePropertyCSV(invalidCSV)

    expect(result.valid).toBe(false)
    expect(result.data.length).toBe(0)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].errors.header).toContain(
      expect.stringContaining('Missing required columns')
    )
  })

  it('should validate each row and report errors', () => {
    const mixedCSV = `title,location,price,bedrooms,bathrooms
"Luxury Apartment","London, UK",500000,2,2
"Invalid Property","",0,0,0
"Cozy Cottage","Bath, UK",350000,3,1`

    const result = validatePropertyCSV(mixedCSV)

    expect(result.valid).toBe(false)
    expect(result.data.length).toBe(2) // Two valid rows
    expect(result.errors.length).toBe(1) // One invalid row
    expect(result.errors[0].row).toBe(2) // Error on row 2 (0-indexed)
  })

  it('should reject empty CSV files', () => {
    const emptyCSV = ''

    const result = validatePropertyCSV(emptyCSV)

    expect(result.valid).toBe(false)
    expect(result.data.length).toBe(0)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].errors.file).toContain(expect.stringContaining('CSV file must contain'))
  })

  it('should reject CSV files with only a header', () => {
    const headerOnlyCSV = 'title,location,price,bedrooms,bathrooms'

    const result = validatePropertyCSV(headerOnlyCSV)

    expect(result.valid).toBe(false)
    expect(result.data.length).toBe(0)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].errors.file).toContain(expect.stringContaining('CSV file must contain'))
  })

  it('should validate numeric fields', () => {
    const csvWithInvalidNumbers = `title,location,price,bedrooms,bathrooms
"Luxury Apartment","London, UK",abc,2,2`

    const result = validatePropertyCSV(csvWithInvalidNumbers)

    expect(result.valid).toBe(false)
    expect(result.data.length).toBe(0)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].errors.price).toBeDefined()
  })

  it('should skip empty lines', () => {
    const csvWithEmptyLines = `title,location,price,bedrooms,bathrooms
"Luxury Apartment","London, UK",500000,2,2

"Cozy Cottage","Bath, UK",350000,3,1
`

    const result = validatePropertyCSV(csvWithEmptyLines)

    expect(result.valid).toBe(true)
    expect(result.data.length).toBe(2)
  })
})
