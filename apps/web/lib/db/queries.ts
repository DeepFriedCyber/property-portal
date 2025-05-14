// Re-export the functions from the root lib/db/queries.ts
export { 
  getUploadRecordsByUploader,
  countPropertiesByUploadId,
  getPropertiesByUploadId,
  createUploadRecord,
  createProperty,
  // Export the types as well
  UploadRecord,
  NewUploadRecord,
  Property,
  NewProperty
} from '../../../../lib/db/queries';