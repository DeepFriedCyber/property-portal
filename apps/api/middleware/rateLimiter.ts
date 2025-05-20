import { rateLimit } from 'express-rate-limit';

// Note: Using memory store instead of Redis for simplicity
// To use Redis, install the required packages:
// npm install ioredis rate-limit-redis @types/ioredis
// Then uncomment the Redis implementation below

/*
import { Redis } from 'ioredis';
import { RedisStore } from 'rate-limit-redis';

const redis = new Redis(process.env.REDIS_URL!);
*/

export const apiLimiter = rateLimit({
  // For Redis store, use:
  // store: new RedisStore({ redis }),

  // Using default memory store
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
    });
  },
});
