import { useState, useEffect, useRef } from 'react'

import { Property } from '@/types/property'

import PropertyCard from './PropertyCard'

export default function LoadMore({ initial, query }: { initial: Property[]; query: string }) {
  const [page, setPage] = useState(1)
  const [properties, setProperties] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!observerRef.current || !hasMore) return

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        setPage(prev => prev + 1)
      }
    })

    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [observerRef.current, loading, hasMore])

  useEffect(() => {
    if (page === 1) return

    const loadMore = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/properties?query=${encodeURIComponent(query)}&page=${page}`)
        if (!res.ok) throw new Error('Failed to fetch more properties')

        const data = await res.json()
        if (data.properties && Array.isArray(data.properties)) {
          if (data.properties.length === 0) {
            setHasMore(false)
          } else {
            setProperties(prev => [...prev, ...data.properties])
          }
        }
      } catch (error) {
        console.error('Error loading more properties:', error)
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    loadMore()
  }, [page, query])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="h-10 mt-6 text-center text-sm text-gray-400">
          {loading ? 'Loading more properties...' : 'Scroll to load more'}
        </div>
      )}

      {!hasMore && properties.length > 0 && (
        <p className="text-center mt-6 text-sm text-gray-500">No more properties to load</p>
      )}
    </>
  )
}
