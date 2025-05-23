// API entry point
<<<<<<< Updated upstream
// Using console.warn instead of console.log to comply with linting rules
console.warn('API server starting...')

// Add your API server implementation here
// Example:
// import express from 'express';
// const app = express();
// app.listen(3001, () => console.warn('API server running on port 3001'));
=======
import express from 'express';
import { env } from './env.mjs';

// Validate environment variables before starting the server
console.log(`API server starting in ${env.NODE_ENV} mode...`);

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// Add your API routes here
// Example: app.use('/api/properties', propertyRoutes);

// Start the server
const server = app.listen(env.PORT, () => {
  console.log(`✅ API server running on port ${env.PORT}`);
});
>>>>>>> Stashed changes
