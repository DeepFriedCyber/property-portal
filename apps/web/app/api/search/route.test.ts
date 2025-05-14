import { NextRequest } from 'next/server';
import { GET } from './route';
import { generateEmbedding } from '../../../../../../lib/embedding';
import { db } from '@your-org/db';
import { bindVector, bindJsonbArray } from '../../../../../../lib/db/utils';
import { successResponse, errorResponse, HttpStatus } from '../../../../../../lib/api/response';
import { validateQuery, withValidation } from '../../../../../../lib/api/validation';

// Mock the dependencies
jest.mock('../../../../../../lib/embedding', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

jest.mock('../../../../../../lib/db/utils', () => ({
  bindVector: jest.fn().mockImplementation(array => array),
  bindJsonbArray: jest.fn().mockImplementation(array => array),
}));

// Mock the API response utilities
jest.mock('../../../../../../lib/api/response', () => {
  const originalModule = jest.requireActual('../../../../../../lib/api/response');
  return {
    ...originalModule,
    successResponse: jest.fn().mockImplementation((data) => {
      return Response.json({ success: true, data });
    }),
    errorResponse: jest.fn().mockImplementation((message, status = 500) => {
      return Response.json({ success: false, error: { message } }, { status });
    }),
    HttpStatus: {
      OK: 200,
      BAD_REQUEST: 400,
      UNPROCESSABLE_ENTITY: 422,
      INTERNAL_SERVER_ERROR: 500,
    },
  };
});

// Mock the validation utilities
jest.mock('../../../../../../lib/api/validation', () => {
  return {
    validateQuery: jest.fn().mockImplementation(async (req, schema) => {
      const url = new URL(req.url);
      const q = url.searchParams.get('q');
      const limit = url.searchParams.get('limit');
      
      if (!q) {
        throw new Error('Validation error');
      }
      
      return {
        q,
        limit: limit ? parseInt(limit, 10) : 10,
      };
    }),
    withValidation: jest.fn().mockImplementation((handler) => {
      return async (req) => {
        try {
          return await handler(req);
        } catch (error) {
          return Response.json(
            { success: false, error: { message: error.message } },
            { status: 422 }
          );
        }
      };
    }),
  };
});

jest.mock('@your-org/db', () => ({
  db: {
    execute: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Test Property',
        price: 350000,
        location: 'Test Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 1500,
      },
    ]),
  },
  schema: {
    property: {
      id: 'id',
      title: 'title',
      price: 'price',
      location: 'location',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      area: 'area',
    },
  },
}));

describe('Search API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 422 when query parameter is missing', async () => {
    // Create a mock request without a query parameter
    const request = new NextRequest(new URL('http://localhost:3000/api/search'));
    
    // Call the API route
    const response = await GET(request);
    
    // Check the response
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Validation error');
  });

  it('returns search results successfully', async () => {
    // Create a mock request with a query parameter
    const request = new NextRequest(new URL('http://localhost:3000/api/search?q=test&limit=10'));
    
    // Mock the database response for the optimized function
    const mockExecute = db.execute as jest.Mock;
    mockExecute.mockResolvedValueOnce([]);
    
    // Call the API route
    const response = await GET(request);
    
    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.query).toBe('test');
    expect(data.data.results).toHaveLength(1);
    expect(data.data.results[0].title).toBe('Test Property');
    
    // Check that generateEmbedding was called with the correct parameters
    expect(generateEmbedding).toHaveBeenCalledWith('test', {
      provider: 'lmstudio',
      model: 'bge-base-en',
    });
  });

  it('falls back to JSONB search when optimized function fails', async () => {
    // Create a mock request with a query parameter
    const request = new NextRequest(new URL('http://localhost:3000/api/search?q=test&limit=10'));
    
    // Mock the database response for the optimized function to throw an error
    const mockExecute = db.execute as jest.Mock;
    mockExecute.mockRejectedValueOnce(new Error('Function not available'));
    
    // Call the API route
    const response = await GET(request);
    
    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.query).toBe('test');
    expect(data.data.results).toHaveLength(1);
    
    // Check that the fallback search was used
    expect(db.select).toHaveBeenCalled();
    expect(db.from).toHaveBeenCalled();
    expect(db.where).toHaveBeenCalled();
    expect(db.orderBy).toHaveBeenCalled();
    expect(db.limit).toHaveBeenCalledWith(10);
  });
});