# TypeScript Type System

This document explains the TypeScript type system used in the Property Portal application.

## Core Types

### Property

The `Property` interface is the central type for our application. It defines the structure of a property listing:

```typescript
// src/types/property.ts
export interface Property {
  id: string
  title: string
  description: string
  price: number
  type: string
  status: string
  bedrooms: number
  bathrooms: number
  squareFeet: number
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  features: string[]
  createdAt: string
  updatedAt?: string
  metadata: {
    mainImageUrl?: string
    listingType?: 'rent' | 'sale'
    receptionRooms?: number
    epcRating?: string
    tenure?: string
    councilTaxBand?: string
    addressLine2?: string
    title?: string
  }
}
```

## API Response Types

Our server actions return consistent response types:

```typescript
// Generic success response with data
interface SuccessResponse<T> {
  success: true
  data: T
}

// Generic error response
interface ErrorResponse {
  success: false
  error: {
    message: string
    details?: string | Record<string, string[]>
  }
}

// Combined response type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
```

## Component Props Types

Component props are typed to ensure proper data flow:

```typescript
// Property detail component props
interface PropertyDetailContentProps {
  property: Property
}

// Property list component props
interface PropertyListProps {
  properties: Property[]
  totalCount: number
  page: number
  totalPages: number
  searchParams: { [key: string]: string | string[] | undefined }
}
```

## Benefits of Strong Typing

### 1. Compile-Time Error Checking

TypeScript catches errors at compile time rather than runtime, reducing bugs in production.

### 2. Better Developer Experience

- Autocomplete and IntelliSense in your IDE
- Documentation at your fingertips
- Refactoring support

### 3. Self-Documenting Code

Types serve as documentation, making it easier for new developers to understand the codebase.

### 4. Safer Refactoring

When you change a type, TypeScript will show you all the places that need to be updated.

## Type Safety Between Server and Client

Our application maintains type safety between server and client components:

1. **Server Actions**: Return strongly typed responses
2. **Server Components**: Pass typed data to client components
3. **Client Components**: Receive and use typed data

This ensures that data flows correctly through the application and that errors are caught early.

## Best Practices

1. **Avoid `any`**: Use specific types instead of `any` to maintain type safety.

2. **Use Interfaces for Objects**: Interfaces are more extensible and better for object shapes.

3. **Use Type for Unions/Intersections**: Use `type` for complex type compositions.

4. **Centralize Types**: Keep related types in dedicated files for reusability.

5. **Type Server Responses**: Always type the responses from server actions.

6. **Use Generics for Reusable Types**: Create generic types for common patterns.

7. **Document Complex Types**: Add JSDoc comments to explain complex types.

## Example: Type-Safe Data Flow

```typescript
// 1. Define the type
interface Property { /* ... */ }

// 2. Server action returns typed data
async function getProperty(id: string): Promise<ApiResponse<Property>> { /* ... */ }

// 3. Server component uses typed data
async function PropertyDetailData({ id }: { id: string }) {
  const result = await getProperty(id);
  if (!result.success) notFound();
  return <PropertyDetailContent property={result.data} />;
}

// 4. Client component receives typed data
function PropertyDetailContent({ property }: { property: Property }) {
  // Type-safe access to property fields
  const { title, price, bedrooms } = property;
  // ...
}
```

This ensures type safety throughout the application, from data fetching to rendering.