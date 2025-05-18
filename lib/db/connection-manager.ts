// db/connection-manager.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '../../drizzle/schema'

import { DatabaseConnectionError } from './error-handler'

// Connection pool status
type ConnectionStatus = 'INITIALIZING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

// Connection manager singleton
class ConnectionManager {
  private static instance: ConnectionManager
  private client: postgres.Sql<{}> | null = null
  private status: ConnectionStatus = 'INITIALIZING'
  private connectionError: Error | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000 // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  /**
   * Initialize the database connection
   * @param connectionString Database connection string
   * @param options Connection options
   */
  public async initialize(
    connectionString: string = process.env.DATABASE_URL || '',
    options: {
      ssl?: boolean
      max?: number
      idle_timeout?: number
      connect_timeout?: number
      max_lifetime?: number
      healthCheckIntervalMs?: number
    } = {}
  ): Promise<void> {
    if (!connectionString) {
      throw new DatabaseConnectionError('DATABASE_URL is not defined')
    }

    try {
      this.status = 'INITIALIZING'

      // Create postgres connection with connection pooling
      this.client = postgres(connectionString, {
        ssl: options.ssl ?? process.env.NODE_ENV === 'production',
        max: options.max ?? 10,
        idle_timeout: options.idle_timeout ?? 30,
        connect_timeout: options.connect_timeout ?? 10,
        max_lifetime: options.max_lifetime ?? 60 * 60,
        debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
        onnotice: notice => console.log('Database notice:', notice),
        onclose: () => {
          console.log('Database connection closed')
          this.status = 'DISCONNECTED'
          this.scheduleReconnect()
        },
      })

      // Test the connection
      await this.client`SELECT 1`

      this.status = 'CONNECTED'
      this.connectionError = null
      this.reconnectAttempts = 0
      console.log('Database connection established successfully')

      // Start health check interval
      this.startHealthCheck(options.healthCheckIntervalMs ?? 30000)
    } catch (error) {
      this.status = 'ERROR'
      this.connectionError = error instanceof Error ? error : new Error(String(error))

      // Use detailed error message for better debugging
      console.error('Failed to initialize database connection:', error)

      // Schedule reconnect
      this.scheduleReconnect()

      // The DatabaseConnectionError constructor will use createDetailedDbConnectionErrorMessage
      // to generate a detailed error message that includes connection details
      throw new DatabaseConnectionError('Failed to initialize database connection', error)
    }
  }

  /**
   * Get the database client
   * @returns Drizzle ORM instance
   */
  public getDb() {
    if (!this.client || this.status !== 'CONNECTED') {
      throw new DatabaseConnectionError(
        'Database connection is not available',
        this.connectionError || undefined
      )
    }

    return drizzle(this.client, { schema })
  }

  /**
   * Get the raw postgres client
   * @returns Postgres client
   */
  public getRawClient() {
    if (!this.client || this.status !== 'CONNECTED') {
      throw new DatabaseConnectionError(
        'Database connection is not available',
        this.connectionError || undefined
      )
    }

    return this.client
  }

  /**
   * Get the current connection status
   * @returns Connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Get the last connection error
   * @returns Connection error or null
   */
  public getError(): Error | null {
    return this.connectionError
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    this.stopHealthCheck()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.client) {
      try {
        await this.client.end()
        console.log('Database connection closed')
      } catch (error) {
        console.error('Error closing database connection:', error)
      } finally {
        this.client = null
        this.status = 'DISCONNECTED'
      }
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`)
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`Scheduling database reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`)

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++

      try {
        console.log(
          `Attempting to reconnect to database (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        )
        await this.initialize()
        console.log('Database reconnection successful')
      } catch (error) {
        console.error('Database reconnection failed:', error)
        this.scheduleReconnect()
      }
    }, delay)
  }

  /**
   * Start periodic health checks
   * @param intervalMs Interval in milliseconds
   */
  private startHealthCheck(intervalMs: number): void {
    this.stopHealthCheck()

    this.healthCheckInterval = setInterval(async () => {
      if (this.status !== 'CONNECTED' || !this.client) {
        return
      }

      try {
        // Simple query to check connection
        await this.client`SELECT 1`
      } catch (error) {
        console.error('Database health check failed:', error)
        this.status = 'ERROR'
        this.connectionError = error instanceof Error ? error : new Error(String(error))

        // Try to close the connection and reconnect
        await this.close()
        this.scheduleReconnect()
      }
    }, intervalMs)
  }

  /**
   * Stop health checks
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

// Export the singleton instance
export const connectionManager = ConnectionManager.getInstance()

/**
 * Initialize the database connection
 * @param connectionString Database connection string
 * @param options Connection options
 */
export async function initializeDatabase(
  connectionString?: string,
  options?: {
    ssl?: boolean
    max?: number
    idle_timeout?: number
    connect_timeout?: number
    max_lifetime?: number
    healthCheckIntervalMs?: number
  }
): Promise<void> {
  await connectionManager.initialize(connectionString, options)
}

/**
 * Get the database client
 * @returns Drizzle ORM instance
 */
export function getDb() {
  return connectionManager.getDb()
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  await connectionManager.close()
}

/**
 * Get the database connection status
 * @returns Connection status
 */
export function getDatabaseStatus(): {
  status: 'INITIALIZING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  error: Error | null
} {
  return {
    status: connectionManager.getStatus(),
    error: connectionManager.getError(),
  }
}
