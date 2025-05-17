# Global State Management with Zustand

This directory contains the global state management solution for the Property Portal application using Zustand.

## Overview

We use Zustand for state management because it's:
- Lightweight and simple
- TypeScript-friendly
- Doesn't require providers or context
- Easy to test and debug

## Store Structure

The store is organized into logical sections:

1. **Map State** - For handling map-related state like selected locations
2. **Property Filters** - For managing property search filters
3. **UI State** - For managing UI-related state like sidebar visibility

## Type Safety

The store is strictly typed using TypeScript:

```typescript
// Define specific types for complex data
export type MapPosition = { 
  lat: number; 
  lng: number 
};

// Define the complete store type
export type Store = {
  selectedLocation: MapPosition | null;
  setSelectedLocation: (loc: MapPosition) => void;
  
  // ... other state and actions
};
```

## Usage Examples

### Basic Usage

```tsx
import { useStore } from '@/store/useStore';

function MyComponent() {
  // Get values and actions from the store
  const selectedLocation = useStore((state) => state.selectedLocation);
  const setSelectedLocation = useStore((state) => state.setSelectedLocation);
  
  // Use them in your component
  return (
    <button onClick={() => setSelectedLocation({ lat: 51.505, lng: -0.09 })}>
      Set Location
    </button>
  );
}
```

### Using Selector Hooks

For better performance and code organization, use the provided selector hooks:

```tsx
import { useMapStore } from '@/store/useStore';

function MyComponent() {
  // Get map-related state and actions
  const { selectedLocation, setSelectedLocation } = useMapStore();
  
  // Use them in your component
  return (
    <button onClick={() => setSelectedLocation({ lat: 51.505, lng: -0.09 })}>
      Set Location
    </button>
  );
}
```

## Best Practices

1. **Use Selector Hooks** - They help prevent unnecessary re-renders
2. **Keep Actions in the Store** - Logic for updating state should be in the store
3. **Use TypeScript** - Leverage TypeScript for type safety
4. **Keep State Minimal** - Only store what you need globally

## Adding New State

To add new state to the store:

1. Update the `Store` type definition
2. Add the initial state and actions to the store
3. Create a selector hook if needed
4. Use the state in your components