# Type-Safe Database Operations

## Why Type Safety Matters in Database Operations

Using type-safe database operations provides several important benefits:

1. **Compile-time error detection**: Catch errors before runtime
2. **Autocomplete support**: IDE can suggest valid column names
3. **Refactoring support**: Rename columns in one place
4. **Prevention of SQL injection**: Parameterized queries by default
5. **Schema validation**: Ensures data matches expected types

## Best Practices for Drizzle ORM

### ✅ DO: Import schema objects directly

```typescript
import { users, posts } from '~/db/schema'
```

### ✅ DO: Use schema objects for queries

```typescript
// Type-safe query
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
})
```

### ✅ DO: Use type-safe conditions

```typescript
import { eq, and, or, like } from 'drizzle-orm'

// Type-safe filtering
const results = await db
  .select()
  .from(users)
  .where(and(eq(users.isActive, true), like(users.email, '%@example.com')))
```

### ✅ DO: Use type-safe updates

```typescript
// Type-safe update
await db.update(users).set({ name: 'Alice', role: 'admin' }).where(eq(users.id, userId))
```

### ❌ DON'T: Use string literals for table or column names

```typescript
// Avoid this - no type safety!
await db.execute(sql`UPDATE "users" SET name = ${newName} WHERE id = ${userId}`)
```

### ❌ DON'T: Use raw SQL strings

```typescript
// Avoid this - SQL injection risk and no type safety!
await db.execute(`UPDATE users SET role = 'admin' WHERE id = '${userId}'`)
```

## Examples

### Select Query

```typescript
import { users } from '~/db/schema'
import { eq } from 'drizzle-orm'

// Type-safe select
const user = await db.select().from(users).where(eq(users.id, userId))
```

### Insert Operation

```typescript
import { users } from '~/db/schema'

// Type-safe insert
await db.insert(users).values({
  id: crypto.randomUUID(),
  name: 'New User',
  email: 'user@example.com',
  createdAt: new Date(),
})
```

### Update Operation

```typescript
import { users } from '~/db/schema'
import { eq } from 'drizzle-orm'

// Type-safe update
await db.update(users).set({ name: 'Updated Name' }).where(eq(users.id, userId))
```

### Delete Operation

```typescript
import { users } from '~/db/schema'
import { eq } from 'drizzle-orm'

// Type-safe delete
await db.delete(users).where(eq(users.id, userId))
```

## Benefits of Using Drizzle's Type Safety

1. **Automatic TypeScript inference**: Drizzle infers types from your schema
2. **Relationship handling**: Type-safe joins and relations
3. **Migrations**: Generate migrations based on schema changes
4. **Performance**: Minimal runtime overhead
5. **Developer experience**: Better IDE integration and documentation
