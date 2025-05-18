import { create } from 'zustand'

type SearchStore = {
  history: string[]
  addQuery: (query: string) => void
  clearHistory: () => void
}

export const useSearchStore = create<SearchStore>(set => ({
  history: [],
  addQuery: query =>
    set(state => ({
      history: Array.from(new Set([query, ...state.history])).slice(0, 10),
    })),
  clearHistory: () => set({ history: [] }),
}))
