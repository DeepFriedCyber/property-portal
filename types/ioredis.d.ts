// Type definitions for ioredis
// Project: https://github.com/luin/ioredis
// Definitions by: Property Portal Team

declare module 'ioredis' {
  interface RedisOptions {
    port?: number
    host?: string
    username?: string
    password?: string
    db?: number
    url?: string
    keyPrefix?: string
    retryStrategy?: (times: number) => number | void
    reconnectOnError?: (error: Error) => boolean | 1 | 2
    readOnly?: boolean
    enableOfflineQueue?: boolean
    enableReadyCheck?: boolean
    autoResubscribe?: boolean
    autoResendUnfulfilledCommands?: boolean
    lazyConnect?: boolean
    tls?: any
    sentinels?: Array<{ host: string; port: number }>
    name?: string
    role?: 'master' | 'slave'
    sentinelRetryStrategy?: (times: number) => number | void
    [key: string]: any
  }

  interface Pipeline {
    exec(): Promise<Array<[Error | null, any]>>
    [command: string]: (...args: any[]) => Pipeline
  }

  interface Cluster {
    connect(): Promise<void>
    disconnect(): void
    quit(): Promise<'OK'>
    nodes(role?: string): Redis[]
    [command: string]: any
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

    expire(key: string): Promise<number>
    ttl(key: string): Promise<number>

    pipeline(): Pipeline
    multi(): Pipeline

    on(event: string, listener: (...args: any[]) => void): this

    // Add other methods as needed
    [command: string]: any
  }

  export { Redis, Cluster, RedisOptions }
  export default Redis
}
