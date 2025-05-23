// pages/search.tsx
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Property } from '../lib/getListings'
import { semanticSearch } from '../lib/search'

// Import our new semantic search component
const SemanticSearchComponent = dynamic(() => import('../components/search/SemanticSearch'), {
  ssr: false,
})

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const searchResults = await semanticSearch(query)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      alert('Error performing search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Semantic Property Search</h1>

      {/* Legacy search form - keep for backward compatibility */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Describe your ideal property..."
            className="flex-grow p-2 border rounded"
            aria-label="Search Properties"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Try: &quot;modern apartment in city center&quot; or &quot;family home with garden&quot;
        </p>
      </form>

      {/* Display legacy search results */}
      {results.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Showing results for: {query}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(property => (
              <div
                key={property.id}
                className="border rounded-lg overflow-hidden shadow-md"
                data-testid="property-card"
              >
                <div className="h-48 bg-gray-200 relative">
                  {property.images && property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image available
                    </div>
                  )}
<<<<<<< HEAD
                  <div
                    className="absolute bottom-0 right-0 bg-blue-500 text-white px-2 py-1 text-sm"
                    data-testid="similarity-score"
                  >
=======
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white px-2 py-1 text-sm">
>>>>>>> clean-branch
                    Similarity:{' '}
                    {(property.score !== undefined ? property.score * 100 : 0).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{property.title}</h3>
                  <p className="text-gray-600 mb-2" data-testid="property-location">
                    {property.location}
                  </p>
                  <p className="font-semibold text-lg mb-2" data-testid="property-price">
                    £{property.price.toLocaleString()}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="mr-3">{property.bedrooms} beds</span>
                    <span>{property.bathrooms} baths</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query && !loading ? (
        <div className="text-center py-8 text-gray-500" data-testid="no-results">
          No properties found matching your search.
        </div>
      ) : null}

      {/* New enhanced semantic search component */}
      <div className="mt-12 pt-12 border-t">
        <h2 className="text-2xl font-bold mb-6">Enhanced Semantic Search</h2>
        <SemanticSearchComponent />
      </div>
    </div>
  )
}
