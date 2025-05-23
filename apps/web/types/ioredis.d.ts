// This is a placeholder type declaration file for ioredis
// It allows TypeScript to recognize the package without importing its types directly

declare module 'ioredis' {
  interface RedisOptions {
    port?: number
    host?: string
    username?: string
    password?: string
    db?: number
    url?: string
    [key: string]: any
  }

  interface Pipeline {
    exec(): Promise<any[]>
    [command: string]: (...args: any[]) => Pipeline
  }

  class Redis {
    constructor(options?: RedisOptions | string)
    constructor(port?: number, host?: string, options?: RedisOptions)

    connect(): Promise<void>
    disconnect(): void
    quit(): Promise<'OK'>

    get(key: string): Promise<string | null>
    set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'>
    set(
      key: string,
      value: string,
      expiryMode?: string,
      time?: number | string,
      setMode?: string
    ): Promise<'OK'>
    del(key: string | string[]): Promise<number>

    incr(key: string): Promise<number>
    decr(key: string): Promise<number>

    hget(key: string, field: string): Promise<string | null>
    hset(key: string, field: string, value: string | number): Promise<number>
    hgetall(key: string): Promise<Record<string, string>>

    expire(key: string, seconds: number): Promise<number>
    ttl(key: string): Promise<number>

    pipeline(): Pipeline
    multi(): Pipeline

    on(event: string, listener: (...args: any[]) => void): this

    // Add other methods as needed
    [command: string]: any
  }

  export default Redis
}
