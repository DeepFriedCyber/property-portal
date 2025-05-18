'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import { useFilterStore } from '../store/filterStore'
import { useSearchStore } from '../store/searchStore'

import { SearchHistory } from './SearchHistory'

export const PropertySearch: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addQuery } = useSearchStore()
  const { query, setQuery } = useFilterStore()
  const [inputValue, setInputValue] = useState(query || searchParams.get('query') || '')

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Update the filter store
    setQuery(searchQuery)

    // Add to search history
    addQuery(searchQuery)

    // Navigate to search results
    router.push(`/properties?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(inputValue)
  }

  const handleSelectQuery = (selectedQuery: string) => {
    setInputValue(selectedQuery)
    handleSearch(selectedQuery)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Search properties..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <SearchHistory onSelectQuery={handleSelectQuery} />
    </div>
  )
}
