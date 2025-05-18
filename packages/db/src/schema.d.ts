export declare const users: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'users'
  schema: undefined
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id'
        tableName: 'users'
        dataType: 'number'
        columnType: 'PgSerial'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    fullName: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'full_name'
        tableName: 'users'
        dataType: 'string'
        columnType: 'PgText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    email: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'email'
        tableName: 'users'
        dataType: 'string'
        columnType: 'PgVarchar'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: 256
      }
    >
  }
  dialect: 'pg'
}>
export declare const posts: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'posts'
  schema: undefined
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id'
        tableName: 'posts'
        dataType: 'number'
        columnType: 'PgSerial'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    title: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'title'
        tableName: 'posts'
        dataType: 'string'
        columnType: 'PgVarchar'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: 256
      }
    >
    content: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'content'
        tableName: 'posts'
        dataType: 'string'
        columnType: 'PgText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    authorId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'author_id'
        tableName: 'posts'
        dataType: 'number'
        columnType: 'PgInteger'
        data: number
        driverParam: string | number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at'
        tableName: 'posts'
        dataType: 'date'
        columnType: 'PgTimestamp'
        data: Date
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at'
        tableName: 'posts'
        dataType: 'date'
        columnType: 'PgTimestamp'
        data: Date
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'pg'
}>
export declare const apiTokens: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'api_tokens'
  schema: undefined
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id'
        tableName: 'api_tokens'
        dataType: 'number'
        columnType: 'PgSerial'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    token: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'token'
        tableName: 'api_tokens'
        dataType: 'string'
        columnType: 'PgVarchar'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: 256
      }
    >
    userId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'user_id'
        tableName: 'api_tokens'
        dataType: 'number'
        columnType: 'PgInteger'
        data: number
        driverParam: string | number
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    expiresAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'expires_at'
        tableName: 'api_tokens'
        dataType: 'date'
        columnType: 'PgTimestamp'
        data: Date
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at'
        tableName: 'api_tokens'
        dataType: 'date'
        columnType: 'PgTimestamp'
        data: Date
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'pg'
}>
//# sourceMappingURL=schema.d.ts.map
