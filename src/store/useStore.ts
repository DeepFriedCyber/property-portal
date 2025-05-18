import { create } from 'zustand'

/**
 * Type definition for map position with latitude and longitude
 */
export type MapPosition = {
  lat: number
  lng: number
}

/**
 * Type definition for the global store
 */
export type Store = {
  // Map state
  selectedLocation: MapPosition | null
  setSelectedLocation: (loc: MapPosition) => void

  // Property filters
  filters: {
    minPrice: number | null
    maxPrice: number | null
    bedrooms: number | null
    propertyType: string | null
    location: string | null
  }
  setFilter: <K extends keyof Store['filters']>(key: K, value: Store['filters'][K]) => void
  resetFilters: () => void

  // UI state
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS = {
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  propertyType: null,
  location: null,
}

/**
 * Global store using Zustand with strict typing
 */
export const useStore = create<Store>(set => ({
  // Map state
  selectedLocation: null,
  setSelectedLocation: location => set({ selectedLocation: location }),

  // Property filters
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // UI state
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: isOpen => set({ isSidebarOpen: isOpen }),
}))

/**
 * Helper hooks for specific parts of the store
 */

// Hook for map-related state
export const useMapStore = () => {
  const selectedLocation = useStore(state => state.selectedLocation)
  const setSelectedLocation = useStore(state => state.setSelectedLocation)

  return { selectedLocation, setSelectedLocation }
}

// Hook for filter-related state
export const useFilterStore = () => {
  const filters = useStore(state => state.filters)
  const setFilter = useStore(state => state.setFilter)
  const resetFilters = useStore(state => state.resetFilters)

  return { filters, setFilter, resetFilters }
}

// Hook for UI-related state
export const useUIStore = () => {
  const isSidebarOpen = useStore(state => state.isSidebarOpen)
  const toggleSidebar = useStore(state => state.toggleSidebar)
  const setSidebarOpen = useStore(state => state.setSidebarOpen)

  return { isSidebarOpen, toggleSidebar, setSidebarOpen }
}
