import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PriceRange = {
  min: number | null
  max: number | null
}

type FilterStore = {
  query: string
  priceRange: PriceRange
  location: string | null
  propertyType: string | null

  setQuery: (query: string) => void
  setPriceRange: (range: PriceRange) => void
  setLocation: (location: string | null) => void
  setPropertyType: (type: string | null) => void
  resetFilters: () => void
}

const initialState = {
  query: '',
  priceRange: { min: null, max: null },
  location: null,
  propertyType: null,
}

export const useFilterStore = create<FilterStore>()(
  persist(
    set => ({
      ...initialState,

      setQuery: query => set({ query }),
      setPriceRange: priceRange => set({ priceRange }),
      setLocation: location => set({ location }),
      setPropertyType: propertyType => set({ propertyType }),
      resetFilters: () => set(initialState),
    }),
    {
      name: 'property-filters',
    }
  )
)
