import { z } from 'zod'

// Schema for creating a new property
export const createPropertySchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }).max(100),
  location: z.string().min(5, { message: 'Location must be at least 5 characters long' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  imageUrl: z.string().url({ message: 'Image URL must be a valid URL' }),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Type inferred from the schema
export type CreatePropertyInput = z.infer<typeof createPropertySchema>

// Schema for updating a property (all fields optional)
export const updatePropertySchema = createPropertySchema.partial()

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
