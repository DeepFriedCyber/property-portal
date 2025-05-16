// Re-export the functions from the root lib/db/queries.ts
export {
  getUploadRecordsByUploader,
  countPropertiesByUploadId,
  getPropertiesByUploadId,
  getPropertyById,
  createUploadRecord,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../../../../lib/db/queries';

// Export the types with 'export type' syntax for isolatedModules compatibility
export type {
  UploadRecord,
  NewUploadRecord,
  Property,
  NewProperty,
} from '../../../../lib/db/queries';
