/**
 * Type definitions for postgres module
 */

declare module 'postgres' {
  interface PostgresOptions {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
    max?: number;
    idle_timeout?: number;
    connect_timeout?: number;
    types?: any;
    onnotice?: (notice: any) => void;
    onparameter?: (parameterStatus: any) => void;
    debug?: (connection: any, query: any, parameters: any) => void;
    transform?: {
      column?: (column: any) => any;
      value?: (value: any) => any;
      row?: (row: any) => any;
    };
    connection?: {
      application_name?: string;
      [key: string]: any;
    };
  }

  interface PostgresConnection {
    end(): Promise<void>;
  }

  interface PostgresQuery {
    (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
    array(value: any[]): any;
    json(value: any): any;
    file(path: string): any;
    unsafe(query: string, params?: any[]): Promise<any[]>;
    begin(fn: (sql: PostgresQuery) => Promise<any>): Promise<any>;
    end(): Promise<void>;
  }

  interface PostgresFactory {
    (connectionString: string, options?: PostgresOptions): PostgresQuery & PostgresConnection;
  }

  const postgres: PostgresFactory;
  export default postgres;
}