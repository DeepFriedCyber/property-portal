import { Metadata } from 'next'
import { Suspense } from 'react'

import PropertyCard from '@/components/PropertyCard'
import SearchInput from '@/components/SearchInput'
import { semanticPropertySearch } from '@/lib/semantic-search'

export const metadata: Metadata = {
  title: 'Semantic Search | Property Portal',
  description: 'Search for properties using AI-powered semantic search',
}

interface SearchPageProps {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''
  const results = query ? await semanticPropertySearch(query) : []

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Search Results</h1>

      <Suspense fallback={<div>Loading search...</div>}>
        <SearchInput />
      </Suspense>

      {query && (
        <p className="mb-4 text-gray-600">
          Showing semantically ranked results for:{' '}
          <span className="font-semibold">&quot;{query}&quot;</span>
        </p>
      )}

      {results.length === 0 ? (
        <p className="text-gray-500">No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map(property => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </main>
  )
}
