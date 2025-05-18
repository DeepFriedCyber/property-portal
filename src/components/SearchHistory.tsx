'use client'

import React from 'react'
import { useSearchStore } from '../store/searchStore'

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelectQuery }) => {
  const { history, clearHistory } = useSearchStore()

  if (history.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Recent searches</h3>
        <button onClick={clearHistory} className="text-xs text-blue-600 hover:text-blue-800">
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map(query => (
          <button
            key={query}
            onClick={() => onSelectQuery(query)}
            className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  )
}
