'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import LoadMore from '@/components/LoadMore'
import Pagination from '@/components/Pagination'
import PropertyCard from '@/components/PropertyCard'
import SearchInput from '@/components/SearchInput'
import { Property } from '@/types/property'

interface SearchPageProps {
  properties: Property[]
  totalCount: number
  query: string
  page: number
  totalPages: number
}

export default function SearchPage({
  properties,
  totalCount,
  query,
  page,
  totalPages,
}: SearchPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const useInfiniteScroll = searchParams.get('scroll') === 'infinite'

  const toggleScrollMode = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (useInfiniteScroll) {
      params.delete('scroll')
    } else {
      params.set('scroll', 'infinite')
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Search Results</h1>

      <SearchInput />

      <div className="mb-4 flex justify-between items-center">
        <div>
          {query ? (
            <p className="text-gray-600">
              Found {totalCount} properties matching{' '}
              <span className="font-semibold">"{query}"</span>
            </p>
          ) : (
            <p className="text-gray-600">Showing all properties</p>
          )}
        </div>

        <button
          onClick={toggleScrollMode}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          {useInfiniteScroll ? 'Switch to Pagination' : 'Switch to Infinite Scroll'}
        </button>
      </div>

      {properties.length === 0 ? (
        <p className="text-gray-500 py-10 text-center">
          No properties found. Try a different search term.
        </p>
      ) : useInfiniteScroll ? (
        <LoadMore initial={properties} query={query} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {properties.map(property => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl={`/search?q=${encodeURIComponent(query)}&page=`}
            />
          )}
        </>
      )}
    </main>
  )
}