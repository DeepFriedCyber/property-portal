// examples/error-handling-example.ts
import express from 'express';
import { 
  AppError, 
  BadRequest, 
  NotFound, 
  errorHandler, 
  requestIdMiddleware 
} from '../lib/middleware/errorHandler';
import { winstonLogger as logger } from '../lib/logging/winston-logger';

// Create Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(requestIdMiddleware);

// Example route with try/catch and async error handling
app.get('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate input
    if (!id || typeof id !== 'string') {
      throw BadRequest('Invalid property ID', { providedId: id });
    }
    
    // Simulate database lookup
    const property = await findProperty(id);
    
    // Handle not found case
    if (!property) {
      throw NotFound(`Property with ID ${id} not found`);
    }
    
    // Log successful retrieval
    logger.info(`Property retrieved successfully`, {
      context: {
        propertyId: id,
        requestId: req.id
      }
    });
    
    // Return successful response
    res.json({ 
      success: true, 
      data: property 
    });
  } catch (error) {
    // Pass error to the error handler middleware
    next(error);
  }
});

// Example route with a custom error
app.post('/api/properties', (req, res, next) => {
  const { title, price } = req.body;
  
  // Validate required fields
  if (!title) {
    return next(BadRequest('Title is required'));
  }
  
  if (price === undefined || isNaN(price) || price <= 0) {
    return next(BadRequest('Valid price is required', { 
      providedPrice: price,
      message: 'Price must be a positive number'
    }));
  }
  
  // Process the request (simplified example)
  try {
    // Simulate an internal error
    if (Math.random() > 0.8) {
      throw new Error('Random internal server error');
    }
    
    // Success case
    res.status(201).json({
      success: true,
      data: {
        id: 'new-property-id',
        title,
        price
      }
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Mock function to simulate database lookup
async function findProperty(id: string): Promise<any | null> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate not found for specific IDs
  if (id === 'not-found' || id === '404') {
    return null;
  }
  
  // Return mock property data
  return {
    id,
    title: 'Sample Property',
    price: 250000,
    bedrooms: 3,
    bathrooms: 2,
    location: 'London, UK'
  };
}