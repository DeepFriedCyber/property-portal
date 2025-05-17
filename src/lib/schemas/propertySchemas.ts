import { z } from 'zod';

// Schema for creating a new property - UK specific
export const createPropertySchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }).optional(),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  propertyType: z.enum(['flat', 'apartment', 'house', 'bungalow', 'maisonette', 'cottage', 'land', 'commercial', 'other']),
  listingType: z.enum(['sale', 'rent']),
  
  // Address details
  address: z.object({
    line1: z.string().min(3, { message: 'Address line 1 is required' }),
    line2: z.string().optional(),
    town: z.string().min(2, { message: 'Town/City is required' }),
    county: z.string().optional(),
    postcode: z.string().min(5, { message: 'Valid UK postcode required' })
      .regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, { message: 'Invalid UK postcode format' }),
  }),
  
  // Property details
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  receptionRooms: z.number().int().min(0).optional(),
  squareFootage: z.number().int().positive().optional(),
  
  // UK-specific property details
  tenure: z.enum(['freehold', 'leasehold', 'share_of_freehold', 'commonhold']).optional(),
  councilTaxBand: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).optional(),
  epcRating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  
  // Features
  features: z.array(z.string()).optional(),
  
  // For rentals
  furnishingType: z.enum(['furnished', 'unfurnished', 'part_furnished']).optional(),
  availableFrom: z.string().optional(), // ISO date string
  minimumTenancy: z.number().optional(), // in months
  
  // Status
  status: z.enum(['available', 'under_offer', 'sold_stc', 'sold', 'let_agreed', 'let']).default('available'),
  
  // Images
  mainImageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

// Type inferred from the schema
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// Schema for updating a property (all fields optional)
export const updatePropertySchema = createPropertySchema.partial();

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;