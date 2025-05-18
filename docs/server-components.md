# Server Components Architecture

This document explains the server component architecture used in the Property Portal application.

## Overview

Next.js 13+ introduces React Server Components, which allow components to be rendered on the server. This provides several benefits:

- **Reduced Client-Side JavaScript**: Server components don't send component JavaScript to the client
- **Direct Backend Access**: Server components can directly access backend resources
- **Improved Performance**: Initial page load is faster with server-rendered content
- **Better SEO**: Content is available in the initial HTML, improving search engine indexing

## Architecture Pattern

We follow a specific pattern for organizing our server and client components:

### 1. Page Component (Server)

The page component is the entry point for a route. It's a server component that:

- Handles the overall layout
- Sets up error boundaries and suspense boundaries
- Delegates data fetching to specialized server components

Example: `src/app/(properties)/[id]/page.tsx`

```tsx
export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorBoundary>
        <Suspense fallback={<PropertyDetailSkeleton />}>
          <PropertyDetailData id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

### 2. Data Fetching Component (Server)

A specialized server component that:

- Handles data fetching
- Handles error cases (e.g., notFound())
- Passes data to client components

Example: `src/app/(properties)/[id]/PropertyDetailData.tsx`

```tsx
export default async function PropertyDetailData({ id }: { id: string }) {
  const result = await getProperty(id)
  if (!result.success) notFound()
  return <PropertyDetailContent property={result.data} />
}
```

### 3. Content Component (Client)

A client component that:

- Receives data from server components
- Handles user interactions
- Manages client-side state
- Renders the UI

Example: `src/app/(properties)/[id]/PropertyDetailContent.tsx`

```tsx
'use client';

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  // Client-side rendering and interactivity
  return (
    // UI rendering
  );
}
```

## Benefits of This Architecture

### 1. Clear Separation of Concerns

- **Server Components**: Handle data fetching and initial rendering
- **Client Components**: Handle interactivity and client-side state

### 2. Improved Performance

- Data fetching happens on the server, close to the data source
- Less JavaScript is sent to the client
- Components can be streamed to the client as they become ready

### 3. Better Developer Experience

- Server components can directly access backend resources without APIs
- Client components can focus on UI and interactivity
- Clear boundaries make the codebase easier to understand

### 4. Optimized for SEO

- Content is available in the initial HTML
- Search engines can index the content more effectively

## Route Groups

We use route groups (folders with parentheses) to organize our routes without affecting the URL structure:

- `(properties)`: Contains property-related routes

This allows us to organize our code by feature while maintaining a clean URL structure.

## Best Practices

1. **Keep Data Fetching in Server Components**: Use server components for data fetching to reduce client-side JavaScript.

2. **Use Client Components for Interactivity**: Mark components that need interactivity with `'use client'`.

3. **Proper Error Handling**: Use error boundaries and the `notFound()` function to handle errors gracefully.

4. **Streaming with Suspense**: Use Suspense boundaries to stream content as it becomes available.

5. **TypeScript for Type Safety**: Use TypeScript interfaces to ensure type safety between server and client components.
