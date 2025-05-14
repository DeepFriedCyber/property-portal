// app/api/properties/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  getPropertiesByUploadId, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} from '../../../lib/db/queries';
import { 
  withDatabaseHandler, 
  successResponse,
  HttpStatus 
} from '../../../lib/db/nextjs-utils';
import { ApiErrors } from '../../../lib/helpers/apiErrorHelpers';
import { ErrorCode } from '../../../lib/constants/errorCodes';
import { isValidId } from '../../../lib/helpers/validationHelpers';
import { withAuth, PermissionLevel, UserRole } from '../../../lib/auth/authMiddleware';
import { 
  Property, 
  CreatePropertyInput, 
  UpdatePropertyInput 
} from '../../../lib/types/property';

/**
 * Schema for property creation
 * This schema validates the input for creating a new property
 * and ensures it matches our CreatePropertyInput type
 */
const createPropertySchema = z.object({
  uploadId: z.string().uuid({ message: "Upload ID must be a valid UUID" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  price: z.number().positive({ message: "Price must be a positive number" }).optional(),
  bedrooms: z.number().int({ message: "Bedrooms must be a whole number" }).nonnegative().optional(),
  bathrooms: z.number().nonnegative({ message: "Bathrooms cannot be negative" }).optional(),
  squareFeet: z.number().positive({ message: "Square feet must be a positive number" }).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  status: z.enum(['available', 'pending', 'sold'], { 
    errorMap: () => ({ message: "Status must be one of: available, pending, sold" })
  }).optional(),
  type: z.string().optional(),
  embedding: z.array(z.number()).optional(),
  metadata: z.record(z.any()).optional()
}).strict();

/**
 * Schema for property update
 * This schema validates the input for updating an existing property
 * and ensures it matches our UpdatePropertyInput type
 */
const updatePropertySchema = createPropertySchema
  .omit({ uploadId: true })
  .partial()
  .extend({
    updatedBy: z.string().uuid().optional(),
    updatedAt: z.string().optional()
  });

// GET handler for retrieving properties
export const GET = withDatabaseHandler(
  withAuth(async (req: NextRequest, user) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const uploadId = searchParams.get('uploadId');
    
    // Check if both parameters are provided
    if (id && uploadId) {
      return ApiErrors.invalidParameter(
        'query parameters', 
        'id OR uploadId'
      );
    }
    
    // Get a single property by ID
    if (id) {
      // Validate ID format
      if (!isValidId(id, 'uuid')) {
        return ApiErrors.invalidIdFormat(id, 'UUID');
      }
      
      const property = await getPropertyById(id);
      
      if (!property) {
        return ApiErrors.propertyNotFound(id);
      }
      
      return successResponse(property);
    }
    
    // Get properties by upload ID
    if (uploadId) {
      // Validate upload ID format
      if (!isValidId(uploadId, 'uuid')) {
        return ApiErrors.invalidIdFormat(uploadId, 'UUID');
      }
      
      const properties = await getPropertiesByUploadId(uploadId);
      return successResponse(properties);
    }
    
    // No ID or upload ID provided
    return ApiErrors.missingParameter('id or uploadId');
  }, { requiredPermission: PermissionLevel.READ })
);

// POST handler for creating a property
export const POST = withDatabaseHandler(
  withAuth(async (req: NextRequest, user) => {
    try {
      const body = await req.json();
      
      // Validate request body
      const validatedData = createPropertySchema.parse(body);
      
      // Add audit information
      const propertyData = {
        ...validatedData,
        createdBy: user.userId
      };
      
      // Create the property
      const property = await createProperty(propertyData);
      
      return successResponse(property);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return ApiErrors.validationError(error.errors);
      }
      
      // Re-throw other errors to be handled by withDatabaseHandler
      throw error;
    }
  }, { requiredPermission: PermissionLevel.WRITE })
);

// PATCH handler for updating a property
export const PATCH = withDatabaseHandler(
  withAuth(async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return ApiErrors.missingParameter('id');
      }
      
      // Validate ID format
      if (!isValidId(id, 'uuid')) {
        return ApiErrors.invalidIdFormat(id, 'UUID');
      }
      
      const body = await req.json();
      
      // Validate request body
      const validatedData = updatePropertySchema.parse(body);
      
      // Add audit information
      const propertyData = {
        ...validatedData,
        updatedBy: user.userId,
        updatedAt: new Date().toISOString()
      };
      
      // Update the property
      const property = await updateProperty(id, propertyData);
      
      if (!property) {
        return ApiErrors.propertyNotFound(id);
      }
      
      return successResponse(property);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return ApiErrors.validationError(error.errors);
      }
      
      // Re-throw other errors to be handled by withDatabaseHandler
      throw error;
    }
  }, { requiredPermission: PermissionLevel.WRITE })
);

// DELETE handler for deleting a property
export const DELETE = withDatabaseHandler(
  withAuth(async (req: NextRequest, user) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return ApiErrors.missingParameter('id');
    }
    
    // Validate ID format
    if (!isValidId(id, 'uuid')) {
      return ApiErrors.invalidIdFormat(id, 'UUID');
    }
    
    // Check if the property exists
    const property = await getPropertyById(id);
    
    if (!property) {
      return ApiErrors.propertyNotFound(id);
    }
    
    // Log the deletion action with user information
    console.log(`Property ${id} deleted by user ${user.userId} with role ${user.role}`);
    
    // Delete the property
    await deleteProperty(id);
    
    // Return a standardized response with the deleted property data
    return successResponse({
      id: property.id,
      address: property.address,
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      deletedBy: user.userId
    });
  }, { requiredPermission: PermissionLevel.DELETE })
);