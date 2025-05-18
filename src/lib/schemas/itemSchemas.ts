import { z } from 'zod'

// Schema for creating a new item
export const createItemSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(100),
  description: z.string().optional(), // Optional description
  price: z.number().positive({ message: 'Price must be a positive number' }),
  tags: z.array(z.string().min(1)).optional(), // Optional array of non-empty strings
})

// Type inferred from the schema, useful for type safety in your code
export type CreateItemInput = z.infer<typeof createItemSchema>

// Example schema for updating an item (all fields optional)
export const updateItemSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional().nullable(), // Can be explicitly set to null to clear
  price: z.number().positive().optional(),
  tags: z.array(z.string().min(1)).optional(),
})

export type UpdateItemInput = z.infer<typeof updateItemSchema>
