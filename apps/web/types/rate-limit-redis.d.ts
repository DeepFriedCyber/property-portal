// This is a placeholder type declaration file for rate-limit-redis
// It allows TypeScript to recognize the package without importing its types directly

declare module 'rate-limit-redis' {
  import Redis from 'ioredis'

  interface RedisStoreOptions {
    // Redis client instance
    client?: Redis
    // Prefix for Redis keys
    prefix?: string
    // Redis connection options if client is not provided
    redisOptions?: any
    // Expiry time in seconds
    expiry?: number
    // Send command method
    sendCommand?: (...args: any[]) => Promise<any>
  }

  export default function RedisStore(options?: RedisStoreOptions): any
}
