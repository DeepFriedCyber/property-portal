import { pgTable, text, uuid, integer, timestamp, jsonb, index, varchar } from 'drizzle-orm/pg-core';

// Helper function to add timestamp fields to all tables
const addTimestampFields = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
};

export const uploadRecord = pgTable('upload_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploaderId: text('uploader_id'),
  filename: text('filename'),
  status: text('status').default('pending'),
  ...addTimestampFields,
});

export const uploads = pgTable('uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  filename: text('filename'),
  originalName: text('original_name'),
  mimeType: text('mime_type'),
  size: integer('size'),
  status: text('status').default('pending'),
  processingErrors: jsonb('processing_errors').$type<string[]>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ...addTimestampFields,
});

export const property = pgTable(
  'properties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    uploadId: uuid('upload_id'),
    // Use varchar with length limit for better indexing performance
    address: varchar('address', { length: 255 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    zipCode: varchar('zip_code', { length: 20 }),
    country: varchar('country', { length: 100 }).default('United Kingdom'),
    price: integer('price'),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    squareFeet: integer('square_feet'),
    description: text('description'),
    features: jsonb('features').$type<string[]>(),
    status: varchar('status', { length: 50 }).default('available'),
    type: varchar('type', { length: 50 }),
    dateSold: timestamp('date_sold'),
    embedding: jsonb('embedding').$type<number[]>(),
    metadata: jsonb('metadata').$type<Record<string, any>>(),
    ...addTimestampFields,
    createdBy: varchar('created_by', { length: 100 }),
    updatedBy: varchar('updated_by', { length: 100 }),
  },
  (table) => {
    return {
      // Add indexes for location-based searches
      addressIdx: index('address_idx').on(table.address),
      cityIdx: index('city_idx').on(table.city),
      zipCodeIdx: index('zip_code_idx').on(table.zipCode),
      
      // Add indexes for common filters
      priceIdx: index('price_idx').on(table.price),
      bedroomsIdx: index('bedrooms_idx').on(table.bedrooms),
      statusIdx: index('status_idx').on(table.status),
      typeIdx: index('type_idx').on(table.type),
      
      // Composite index for location-based searches (city + state)
      locationIdx: index('location_idx').on(table.city, table.state),
      
      // Composite index for property type and bedrooms (common filter combination)
      propertyTypeBedroomsIdx: index('property_type_bedrooms_idx').on(table.type, table.bedrooms),
    };
  }
);
